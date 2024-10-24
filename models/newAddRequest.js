import mongoose from 'mongoose';

const newAddRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  districtNumber: { type: String, required: true },
  studentId: { type: String, required: true },
  status: { type: String, default: 'pending' }, // Request status (pending/approved/rejected)
  createdAt: { type: Date, default: Date.now }
});

const NewAddRequest = mongoose.models.NewAddRequest || mongoose.model('NewAddRequest', newAddRequestSchema);

export default NewAddRequest;
