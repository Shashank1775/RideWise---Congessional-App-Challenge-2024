import mongoose from 'mongoose';
import NewReminderOrAlert from '@/models/newReminderAlert';
import NewUser from '@/models/newUsers';
import NewStudent from '@/models/newStudents';
import { EmailClient } from '@azure/communication-email';

// Connect to MongoDB
async function mongooseConnect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise();
  } else {
    const uri = process.env.MONGODB_URI;
    return mongoose.connect(uri);
  }
}

// Create an EmailClient instance with the connection string
const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING; // Replace with your Azure Communication Service connection string
const emailClient = new EmailClient(connectionString);

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === 'POST') {
    const { busNumber, message, date, time } = req.body;
    const date1 = new Date();
  
    // Ensure busNumber is a string (not an array)
    const busNumberString = Array.isArray(busNumber) ? busNumber[0] : busNumber;
  
    // Create a new reminder or alert object
    const newReminder = new NewReminderOrAlert({
      busNumber: busNumberString,
      message,
      date,
      time,
    });
  
    try {
      // Find all students associated with the bus number
      const students = await NewStudent.find({ busNumber: busNumberString });
      const studentIds = students.map((student) => student.studentId);
  
      // Find all parents associated with the connected students
      const parents = await NewUser.find({ userRole: 'parent' });
      
      // Save the new reminder to the database
      const savedReminder = await newReminder.save();
  
      // Get the list of parent emails
      const parentEmails = parents.map((parent) => parent.userEmail);

      const emailContent = {
        senderAddress: 'DoNotReply@6f4532a3-aa21-46f6-974a-1eebdb8e1e22.azurecomm.net', // Replace with the sender email address
        content: {
          subject: `Bus Alert for Bus Number ${busNumberString}`,
          plainText: `Dear Parent, \n\nThis is an important alert for Bus Number ${busNumberString}. \n\nMessage: ${message}\nDate: ${date1}\nTime: ${time}\n\nThank you, \nYour School`,
        },
        recipients: {
          to: [
            {
              address: parentEmails, // Replace with the recipient email address
              displayName: "Parent", // You can customize the display name as needed
            },
          ],
        },
      };
      
  
      // Send emails to all parents
      const emailResult = await emailClient.beginSend(emailContent);
      console.log('Email sent successfully:', emailResult);
      
      res.status(200).json(parentEmails);
     
      } catch(error) {
        console.error("Error in POST request:", error);
        res.status(400).json({ error: error.message });
      }

  }  

// Handle PUT request to edit an existing alert/reminder
if (method === 'PUT') {
  const { id, busNumber, message, date, time } = req.body;

  try {
    const updatedReminder = await NewReminderOrAlert.findByIdAndUpdate(
      id,
      { busNumber, message, date, time },
      { new: true } // Return the updated document
    );

    if (!updatedReminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.status(200).json(updatedReminder);
  } catch (error) {
    console.error("Error in PUT request:", error);
    res.status(400).json({ error: error.message });
  }
}
  // Get all alerts/reminders
  if (method === 'GET') {
    const { busNumber } = req.query;
    const formattedBusNumbers = busNumber.split(',');

    if(formattedBusNumbers){
      try {
        const reminders = await NewReminderOrAlert.find({ busNumber: formattedBusNumbers });
        res.status(200).json(reminders);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
    try {
      const reminders = await NewReminderOrAlert.find();
      res.status(200).json(reminders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
