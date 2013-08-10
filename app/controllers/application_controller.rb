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
    @class='go'
  end

end
