import user from "../models/User.js";
import pkg from "svix";
const {webhook} = pkg;

const clerkWebhooks=async(req,res)=>{
    try{

        //create a Svix instance with clerk webhook secret
const whook=new webhook(process.env.CLERK_WEBHOOK_SECRET);

//Getting header
const headers={
    "svix-id":req.headers["svix-id"],
    "svix-timestamp":req.headers["svix-timestamp"],
    "svix-signature":req.headers["svix-signature"]
};
//verifying header
await whook.verify(JSON.stringify(req.body),headers);       

//Getting data frfom request body
const {type,data}=req.body; 
const userData={
    _id:data.id,
    email:data.email_addresses[0].email_address,
    username:data.first_name + " " + data.last_name,
    image:data.image_url,
}
//Switch Cases for different Events
switch(type){
    case "user.created":{
      await user.create(userData);
      break;  
    }
     case "user.updated":{
   await user.findByIdAndUpdate(data.id,userData);
   break;  
 }
  case "user.deleted":{
   await user.findByIdAndDelete(data.id);
   break;  
 }
 default:
      break;
}
res.json({success:true ,message:"Webhook received"});

     } catch(error){
console.log(error.message);
res.json({success: false ,message:error.message});
     }
}
export default clerkWebhooks;
