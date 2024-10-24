import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  stopNumber: { type: Number, required: true },
  arrivalTime: { type: String, required: false },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
});

const newBusRouteSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  routeStops: [stopSchema],
  districtCode: { type: String, required: true }
});

const NewBusRoute = mongoose.models.NewBusRoute || mongoose.model('NewBusRoute', newBusRouteSchema);

export default NewBusRoute;
