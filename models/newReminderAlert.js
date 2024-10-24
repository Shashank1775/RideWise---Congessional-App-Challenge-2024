import mongoose from 'mongoose';

const newReminderOrAlert = new mongoose.Schema({
  busNumber:{
    type: String,
    required: true,
    default: ''
  },
  message:{
    type: String,
    required: true,
    default: ''
  },
  date:{
    type: Date,
    required: true,
    default: Date.now
  },
  time:{
    type: String,
    required: true,
    default: new Date().toLocaleTimeString()
  },
});

const NewReminderOrAlert = mongoose.models.NewReminderOrAlert || mongoose.model('NewReminderOrAlert', newReminderOrAlert);

export default NewReminderOrAlert;
