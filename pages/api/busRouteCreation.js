import mongoose from 'mongoose';
import NewBusRoute from '@/models/newBusRoute';
import NewStudent from '@/models/newStudents';

// Connect to MongoDB
async function mongooseConnect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise();
  } else {
    const uri = process.env.MONGODB_URI;
    return mongoose.connect(uri);
  }
}

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  // Create a new bus route
  if (method === 'POST') {
    try {
      const { busNumber, routeName, routeStops, districtCode } = req.body;

      // Ensure routeStops includes coordinates for each stop
      const formattedStops = routeStops.map(stop => ({
        stopName: stop.stopName,
        stopNumber: stop.stopNumber,
        arrivalTime: stop.arrivalTime,
        coordinates: {
          lat: stop.coordinates.lat,
          lng: stop.coordinates.lng,
        },
      }));

      const newRoute = await NewBusRoute.create({ busNumber, routeName, routeStops: formattedStops, districtCode });
      res.status(201).json(newRoute);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create new bus route', error });
    }
  }

  // Edit an existing route
  if (method === 'PUT') {
    try {
        const { id, updatedInfo } = req.body;
        const currentBusRoute = await NewBusRoute.findById(id);

        currentBusRoute.busNumber = updatedInfo.busNumber || currentBusRoute.busNumber;
        currentBusRoute.routeName = updatedInfo.routeName || currentBusRoute.routeName;
        currentBusRoute.routeStops = updatedInfo.routeStops || currentBusRoute.routeStops;

        const save = await currentBusRoute.save();

        // Respond with the updated route
        res.status(200).json(save);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update bus route', error });
    }
  }


  // Get all bus routes
  if (method === 'GET') {
    const { districtCode, busNumber } = req.query;
    if(busNumber){
      const BN = busNumber.split(',');
      try {
        const routes = await NewBusRoute.find({busNumber: BN});
        res.status(200).json(routes);
      } catch (error) {
        res.status(500).json({ message: 'Failed to get bus routes', error });
      }
    }
    try {
      const routes = await NewBusRoute.find({districtCode: districtCode});
      res.status(200).json(routes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get bus routes', error });
    }
  }

  if (method === 'DELETE') {
    try {
      const { id } = req.body;
      const deletedRoute = NewBusRoute.findById(id);

      await NewStudent.updateMany({busNumber: deletedRoute.busNumber}, {busNumber: null});

      await NewBusRoute.findByIdAndDelete(id); 
      res.status(200).json({ message: 'Bus route deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete bus route', error });
    }
  }
}
