import mongoose from 'mongoose';

const newDistrictSchema = new mongoose.Schema({
    districtAddress: { type: String, required:false, index:true, unique:true}, // `sparse: true` allows nulls
    districtName: { type: String, required:false },
    zipCode: { type: String, required:false },
    districtCode: { type: String, required:false }, 
    adminAccounts: { type: Array, required: false },
});


const NewDistrict = mongoose.models.NewDistrict || mongoose.model('NewDistrict', newDistrictSchema);
export default NewDistrict;
