require 'open-uri'
class Transit
  def self.get_agencies
    url = "http://services.my511.org/Transit2.0/GetAgencies.aspx?token="+ENV['TOKEN']
    doc = Nokogiri::XML(open(url))
    agencies = []
    doc.xpath('//Agency').each do |element|
      agencies << element.attr('Name').strip
    end
    agencies
  end

  def self.get_routes(agency)
    parsed_routes = {}
    params={token: ENV['TOKEN'], agencyName: agency}.to_query
    url = "http://services.my511.org/Transit2.0/GetRoutesForAgency.aspx?#{params}"
    doc = Nokogiri::XML(open(url))
    routes = doc.xpath('//Route')
    routes.each do |route|
      name = route.attr('Name').strip
      code = route.attr('Code').strip
      route_directions = route.xpath('.//RouteDirection')
      parsed_directions = {}
      route_directions.each{|rd| parsed_directions[rd.attr('Code')]=rd.attr('Name')}
      parsed_routes[code]={name: name, directions: parsed_directions}
    end
    parsed_routes.to_json
  end

  def self.get_stops(agency, route, direction)
    parsed_stops = {}
    routeIDF="#{agency}~#{route}"
    routeIDF += "~#{direction}" if direction
    params= {token: ENV['TOKEN'], routeIDF: routeIDF}.to_query
    url = "http://services.my511.org/Transit2.0/GetStopsForRoute.aspx?#{params}"
    doc = Nokogiri::XML(open(url))
    stops = doc.xpath('//Stop')
    stops.each do |stop|
      name = stop.attr('name')
      code = stop.attr('StopCode')
      parsed_stops[code]=name
    end
    parsed_stops.to_json
  end

  def self.get_departures(route, stop)
    parsed_departures = []
    params={token: ENV['TOKEN'], stopcode: stop}.to_query
    url = "http://services.my511.org/Transit2.0/GetNextDeparturesByStopCode.aspx?#{params}"
    doc = Nokogiri::XML(open(url))
    departures = doc.search("//Route[@Code='#{route}']").xpath(".//DepartureTime")
    departures.each do |departure|
      parsed_departures << departure.text.to_i
    end
    return parsed_departures
  end
end
