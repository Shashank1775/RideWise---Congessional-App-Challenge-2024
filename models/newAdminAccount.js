import mongoose from 'mongoose';

const newAdmin = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },  
    userPassword:{
        type: String,
        required: true
    }, 
    userDistrictCode:{
        type: String,
        required: true
    },
    userRole:{
        type: String,
        required: true
    }
});

const NewAdmin = mongoose.models.NewAdmin || mongoose.model('NewAdmin', newAdmin);

export default NewAdmin;
