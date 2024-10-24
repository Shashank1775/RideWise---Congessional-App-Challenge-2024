import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    coordinates: {
        type: String, // Store coordinates as a string (e.g., "Latitude Longitude")
        required: true
    },
    timestamp: {
        type: Date, // Timestamp for when this location was recorded
        default: Date.now, // Automatically sets the current date
        required: true
    }
});

const newGpsJourneySchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true
    },
    locations: {
        type: [locationSchema], // Array of location objects with coordinates and timestamp
        required: true
    }
}, { timestamps: true }); // Automatically creates `createdAt` and `updatedAt` fields for the document

const NewGpsJourney = mongoose.models.NewGpsJourney || mongoose.model('NewGpsJourney', newGpsJourneySchema);

export default NewGpsJourney;
