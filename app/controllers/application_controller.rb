class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  def index
  end

  def agencies
    render :json => Transit.get_agencies
  end

  def routes
    render :json => Transit.get_routes(params[:agency])
  end

  def directions
    render :json => Transit.get_directions
  end

  def stops
    route = params[:route]
    direction = params[:direction]=="---" ? nil : params[:direction]
    render :json => Transit.get_stops(route, direction)
  end

  def departures
    render :json => Transit.get_departures(params[:stop])
  end

  def saved
    @route = params[:route]
    @stop = params[:stop]
    @distance = params[:distance]
    parsed_departures = []
    foreign_params={token: ENV['TOKEN'], stopcode: @stop}.to_query
    url = "http://services.my511.org/Transit2.0/GetNextDeparturesByStopCode.aspx?#{foreign_params}"
    p url
    doc = Nokogiri::XML(open(url))
    departures = doc.search("//Route[@Code='#{@route}']").xpath(".//DepartureTime")
    departures.each do |departure|
      parsed_departures << departure.text.to_i
    end
    parsed_departures.reject!{|i| i<=@distance.to_i || i > 30}
    @departure = parsed_departures.empty? ? nil : parsed_departures.min-@distance.to_i
    case @departure
    when 1..6
      @advisory="GO."
      @class = 'go'
    when 7..30
      @advisory="YOU'D BE EARLY."
      @class = 'early'
    else
      @advisory="STAY."
      @class = 'stay'
    end
    @route_name = doc.search("//Route[@Code=#{@route}]").attr('Name')
    @stop_name = doc.search("//Stop[@StopCode=#{@stop}]").attr('name')
  end

end
