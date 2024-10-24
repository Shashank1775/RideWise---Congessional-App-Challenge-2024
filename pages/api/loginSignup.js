import mongoose from 'mongoose';
import NewUser from '@/models/newUsers';
import NewAdmin from '@/models/newAdminAccount';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = '8f181d023e6e5c6539ad6db9a3084885dc23e9ab388af440e6d764058f79f3ec'; // Replace with a secure key

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
        const { 
            name, 
            email, 
            phoneNumber, 
            dob, 
            district, 
            password, 
            address, 
            purpose, 
            connectedStudents 
        } = req.body;

        const isEmail = email.includes('@');
        const query = isEmail ? { userEmail: email } : { userPhoneNumber: phoneNumber };

        if (purpose === 'signup') {
            try {
                // Check if user already exists
                const existingUser = await NewUser.findOne({ userEmail: email });

                if (existingUser) {
                    return res.status(400).json({ message: 'User already exists' });
                }

                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);
                
                // Create new user with the role set to 'parent' by default
                const newUser = new NewUser({
                    userFullName: name,
                    userEmail: email,
                    userPhoneNumber: phoneNumber,
                    userDOB: dob, // Add date of birth
                    userAddress: address, // Add address
                    userPassword: hashedPassword,
                    userRole: 'parent', // Set role to 'parent' by default
                    userDistrictCode: district,
                    connectedStudents: connectedStudents || [], // Handle connected students
                });

                await newUser.save();

                // Generate JWT token
                const token = jwt.sign(
                    { userId: newUser._id, emailOrPhone: isEmail ? email : phoneNumber, role: newUser.userRole },
                    JWT_SECRET,
                    { expiresIn: '4h' }
                );

                return res.status(201).json({ token, message: 'User created successfully' });
            } catch (error) {
                return res.status(500).json({ message: 'Error creating user', error });
            }
        } else {
            try {
                // Find user or admin by email
                const user = await NewUser.findOne({ userEmail: email });
                const admin = await NewAdmin.findOne({ userEmail: email });
            
                // Check if neither user nor admin is found
                if (!user && !admin) {
                    return res.status(404).json({ message: 'User not found' });
                }
            
                // If admin is found, validate admin's password
                if (admin) {
                    
                    const adminPasswordMatch = await bcrypt.compare(password, admin.userPassword);
                    if (!adminPasswordMatch) {
                        return res.status(400).json({ message: 'Invalid credentials' });
                    }
                    // Generate JWT token for admin
                    const token = jwt.sign(
                        { userId: admin._id, emailOrPhone: email, role: admin.userRole },  // Use admin role
                        JWT_SECRET,
                        { expiresIn: '4h' }
                    );
                    return res.status(200).json({ token, message: 'Admin logged in successfully' });
                } 
                
                // If user is found, validate user's password
                const passwordMatch = await bcrypt.compare(password, user.userPassword);
                if (!passwordMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
            
                // Generate JWT token for user
                const token = jwt.sign(
                    { userId: user._id, emailOrPhone: email, role: user.userRole },  // Use user role
                    JWT_SECRET,
                    { expiresIn: '4h' }
                );
                
                return res.status(200).json({ token, isParent:true, message: 'User logged in successfully' });
            
            } catch (error) {
                return res.status(500).json({ message: 'Error logging in', error });
            }
        }
    }


    if (method === 'PUT') {
        // Handle PUT requests if necessary
    }

    if (method === 'GET') {
        // Handle GET requests if necessary
        const { token } = req.query;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
          }
      
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await NewUser.findById(decoded.userId);
      
            if (!user) {
              return res.status(404).json({ error: 'User not found' });
            }
      
            return res.status(200).json({ user });
          } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
          }
    }
}
