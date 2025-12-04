import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel=async(req,res)=>{
    try{
const {name, address, contact, city}=req.body;
const hotelOwner=req.user._id
//Check if User already Registered
const hotel=await Hotel.findOne({owner: hotelOwner})
if(hotel){
    return res.json({success:false ,message:"Hotel already registered"});
}
await Hotel.create({name,address,contact,city,owner: hotelOwner});
await User.findByIdAndUpdate(hotelOwner, {role: "hotelOwner"});
res.json({success:true ,message:"Hotel Registered successfully"});

    }catch(error){
    res.json({success:false ,message:error.message});
    }
}
