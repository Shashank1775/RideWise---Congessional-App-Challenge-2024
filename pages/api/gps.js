import mongoose from 'mongoose';
import NewGpsJourney from "@/models/newGpsJourney"; // Ensure correct import

async function mongooseConnect() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    } else {
        const uri = process.env.MONGODB_URI; // Make sure the URI is set correctly
        return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
}

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();

    if (method === 'POST') {
        try {
            const { latitude, longitude, busNumber } = req.body; // Ensure busNumber is also provided

            // Check if latitude, longitude, and busNumber are valid
            if (
                typeof latitude !== 'number' || 
                typeof longitude !== 'number' || 
                isNaN(latitude) || 
                isNaN(longitude) || 
                !busNumber
            ) {
                return res.status(400).json({ message: "Invalid input. Latitude, Longitude, and Bus Number are required." });
            }

            const location = { coordinates: `${latitude} ${longitude}`, timestamp: new Date() };

            // Find the bus journey
            let journey = await NewGpsJourney.findOne({ busNumber });

            if (!journey) {
                // Create a new journey if none exists
                journey = new NewGpsJourney({ busNumber, locations: [location] });
            } else {
                // Get the last location timestamp
                const lastLocation = journey.locations[journey.locations.length - 1];
                const lastTimestamp = new Date(lastLocation.timestamp);
                const timeDifference = (location.timestamp - lastTimestamp) / (1000 * 60 * 60); // Convert milliseconds to hours

                if (timeDifference > 1) {
                    // Start a new journey if the last location was more than 1 hour ago
                    journey = new NewGpsJourney({ busNumber, locations: [location] });
                } else {
                    // Add new location to existing journey
                    journey.locations.push(location);
                }
            }

            await journey.save();
            res.status(200).json({ message: "Location saved successfully!", latitude, longitude });
        } catch (error) {
            res.status(500).json({ message: "Error saving location", error: error.message });
        }
    }

    if (method === 'GET') {
        try {
            // Aggregate to find the most recent tracking object for each bus
            const recentLocations = await NewGpsJourney.aggregate([
                // Sort by busNumber and updatedAt to get the most recent journey per bus
                { $sort: { "busNumber": 1, "updatedAt": -1 } },
                // Group by busNumber to get the most recent journey document for each bus
                {
                    $group: {
                        _id: "$busNumber",
                        mostRecentJourney: { $first: "$$ROOT" }  // Get the most recent document
                    }
                },
                // Project the busNumber and locations from the most recent journey document
                {
                    $project: {
                        _id: 0,
                        busNumber: "$_id",
                        locations: "$mostRecentJourney.locations"  // Return the locations array
                    }
                }
            ]);
    
            if (recentLocations.length === 0) {
                return res.status(404).json({ message: "No bus locations found." });
            }
    
            // Respond with the locations from the most recent bus tracking object for each bus
            res.status(200).json({ recentLocations });
        } catch (error) {
            res.status(500).json({ message: "Error fetching bus locations", error: error.message });
        }
    } 
}
