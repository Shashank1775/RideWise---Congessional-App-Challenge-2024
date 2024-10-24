import mongoose from 'mongoose';

// Function to generate a 7-character alphanumeric string
const generateStudentId = () => {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
};

const newStudent = new mongoose.Schema({
  // Student name - required in creation
  studentName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true, // Ensure studentId is unique
    default: generateStudentId // Automatically generate a new ID
  },
  connectParentId:{
    type: String,
    required: false
  },
  busNumber:{
    type: String,
    required: false
  },
  // Birthdate for Verification - required in creation
  studentBirthDate:{
    type: String,
    required: true
  },
  status:{
    type: Boolean,
    required: false,
    default: false
  },
  currentNumber:{
    type: String,
    required: false
  },
  districtCode:{
    type: String,
    required: false
  }
});

// Pre-save hook to ensure `studentId` is generated if it's missing
newStudent.pre('save', function(next) {
  if (!this.studentId) {
    this.studentId = generateStudentId();
  }
  next();
});

const NewStudent = mongoose.models.NewStudent || mongoose.model('NewStudent', newStudent);

export default NewStudent;
