import mongoose from 'mongoose';
import NewStudent from '@/models/newStudents';

// Function to establish a MongoDB connection
async function mongooseConnect() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    } else {
        const uri = process.env.MONGODB_URI; // Ensure URI is correctly set
        return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
}

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();

    if (method === 'POST') {
        const { studentId } = req.body;

        try {
            // Handle single student case
            const existingStudent = await NewStudent.findOne({ studentId });

            if (existingStudent) {
                // Toggle status and increment currentNumber
                existingStudent.status = !existingStudent.status;
                existingStudent.currentNumber++;

                await existingStudent.save();
                return res.status(200).json({ message: 'Student status updated successfully' });
            } else {
                return res.status(400).json({ message: 'Student not found' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Error updating student', error });
        }
    }

    if (method === 'GET') {
        const { studentId, districtCode } = req.query;

        if (!studentId) {
            // If no studentId is provided, return totals of students based on their currentNumber
            try {
                const students = await NewStudent.find({districtCode: districtCode});

                return res.status(200).json({
                    students
                });
            } catch (error) {
                return res.status(500).json({ message: 'Error fetching totals', error });
            }
        }

        try {
            // Ensure `studentId` is an array (can handle single or multiple IDs)
            let studentIds = Array.isArray(studentId) ? studentId : [studentId];

            // Fetch all students based on the list of IDs
            const students = await NewStudent.find({ studentId: { $in: studentIds } });

            if (students.length === 0) {
                return res.status(404).json({ message: 'No students found' });
            }

            // Map over students and return their status and location based on currentNumber
            const results = students.map((student) => {
                const location = student.currentNumber % 2 === 0 ? 'at school' : 'at home';
                return {
                    studentId: student.studentId,
                    status: student.status ? 'Active' : 'Inactive',
                    currentNumber: student.currentNumber,
                    location,
                };
            });

            return res.status(200).json({ students: results });
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching students', error });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' }); // Handle unsupported methods
}
