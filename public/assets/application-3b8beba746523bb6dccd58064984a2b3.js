var currentResponse,departures,getAgencies=function(){request=$.get("/agencies"),request.success(function(e){parseAgencies(e)})},parseAgencies=function(e){$("#agencies").append("<option>---</option>"),_.each(e,function(e){console.log(e),$("#agencies").append("<option value='"+e+"'>"+e+"</option>")})},getRoutes=function(){agency=$("#agencies").val(),request=$.get("/routes",{agency:agency}),request.success(function(e){currentResponse=e,console.log(currentResponse),parseRoutes(e)})},parseRoutes=function(e){$("#direction").css("display","none"),$("#stops").css("display","none"),$("#distance").css("display","none"),$("#routes").html(""),$("#routes").append("<option value=>---</option>");for(var t in e)$("#routes").append("<option value='"+t+"'>"+e[t].name+"</option>");$("#routes").css("display","inline")},parseDirection=function(){$("#distance").css("display","none"),$("#direction").html(""),$("#direction").append("<option>---</option>"),$("#stops").css("display","none"),route=$("#routes option:selected").val(),routeData=currentResponse[route],routeDirections=routeData.directions;for(var e in routeDirections)name=routeDirections[e],code=e,$("#direction").append("<option value='"+code+"'>"+name+"</option>");$("#direction").children().length>1?$("#direction").css("display","inline"):getStops()},getStops=function(){agency=$("#agencies").val(),route=$("#routes").val(),direction=$("#direction").val(),request=$.get("/stops",{agency:agency,route:route,direction:direction}),request.success(function(e){parseStops(e)})},parseStops=function(e){$("#distance").css("display","none"),$("#stops").html(""),$("#stops").append("<option>---</option>");for(var t in e)name=e[t],code=t,$("#stops").append("<option value='"+code+"'>"+name+"</option>");$("#stops").css("display","inline")},getDepartures=function(){route=$("#routes").val(),stop=$("#stops").val(),request=$.get("/departures",{stop:stop,route:route}),request.done(function(e){departures=e,parseDepartures(e)})},parseDepartures=function(){$("#distance").css("display","inline"),distance=Number($("#distance input").val()),body=$(document).find("body"),adjustedDepartures=_.map(departures,function(e){return Number(e)-distance}),adjustedDepartures=_.reject(adjustedDepartures,function(e){return Number(e)<1||Number(e)>=30}),console.log(adjustedDepartures),0==adjustedDepartures.length?($(body).removeClass().addClass("stay"),$("#message").text("STAY."),$("#explanation").text("No departures in the next half-hour.")):(nextDeparture=_.min(adjustedDepartures),minutes=nextDeparture>1?" minutes ":" minute ",6>nextDeparture?($(body).removeClass().addClass("go"),$("#message").text("GO."),$("#explanation").text("Departs "+nextDeparture+minutes+"after you get to the stop.")):($(body).removeClass().addClass("early"),$("#message").text("YOU'D BE EARLY."),$("#explanation").text("Departs "+nextDeparture+minutes+"after you get to the stop.")))};$(document).ready(function(){getAgencies(),$("#agencies").change(getRoutes),$("#routes").change(parseDirection),$("#direction").change(getStops),$("#stops").change(getDepartures),$("#distance").change(parseDepartures)});