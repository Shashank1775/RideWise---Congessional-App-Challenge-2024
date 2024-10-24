import { useEffect, useState } from "react";
import { APIProvider, Map, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import axios from 'axios';
import useAuth from "@/contexts/checkAuthStatus";

export default function AddBus() {
  const [busRoutes, setBusRoutes] = useState([]); // Holds multiple routes with stops data
  const [mapCenter, setMapCenter] = useState({ lat: 37.774929, lng: -122.419416 });
  const [colors, setColors] = useState({});
  const [selectedBus, setSelectedBus] = useState(null); // Holds the selected bus route for the popup
  const { user } = useAuth();

  useEffect(() => {
    // Fetch bus routes data
    if(user){
      axios.get("/api/busRouteCreation", {params:{ districtCode: user.userDistrictCode }}).then((response) => {
        const routes = response.data;
        setBusRoutes(routes);
  
        // Assign a random color to each bus route
        const assignedColors = {};
        routes.forEach((route) => {
          assignedColors[route._id] = getRandomColor();
        });
        setColors(assignedColors);
      });
    }
  }, [user]);

  // Function to generate a random color for each route
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Directions component to calculate and display routes for multiple buses
  function Directions({ route, color }) {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const [directionsService, setDirectionsService] = useState();
    const [directionsRenderer, setDirectionsRenderer] = useState();
    console.log(route)
    useEffect(() => {
      if (!map || !routesLibrary) return;
      setDirectionsService(new routesLibrary.DirectionsService());
      const renderer = new routesLibrary.DirectionsRenderer({ 
        map, 
        polylineOptions: { 
          strokeColor: color ,
          strokeWeight: route !== selectedBus ? 2 : 6,
          strokeOpacity: route !== selectedBus ? 0.5 : 1,
        } 
      });
      setDirectionsRenderer(renderer);
    }, [map, routesLibrary, color]);

    useEffect(() => {
      if (!directionsService || !directionsRenderer || route.routeStops.length < 2) return;

      // Extracting coordinates from route stops
      const stopCoordinates = route.routeStops.map((stop) => ({
        lat: stop.coordinates.lat,
        lng: stop.coordinates.lng,
      }));

      // Calculate the directions
      directionsService.route({
        origin: stopCoordinates[0], // First stop as the origin
        destination: stopCoordinates[stopCoordinates.length - 1], // Last stop as the destination
        waypoints: stopCoordinates.slice(1, stopCoordinates.length - 1).map(coord => ({ location: coord })), // Midway stops as waypoints
        travelMode: "DRIVING",
      }).then((response) => {
        directionsRenderer.setDirections(response);
      });
      const color = colors[route._id];
      route.routeStops.forEach((stop, index) => {
        new window.google.maps.Marker({
          position: { lat: stop.coordinates.lat, lng: stop.coordinates.lng },
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE, 
            scale: 6, // Adjust size as needed
            fillColor: color, // Use bus route color
            fillOpacity: 1,
            strokeColor: "black",
            strokeWeight: 1,
          },
        });
      });

    }, [directionsRenderer, directionsService, route.routeStops]);

    return null;
  }

  // Handle click on bus name in legend
  const handleBusClick = (route) => {
    setSelectedBus(route); // Set the selected bus for displaying the popup
  };

  // Legend Component to display bus routes with their colors
  const Legend = () => {
    const columns = Math.ceil(busRoutes.length / 5); // Calculate number of columns needed
    const rows = Array.from({ length: columns }, (_, colIndex) => (
      busRoutes.slice(colIndex * 5, colIndex * 5 + 5) // Get five routes per column
    ));

    return (
      <div className="legend">
        <h3>Bus Routes</h3>
        <div className="flex flex-wrap">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="w-1/5"> {/* Each column takes 1/5 of the width */}
              {row.map(route => (
                <div key={route._id} className="flex items-center mb-2">
                  <span
                    style={{
                      backgroundColor: colors[route._id],
                      display: "inline-block",
                      width: "20px",
                      height: "10px",
                      marginRight: "8px",
                    }}
                    onClick={() => handleBusClick(route)}
                  />
                  <span
                    style={{
                      cursor: 'pointer',
                    }}
                    onClick={() => handleBusClick(route)}
                  >
                    {route.busNumber} - {route.routeName}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-1">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <div style={{ height: "500px", width: "100%", position: "relative" }} className="mb-4">
          <Map
            defaultZoom={12}
            defaultCenter={mapCenter} // Set the center of the map dynamically
            style={{ height: "100%", width: "100%" }}
            mapTypeControlOptions={false}
            
          >
            {busRoutes.map((route, index) => (
              <Directions key={index} route={route} color={colors[route._id]} />
            ))}
          </Map>
        </div>
        <div className="flex flex-col md:flex-row justify-between p-6 bg-gray-100 space-y-4 md:space-y-0 md:space-x-6">
  {/* Display popup with bus details when a bus is clicked in the legend */}
  {selectedBus && (
    <div className="bg-white border border-gray-300 shadow-md p-6 rounded-lg w-full md:w-1/3">
      <h4 className="font-bold text-xl mb-2 text-gray-800">Bus Number: {selectedBus.busNumber}</h4>
      <p className="text-gray-700 mb-1">Route Name: {selectedBus.routeName}</p>
      <p className="text-gray-700">Number of Stops: {selectedBus.routeStops.length}</p>
    </div>
  )}
  
  {/* Legend component placed on the other side */}
  <div className="w-full md:w-2/3">
    <Legend />
  </div>
</div>
      </APIProvider>
    </div>
  );
}
