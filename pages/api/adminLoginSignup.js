import mongoose from 'mongoose';
import NewAdmin from '@/models/newAdminAccount';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = '8f181d023e6e5c6539ad6db9a3084885dc23e9ab388af440e6d764058f79f3ec'; // Replace with a secure key

// Connect to MongoDB
function mongooseConnect() {
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

    if (method === 'POST') {
        const { userEmail, userPassword, userDistrictCode, userRole, purpose } = req.body;

        if (purpose === 'signup') {
            // Handle account creation
            try {
                // Check if admin already exists
                const existingAdmin = await NewAdmin.findOne({ userEmail });

                if (existingAdmin) {
                    return res.status(400).json({ message: 'Admin already exists' });
                }

                // Hash the password
                const hashedPassword = await bcrypt.hash(userPassword, SALT_ROUNDS);

                // Create new admin
                const newAdmin = new NewAdmin({
                    userEmail,
                    userPassword: hashedPassword,
                    userDistrictCode,
                    userRole,
                });

                await newAdmin.save();

                // Generate JWT token
                const token = jwt.sign(
                    { userId: newAdmin._id, email: userEmail, role: newAdmin.userRole },
                    JWT_SECRET,
                    { expiresIn: '4h' }
                );

                return res.status(201).json({ token, message: 'Admin created successfully' });
            } catch (error) {
                return res.status(500).json({ message: 'Error creating admin', error });
            }
        } else {
            // Handle login
            try {
                const admin = await NewAdmin.findOne({ userEmail });

                if (!admin) {
                    return res.status(404).json({ message: 'Admin not found' });
                }

                const passwordMatch = await bcrypt.compare(userPassword, admin.userPassword);
                if (!passwordMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: admin._id, email: userEmail, role: admin.userRole },
                    JWT_SECRET,
                    { expiresIn: '4h' }
                );

                return res.status(200).json({ token, message: 'Admin logged in successfully' });
            } catch (error) {
                return res.status(500).json({ message: 'Error logging in', error });
            }
        }
    }

    if (method === 'GET') {
        // Handle token verification and user retrieval
        const { token } = req.query;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const admin = await NewAdmin.findById(decoded.userId);

            if (!admin) {
                return res.status(404).json({ error: 'Admin not found' });
            }

            return res.status(200).json({ admin });
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }

    // Handle unsupported methods
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
}
