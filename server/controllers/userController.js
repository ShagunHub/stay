import User from "../models/User.js";

//GET /api/user/

export const getUserData=async(req,res)=>{
    try{
        const role=req.user.role;
        const recentSearchedCities=req.user.recentSearchedCities;
        res.json({success:true ,role, recentSearchedCities});
    } catch(error){
        res.json({success:false ,message:error.message});
    }   
}

//Store User Recent searched Cities
export const storeUserSearchCity=async(req,res)=>{
    try{
const {recentSearchedCities}=req.body;
const user=await req.user;

if(user.recentSearchedCities.length>=5){
    user.recentSearchedCities.push(recentSearchedCities); 
} else{
    user.recentSearchedCities.shift();
    user.recentSearchedCities.push(recentSearchedCities);
}
await user.save();
res.json({success:true ,message:"city add"});
    } catch(error){
        res.json({success:false ,message:error.message});
    }
}

//Sync User to DB (fallback if webhook fails)
export const syncUserToDB=async(req,res)=>{
    try{
        const { userId, email, username, image } = req.body;
        
        if(!userId || !email || !username) {
            return res.status(400).json({success:false, message:"Missing required fields"});
        }
        
        let user = await User.findById(userId);
        
        if(user) {
            // Update existing user
            user = await User.findByIdAndUpdate(userId, { email, username, image }, { new: true });
            return res.json({success:true, message:"User updated successfully", user});
        } else {
            // Create new user
            user = await User.create({
                _id: userId,
                email,
                username,
                image,
                role: "user",
                recentSearchedCities: []
            });
            return res.json({success:true, message:"User created successfully", user});
        }
    } catch(error){
        console.error("Sync error:", error);
        res.status(500).json({success:false, message:error.message});
    }
}