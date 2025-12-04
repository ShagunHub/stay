import express from 'express';  
import "dotenv/config";
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from './controllers/clerkWebhooks.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import bookingRouter from './routes/bookingRoutes.js';

connectDB()
connectCloudinary();


const app=express();
// Enable Cross-origin Resource Sharing with explicit origin and credentials
app.use(cors({
	origin: process.env.CLIENT_ORIGIN || 'http://localhost:5174',
	credentials: true,
	methods: ['GET','POST','PUT','DELETE','OPTIONS'],
}));

//MiddleWare
app.use(express.json())
app.use(clerkMiddleware())

//API to listen to clerk webhooks
app.use("/api/clerk",clerkWebhooks)

app.get('/',(req,res)=>res.send('Hello World from Express.js server!'))
app.use('/api/user',userRouter);
app.use('/api/hotels',hotelRouter);
app.use('/api/rooms',roomRouter);
app.use('/api/bookings',bookingRouter);

// Temporary debug endpoints
app.get('/api/debug/headers', (req, res) => {
	res.json({
		headers: req.headers,
		auth: req.auth || null,
		userId: req.auth?.userId || null,
	});
});

app.post('/api/debug/echo', (req, res) => {
	res.json({ body: req.body, headers: req.headers, auth: req.auth || null });
});


const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`)); 