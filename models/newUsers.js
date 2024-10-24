import mongoose from 'mongoose';

const newUser = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    userPhoneNumber:{
        type: String,
        required: true
    },    
    userPassword:{
        type: String,
        required: true
    }, 
    userRole: {
        type: String,
        required: true
    },
    userDistrictCode:{
        type: String,
        required: true
    },
    connectedStudents:{
        type: Array,
        required: false
    },
    userDOB:{
        type: Date,
        required: true
    },
    userFullName:{
        type: String,
        required: true
    },
    userAddress:{
        type: String,
        required: true
    },
});

const NewUser = mongoose.models.NewUser || mongoose.model('NewUser', newUser);

export default NewUser;
