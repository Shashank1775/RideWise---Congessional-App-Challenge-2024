import NewDistrict from '@/models/newDistrict';
import mongoose from 'mongoose';

async function mongooseConnect() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    } else {
        const uri = process.env.MONGODB_URI; // Make sure the URI is set correctly
        return mongoose.connect(uri);
    }
}

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();

    if (method === 'POST') {
        const { districtAddress, districtName, zipCode } = req.body;

        if (!districtAddress || !districtName || !zipCode) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const districtCode = Array(12).fill(null).map(() => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            return characters.charAt(Math.floor(Math.random() * characters.length));
        }).join('');

        try {
            const district = new NewDistrict({ districtAddress: districtAddress, districtName, zipCode, districtCode });
            await district.save();
            return res.status(201).json(districtCode );
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create district account', details: error.message });
        }
    }

    if (method === 'GET') {
        try {
            const districts = await NewDistrict.find({});
            return res.status(200).json(districts);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to retrieve districts', details: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
