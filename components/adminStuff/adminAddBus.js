import { useEffect, useState, useMemo } from "react";
import { APIProvider, Map, Marker, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import useAuth from "@/contexts/checkAuthStatus";

export default function AddBus() {
  const [busNumber, setBusNumber] = useState("");
  const [routeName, setRouteName] = useState("");
  const [stops, setStops] = useState([]); // Holds stops with coordinates and names
  const [mapCenter, setMapCenter] = useState({ lat: 36.18557312430002, lng: -86.50290222317327 });
  const [routeData, setRouteData] = useState([]);
  const [editingRouteId, setEditingRouteId] = useState(null); // To track the route being edited
  const { user } = useAuth();

  const handleEdit = (route) => {
    console.log(route);
    setBusNumber(route.busNumber);
    setRouteName(route.routeName);
    setStops(route.routeStops);
    setEditingRouteId(route._id); // Set the ID of the route being edited
  };

  useEffect(() => {
    // Fetch bus routes from the database
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('/api/busRouteCreation', { params: { districtCode: user.userDistrictCode } });
        setRouteData(response.data);
      } catch (error) {
        console.error('Failed to fetch bus routes', error);
      }
    };
    if(user){
      console.log(user)
      fetchRoutes();
    }
  }, [user]);

  const clearMap = () => {
    setStops([]);
    setTotalDistance("");
    setTotalDuration("");
    setBusNumber("");
    setRouteName("");
    setEditingRouteId(null)
  }

  // Function to snap coordinates to the nearest road
  const snapToRoad = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://roads.googleapis.com/v1/snapToRoads?path=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        console.error('Snap to Road API error', response.statusText);
        return { lat, lng }; // Return original coordinates on failure
      }

      const data = await response.json();
      if (data?.snappedPoints?.length > 0) {
        const snappedPoint = data.snappedPoints[0].location;
        return {
          lat: snappedPoint.latitude,
          lng: snappedPoint.longitude,
        };
      }

      return { lat, lng }; // Return original coordinates if no points were snapped
    } catch (error) {
      console.error('Error snapping to road:', error);
      return { lat, lng }; // Return original coordinates on error
    }
  };


  // Function to add a stop on map click
  const addStop = async (lat, lng) => {
    const snappedPoint = await snapToRoad(lat, lng);
    setStops((prevStops) => [
      ...prevStops,
      {
        stopName: "",
        stopNumber: prevStops.length + 1,
        arrivalTime: "", // Will calculate later
        coordinates: snappedPoint
      }
    ]);
  };

// Function to delete a stop
const deleteStop = (indexToDelete) => {
  setStops((prevStops) => {
    const updatedStops = prevStops.filter((_, index) => index !== indexToDelete);
    console.log(updatedStops, indexToDelete); // Log the updated stops and the index deleted
    return updatedStops; // Return the updated list of stops
  });
};


// Function to reorder stops via drag-and-drop
const moveStop = (dragIndex, hoverIndex) => {
  const updatedStops = [...stops];
  const [draggedStop] = updatedStops.splice(dragIndex, 1);
  updatedStops.splice(hoverIndex, 0, draggedStop);
  setStops(updatedStops); // This will trigger a re-render
};

const [totalDistance, setTotalDistance] = useState('');
const [totalDuration, setTotalDuration] = useState('');

