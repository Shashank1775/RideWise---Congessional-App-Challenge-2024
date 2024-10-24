import { useEffect, useState } from "react";
import { APIProvider, Map, useMapsLibrary, useMap, Marker } from "@vis.gl/react-google-maps";
import { motion, AnimatePresence } from 'framer-motion';
import { EmailClient } from '@azure/communication-email';
import axios from "axios";
import React from "react";

let busStopCords;
let homeCords;

async function findClosestPoint(address, routePoints) {
  const addressCoords = await geocodeAddress(address);
  homeCords = addressCoords;

  if (!addressCoords) {
    return null;
  }

  // Optimization: Use reduce instead of a for loop
  const closest = routePoints.reduce((closestPoint, currentPoint) => {
    const distance = haversineDistance(
      addressCoords.lat,
      addressCoords.lng,
      currentPoint.lat,
      currentPoint.lng
    );

    if (distance < closestPoint.distance) {
      return { point: currentPoint, distance };
    } else {
      return closestPoint;
    }
  }, { point: null, distance: Infinity });

  console.log("Closest Point:", closest.point);
  busStopCords = closest.point;
  return closest.point;
}


function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

async function geocodeAddress(address) {
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ address });

  if (response.results[0]) {
    const { lat, lng } = response.results[0].geometry.location;
    return { lat: lat(), lng: lng() };
  } else {
    console.error("Geocoding failed:", response);
    return null;
  }
}

const parseCoordinates = (coordinates) => {
  const [lat, lng] = coordinates.split(" ").map(Number);
  return { lat, lng };
};

export default function AddBus({ cords, parentAddress, user, busNumbers }) {
  const [busCoordinates, setBusCoordinates] = useState({});
  const [closestStops, setClosestStops] = useState({}); // Store closest stops for each bus
  const [parentCords, setParentCords] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);

  const [latestLocations, setLatestLocations] = useState({}); 
  console.log("Latest Locations:", latestLocations);

  useEffect(() => {
    const getBusNumbers = async () => {
      try {
        const response = await axios.get("/api/busRouteCreation", {
          params: { busNumber: busNumbers },
          paramsSerializer: (params) => {
            return new URLSearchParams(params).toString(); 
          },
        });

        const coordinatesByBus = {};
        const stopsByBus = {}; // Store closest stops for each bus

        response.data.forEach(bus => {
          const { busNumber, routeStops } = bus;

          coordinatesByBus[busNumber] = routeStops.map(stop => ({
            lat: stop.coordinates.lat,
            lng: stop.coordinates.lng,
          }));

          // Find closest stop for this bus
          findClosestPoint(parentAddress, coordinatesByBus[busNumber])
            .then(closestPoint => {
              stopsByBus[busNumber] = closestPoint; 
              setClosestStops(stopsByBus); // Update closestStops state
            });
        });

        setBusCoordinates(coordinatesByBus); 

      } catch (error) {
        console.error("Error fetching bus numbers:", error);
      }
    };

    if (busNumbers) {
      getBusNumbers();
    }
  }, [busNumbers, parentAddress]);


  // Directions component to calculate and display routes for multiple buses
  function Directions({ route, color, index }) { // Add index prop
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const [directionsService, setDirectionsService] = useState();
    const [directionsRenderer, setDirectionsRenderer] = useState();

    useEffect(() => {
      if (!map || !routesLibrary) return;
      setDirectionsService(new routesLibrary.DirectionsService());
      const renderer = new routesLibrary.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 5,
        },
        preserveViewport: true,
      });
      setDirectionsRenderer(renderer);
      setIsLoaded(true);
    }, [map, routesLibrary, color]);

    useEffect(() => {
      if (directionsService && directionsRenderer && cords && cords[index]) {
        // Parse the coordinates for this bus route from cords using the index
        const stopCoordinates = cords[index].map((location) => parseCoordinates(location));

        directionsService.route({
          origin: stopCoordinates[0], // First stop as the origin
          destination: stopCoordinates[stopCoordinates.length - 1], // Last stop as the destination
          waypoints: stopCoordinates.slice(1, stopCoordinates.length - 1).map(coord => ({ location: coord })), // Midway stops as waypoints
          travelMode: "DRIVING",
        }).then((response) => {
          directionsRenderer.setDirections(response);
        }).catch((error) => console.error('Directions request failed:', error));
      }
    }, [directionsRenderer, directionsService, index, cords]); // Add index and cords to the dependency array

    return null;
  }

  function BusMarker({ location }) {
    return <Marker position={location} />;
  }

  const mapCenter = { lat: 36.18557312430002, lng: -86.50290222317327 }; // Default map center
  const colors = {
    bus1: "#FF0000", // Example color mapping for buses
  };

  useEffect(() => {
    // Update latestLocations for all buses when cords changes
    const newLatestLocations = {};
    cords.forEach((busRoute, index) => {
      if (busRoute && busRoute.length > 0) {
        const parsedCords = busRoute.map((cord) => parseCoordinates(cord));
        newLatestLocations[index] = parsedCords[parsedCords.length - 1]; // Store by index
      }
    });
    setLatestLocations(newLatestLocations);
  }, [cords]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="w-full p-4 bg-gray-100 rounded-lg shadow-lg"
    >
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ height: "42vw", width: "100%", position: "relative" }} 
          className="mb-4 rounded-lg overflow-hidden shadow-xl"
        >
          <AnimatePresence>
            {!isLoaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <Map
            defaultZoom={12}
            defaultCenter={mapCenter}
            style={{ height: "100%", width: "100%" }}
            onLoad={() => setIsLoaded(true)}
          >
            {Object.keys(busCoordinates).map((busNumber, index) => (
              <React.Fragment key={busNumber}>
                <Directions
                  route={busCoordinates[busNumber]}
                  color={colors[`bus${busNumber}`] || colors.bus1}
                  index={index}
                />
                {closestStops[busNumber] && (
                  <Marker 
                    position={closestStops[busNumber]} 
                    icon={{
                      url: "https://maps.google.com/mapfiles/kml/shapes/caution.png",
                      scaledSize: new window.google.maps.Size(20, 20),
                    }} 
                  />
                )}
                {homeCords && (
                  <Marker 
                    position={homeCords} 
                    icon={{
                      url: "https://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png",
                      scaledSize: new window.google.maps.Size(20, 20), 
                    }}
                  /> 
                )}
                {latestLocations[index] && (
                  <Marker
                    position={latestLocations[index]}
                    icon={{
                      url: "https://maps.google.com/mapfiles/kml/shapes/bus.png",
                      scaledSize: new window.google.maps.Size(30, 30),
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Map>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg"
          >
            {distance && eta ? (
              <>
                <p className="text-lg font-semibold">Distance: <span className="font-normal">{distance}</span></p>
                <p className="text-lg font-semibold">ETA: <span className="font-normal">{eta}</span></p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">Distance: <span className="font-normal">1.1 Miles</span></p>
                <p className="text-lg font-semibold">ETA: <span className="font-normal">8 Minutes</span></p>
              </>            )}
          </motion.div>
        </motion.div>
      </APIProvider>
    </motion.div>
  );
}
