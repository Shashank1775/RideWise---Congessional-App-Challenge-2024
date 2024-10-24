import mongoose from 'mongoose';
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

  // Create a new student
  if (method === 'POST') {
    const { studentName, studentBirthDate, busNumber, districtCode } = req.body;
    const newStudent = new NewStudent({
        studentName,
        studentBirthDate,
        busNumber,
        districtCode
    });
    await newStudent.save();

    res.status(200).json(newStudent);
  }

  // Edit an existing student
  if (method === 'PUT') {
    const { studentId, studentName, studentBirthDate, busNumber } = req.body;

    let updatedStudent = await NewStudent.findOne({ studentId: studentId });
    
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (studentName) {
      updatedStudent.studentName = studentName;
    }
    if (studentBirthDate) {
      updatedStudent.studentBirthDate = studentBirthDate;
    }
    if (busNumber) {
      updatedStudent.busNumber = busNumber;
    }
    
    await updatedStudent.save();
    res.status(200).json(updatedStudent);
  }

  // In your API route for getting students
  if (method === 'GET') {
    let { studentIds, districtCode } = req.query; // Update to handle an array of student IDs
    studentIds = studentIds ? studentIds.split(',') : null;

    // Check if studentIds is provided in the query and is an array
    if (studentIds) {
      // Find students with the matching studentIds (use $in to match any in the array)
      const students = await NewStudent.find({ studentId: { $in: studentIds } });
      return res.status(200).json(students);
    }

    // If no studentIds are provided, return all students
    const students = await NewStudent.find({ districtCode: districtCode });
    return res.status(200).json(students);
  }
}