function Directions() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState();
  const [previousRenderers, setPreviousRenderers] = useState([]); 
  const stopCoordinates = stops.map(stop => stop.coordinates);

  useEffect(() => {
    if (!map || !routesLibrary) return;

    const service = new routesLibrary.DirectionsService();
    setDirectionsService(service);

  }, [map, routesLibrary]);

  useEffect(() => {
    if (!directionsService || stops.length < 2) return;

    // Create a new DirectionsRenderer for each route
    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: 'blue', 
        strokeOpacity: 1.0,
        strokeWeight: 5,
      },
    });

    // Make previous renderers invisible
    previousRenderers.forEach((renderer) => {
      renderer.setOptions({
        polylineOptions: { visible: false } 
      });
    });

    directionsService.route({
      origin: stops[0].coordinates,
      destination: stops[stops.length - 1].coordinates,
      waypoints: stops.slice(1, stops.length - 1).map(stop => ({ location: stop.coordinates })),
      travelMode: "DRIVING"
    }).then((response) => {
      renderer.setDirections(response); // Render on the new renderer
      const route = response.routes?.[0];

      if (route && route.legs) {
        let totalDistance = 0;
        let totalDuration = 0;

        route.legs.forEach(leg => {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        });

        const totalDistanceMiles = totalDistance / 1609.34; 
        const totalDurationMinutes = totalDuration / 60; 

        setTotalDistance(`${totalDistanceMiles.toFixed(2)} miles`);
        setTotalDuration(`${totalDurationMinutes.toFixed(2)} minutes`);

        console.log("Total distance:", totalDistanceMiles, "miles", "Total duration:", totalDurationMinutes, "minutes");
      }

      setPreviousRenderers((prev) => [...prev, renderer]);
    }).catch((error) => {
      console.error("Directions request failed due to", error);
    });

    // Clean up the renderer when the component unmounts or stops change
    return () => {
      renderer.setMap(null); 
    };
  }, [directionsService, stops]); 

  return null;
}




