import mongoose from 'mongoose';
import NewAddRequest from '@/models/newAddRequest';
import NewStudent from '@/models/newStudents';
import NewUser from '@/models/newUsers';
import { EmailClient } from '@azure/communication-email';

const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING; // Replace with your Azure Communication Service connection string
const emailClient = new EmailClient(connectionString);

// Connect to MongoDB
async function mongooseConnect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise();
  } else {
    const uri = process.env.MONGODB_URI;
    return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
}

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  try {
    // Edit an existing student request
    if (method === 'PUT') {
      const { id, status, studentId, email, phone, parentName } = req.body;

      // Check if the request exists
      const existingRequest = await NewAddRequest.findById(id);
      if (!existingRequest) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Process the request based on status
      if (status === 'approved') {
        // Check if the student exists before proceeding
        const student = await NewStudent.findOne({ studentId: studentId });
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }

        student.connectParentId = existingRequest._id || student.connectParentId;
        await student.save();

        // Check if the parent exists
        const parent = await NewUser.findOne({ userEmail: email, userPhoneNumber: phone, userFullName: parentName });
        if (!parent) {
          return res.status(404).json({ error: 'Parent not found' });
        }

        // Ensure `connectedStudents` array exists and push the student ID
        if (!parent.connectedStudents) {
          parent.connectedStudents = []; // Initialize array if undefined
        }
        parent.connectedStudents.push(student._id);
        await parent.save();

        // Update request status to "approved"
        existingRequest.status = status;
        await existingRequest.save();

        return res.status(200).json({ message: 'Student Connection Approved' });
      } else if (status === 'rejected') {
        // Only update the request status to "rejected"
        existingRequest.status = status;
        await existingRequest.save();

        // Prepare the email content
        const emailContent = {
          senderAddress: 'DoNotReply@6f4532a3-aa21-46f6-974a-1eebdb8e1e22.azurecomm.net',
          content: {
            subject: `Rejection of Student Addition Request for ${existingRequest.name}`,
            plainText: `Dear Parent,\n\nWe regret to inform you that your request to add the student ${existingRequest.studentId} has been rejected. If you have any questions or need further assistance, please do not hesitate to reach out.\n\nThank you for your understanding.\n\nBest regards,\nThe Student Management Team`,
          },
          recipients: {
            to: [
              {
                address: existingRequest.email,
                displayName: existingRequest.name,
              },
            ],
          },
        };

        // Send the rejection email
        await emailClient.beginSend(emailContent);
        return res.status(200).json({ message: 'Request Rejected and email sent' });
      }

      return res.status(400).json({ error: 'Invalid status' });
    }

    // Delete a student request
    if (method === "DELETE") {
      const { id } = req.body;
      const request = await NewAddRequest.findById(id);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Prepare the email content
      const emailContent = {
        senderAddress: 'DoNotReply@6f4532a3-aa21-46f6-974a-1eebdb8e1e22.azurecomm.net',
        content: {
          subject: `Rejection of Student Addition Request for ${request.name}`,
          plainText: `Dear Parent,\n\nWe regret to inform you that your request to add the student ${request.studentId} has been rejected. If you have any questions or need further assistance, please do not hesitate to reach out.\n\nThank you for your understanding.\n\nBest regards,\nThe Student Management Team`,
        },
        recipients: {
          to: [
            {
              address: request.email,
              displayName: request.name,
            },
          ],
        },
      };

      // Send the email to the parent
      await emailClient.beginSend(emailContent);
      
      // Delete the request
      const deleteRequest = await NewAddRequest.findByIdAndDelete(id);
      return res.status(200).json(deleteRequest);
    }

    // Create a new student request
    if (method === 'POST') {
      const { parentName, parentPhone, parentEmail, parentAddress, districtCode, studentId, dateOfBirth } = req.body;

      // Check if the student exists before allowing the request
      const student = await NewStudent.findOne({ studentId: studentId });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      const existingRequest = await NewAddRequest.findOne({studentId: studentId, parentPhone: parentPhone, parentEmail: parentEmail});
      if(existingRequest){
        return res.status(400).json({ error: 'Request already exists' });
      }
      // Create a new student request
      const newRequest = new NewAddRequest({
        name: parentName,
        phone: parentPhone,
        email: parentEmail,
        address: parentAddress,
        districtNumber: districtCode,
        studentId,
        dateOfBirth: new Date(dateOfBirth),
      });

      await newRequest.save();
      return res.status(201).json(newRequest);
    }

    // Get all student requests
    if (method === 'GET') {
      const { id, parentPhone, parentEmail, districtCode } = req.query;

      if(districtCode){
        const newRequest = await NewAddRequest.find({ districtNumber: districtCode });
        return res.status(200).json(newRequest);
      }

      let newRequest;
      if (parentPhone && parentEmail) {
        newRequest = await NewAddRequest.find({ phone: parentPhone, email: parentEmail });
      } else if (id) {
        newRequest = await NewAddRequest.findById(id);
      } else {
        newRequest = await NewAddRequest.find(); // Fetch all requests
      }

      return res.status(200).json(newRequest);
    }

    // Method Not Allowed
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: error.message });
  }
}
