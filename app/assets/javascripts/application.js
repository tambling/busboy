var currentResponse;
var departures;
// function Router(){
//  agencyNode = $('#agencies')
// }

// Router.prototype.getAgencies = function(){

// }

// Route.prototype = {
//  // body...
//  put: function(function(){
//    // body...
//  }).bind(this),
// };

var getAgencies= function(){
  request = $.get('/agencies')
  request.success(function(response){
    parseAgencies(response);
  });
};
var parseAgencies = function(list){
  $('#agencies').append('<option>---</option>')
  _.each(list, function(name,i){
    console.log(name)
    $("#agencies").append("<option value='"+name+"'>"+name+"</option>")
  });
};


var getRoutes = function(){
  agency=$('#agencies').val();
  request = $.get("/routes", {agency: agency})
  request.success(function(response){
    currentResponse=response
    console.log(currentResponse)
    parseRoutes(response)
  });
}
var parseRoutes=function(list){
  $('#direction').css("display", "none")
  $('#stops').css("display", "none")
  $('#distance').css('display','none');
  $("#routes").html("")
  $('#routes').append('<option value=>---</option>')
  for(var route in list){
    $("#routes").append("<option value='"+route+"'>"+list[route].name+"</option>")
  }
  $('#routes').css("display", "inline")
};

var parseDirection =function(){
  $('#distance').css('display','none');
  $("#direction").html("")
  $('#direction').append('<option>---</option>')
  $('#stops').css('display', 'none')
  route = $("#routes option:selected").val()
  routeData = currentResponse[route]
  routeDirections = routeData.directions
  for(var direction in routeDirections){
    name= routeDirections[direction]
    code= direction
    $("#direction").append("<option value='"+code+"'>"+name+"</option>")
  };
  if($('#direction').children().length>1){
    $('#direction').css("display", "inline")
  } else{
    getStops();
  }
};

var getStops = function(){
  agency=$('#agencies').val();
  route = $('#routes').val();
  direction = $('#direction').val()
  request = $.get('/stops', {agency: agency, route: route, direction: direction});
  request.success(function(response){
    parseStops(response)
    // parseStops(response)
  });
};

var parseStops=function(list){
  $('#distance').css('display','none');
  $("#stops").html("")
  $('#stops').append('<option>---</option>')
  for(var stop in list){
    name= list[stop]
    code= stop
    $("#stops").append("<option value='"+code+"'>"+name+"</option>")
  };
  $('#stops').css("display", "inline")
};

var getDepartures = function(){
  route = $('#routes').val()
  stop = $('#stops').val();
  request = $.get('/departures', {stop: stop, route: route})
  request.done(function(response){
    departures = response;
    parseDepartures(response);
  });
};

var parseDepartures = function(){
  $('#distance').css('display','inline');
  distance = Number($('#distance input').val());
  body = $(document).find('body')
  adjustedDepartures = _.map(departures, function(time){return Number(time)-distance})
  adjustedDepartures = _.reject(adjustedDepartures, function(time){return Number(time)<1 || Number(time)>=30});
  console.log(adjustedDepartures)
  if (adjustedDepartures.length==0){
    $(body).removeClass().addClass('stay');
    $('#message').text("STAY.");
    $('#explanation').text("No departures in the next half-hour.")
  } else{
    nextDeparture = _.min(adjustedDepartures);
    minutes = nextDeparture>1?" minutes ":" minute ";
    if (nextDeparture<6){
      $(body).removeClass().addClass('go');
      $('#message').text("GO.");
      $('#explanation').text('Departs '+nextDeparture+minutes+'after you get to the stop.')
    } else{
      $(body).removeClass().addClass('early');
      $('#message').text("YOU'D BE EARLY.");
      $('#explanation').text('Departs '+nextDeparture+minutes+"after you get to the stop.")
    };
  };
};



$(document).ready(function(){
  getAgencies();
  $('#agencies').change(getRoutes);
  $('#routes').change(parseDirection);
  $('#direction').change(getStops);
  $('#stops').change(getDepartures);
  $('#distance').change(parseDepartures)
});