// Render original markers elsewhere
function MapMarkers() {
  const map = useMap();
  
  useEffect(() => {
      if (!map) return;

      // Clear any existing markers
      const markers = stops.map(stop => {
          return new google.maps.Marker({
              position: stop.coordinates,
              map: map,
              title: stop.title // Optional: set a title for each marker
          });
      });

      // Return a cleanup function to remove markers if needed
      return () => {
          markers.forEach(marker => marker.setMap(null));
      };
  }, [map, stops]);

  return null; // No explicit return needed, but can return JSX if needed
}

  // Handle form submit
  const onSubmit = async (e) => {
    e.preventDefault();
    if(!busNumber || !routeName || stops.length < 2) return;
    if(editingRouteId) {
      try {
        const updatedRoute = {
          busNumber,
          routeName,
          routeStops: stops
        };
        const districtCode = user.userDistrictCode
        await axios.put('/api/busRouteCreation', { id: editingRouteId, updatedInfo: updatedRoute, districtCode: districtCode });
        const updatedRoutes = routeData.map(route => {
          if(route._id === editingRouteId) {
            return updatedRoute;
          }
          return route;
        });
        setRouteData(updatedRoutes);
        setEditingRouteId(null);
        setTotalDistance("");
        setTotalDuration("");
        setBusNumber("");
        setRouteName("");
        setStops([]);

        alert('Bus route updated successfully');
      } catch (error) {
        console.error('Failed to update route', error);
        alert('Failed to update route');
      }
      return
    }
    try {
      const districtCode = user.userDistrictCode
      const newRoute = {
        busNumber,
        routeName,
        routeStops: stops,
        districtCode: districtCode
      };
      console.log(newRoute)
      await axios.post('/api/busRouteCreation', newRoute);
      setRouteData([...routeData, newRoute]);
      // Clear form fields and stops
      setTotalDistance("");
      setTotalDuration("");
      setBusNumber("");
      setRouteName("");
      setStops([]);

      clearMap();

      alert('Bus route added successfully');
    } catch (error) {
      console.error('Failed to add route', error);
      alert('Failed to add route');
    }
  };

  const handleDelete = async (id) => {
    console.log(id);
    axios.delete('/api/busRouteCreation', { data: { id } })

    setTotalDistance("");
    setTotalDuration("");
    setBusNumber("");
    setRouteName("");
    setStops([]);
    setStops([]);

    const updatedRoutes = routeData.filter(route => route._id !== id);
    setRouteData(updatedRoutes);

    alert('Bus route deleted successfully');
  };

  return (
    <div>
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <div className="p-4">
        <h1 className="text-xl mb-4">Add a New Bus Route</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Bus Number Input */}
          <input
            type="text"
            placeholder="Bus Number"
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded w-full"
          />

          {/* Route Name Input */}
          <input
            type="text"
            placeholder="Route Name"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded w-full"
          />

          {/* Map Component to Add Stops */}
          <div style={{ height: "400px", width: "100%", position: "relative" }}>
            <Map
              defaultZoom={12}
              defaultCenter={mapCenter}
              onClick={(e) => addStop(e.detail.latLng.lat, e.detail.latLng.lng)}
              style={{ height: "100%", width: "100%" }}
            >
              <MapMarkers />
              <Directions />
            </Map>
          </div>

          {/* Stops List */}
          <DndProvider backend={HTML5Backend}>
            <ul className="space-y-2">
              {stops.map((stop, index) => (
                <StopItem
                  key={index}
                  stop={stop}
                  index={index}
                  moveStop={moveStop}
                  onStopNameChange={(name) => {
                    const updatedStops = [...stops];
                    updatedStops[index].stopName = name;
                    setStops(updatedStops);
                  }}
                  onDelete={() => deleteStop(index)}
                />
              ))}
            </ul>
          </DndProvider>

          {totalDistance && totalDuration && (
            <div className="bg-white p-4 mt-4 rounded shadow">
              <h2 className="text-lg font-semibold">Route Details</h2>
              <p>Total Distance: {totalDistance}</p>
              <p>Total Duration: {totalDuration}</p>
            </div>
          )}
            

          <button onClick={clearMap} className="p-2 bg-red-500 text-white rounded">
            Clear Map
          </button>

          {/* Submit Form */}
          <button type="submit" className="p-2 bg-green-500 text-white rounded ml-2">
            Submit Route
          </button>
        </form>
      </div>
    </APIProvider>
    <div className="p-4">
      <h2 className="text-xl font-semibold mt-8 mb-2">Existing Bus Routes</h2>
      <div className="grid grid-cols-3 gap-4">
        {routeData.map((route) => (
          <div key={route._id} className="bg-white p-4 rounded shadow" onClick={()=>handleEdit(route)}>
            <span className="flex justify-between">
            <h3 className="text-lg font-semibold">{route.busNumber}</h3>
            <button className="text-red-500 hover:text-red-600 hover:scale-105 transition-transform" onClick={() => handleDelete(route._id)}>x</button>
            </span>
            <p>{route.routeName}</p>
            <p>{route.routeStops.length} stops</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

// StopItem component with drag-and-drop and delete functionality
function StopItem({ stop, index, moveStop, onStopNameChange, onDelete }) {
  const [, ref] = useDrop({
    accept: "stop",
    hover: (item) => {
      if (item.index !== index) {
        moveStop(item.index, index);
      }
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: "stop",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <li ref={(node) => drag(ref(node))} className={`bg-gray-200 p-2 rounded flex justify-between items-center ${isDragging ? "opacity-50" : ""}`}>
      <input
        type="text"
        placeholder="Stop Name"
        value={stop.stopName}
        onChange={(e) => onStopNameChange(e.target.value)}
        className="p-2 border border-gray-300 rounded w-2/3"
      />
      <span>Stop #{index + 1}</span>
      <button onClick={onDelete} className="text-red-600 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.741-2.531l.841-10.518.148.022a.75.75 0 1 0 .23-1.482 128.385 128.385 0 0 0-2.365-.298V3.75A2.75 2.75 0 0 0 11.25 1H8.75zM7.5 3.75A1.25 1.25 0 0 1 8.75 2.5h2.5A1.25 1.25 0 0 1 12.5 3.75v.379a133.77 133.77 0 0 0-5 0V3.75zm-2.065 2.495c1.932-.263 3.88-.395 5.823-.395 1.943 0 3.89.132 5.822.395l-.835 10.434a1.25 1.25 0 0 1-1.245 1.151H7.595a1.25 1.25 0 0 1-1.244-1.15L5.435 6.245zM8.5 8a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 8.5 8zm3 0a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75z" clipRule="evenodd"/>
        </svg>
      </button>
    </li>
  );
}
