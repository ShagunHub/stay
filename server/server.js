import express from 'express';  
import "dotenv/config";
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from './controllers/clerkWebhooks.js';
connectDB()

const app=express();
app.use(cors());    // Enable Cross-origin Resource Sharing

//MiddleWare
app.use(express.json())
app.use(clerkMiddleware())

//API to listen to clerk webhooks
app.use("/api/clerk",clerkWebhook)

app.get('/',(req,res)=>res.send('Hello World from Express.js server!'))

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`)); 