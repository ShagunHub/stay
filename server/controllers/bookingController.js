import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../configs/nodemailer.js";
//Function to check Availability of Room
const checkAvailability=async({checkInDate, checkOutDate, room})=>{
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate },
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.log('checkAvailability error:', error.message);
        return false;
    }
};

//API to check availability of room
//POST /api/booking/check-availability
export const checkAvailabilityAPI=async(req,res)=>{
    try{
        const {room, checkInDate, checkOutDate}=req.body;
        const isAvailable=await checkAvailability({checkInDate, checkOutDate, room});
        res.json({success:true ,isAvailable});
    }catch(error){
        res.json({success:false ,message:error.message});
    }
}

//API to create a new booking 
//POST /api/booking/

export const createBooking=async(req,res)=>{
    try{
        console.log('createBooking called - has req.auth:', !!req.auth, 'has req.user:', !!req.user);
        console.log('createBooking - Authorization header present:', !!req.headers?.authorization);
        // Only log limited body fields to avoid leaking sensitive info
        console.log('createBooking payload keys:', Object.keys(req.body || {}));
        const {room, checkInDate, checkOutDate, guests: guestsRaw}=req.body;
        const guests = Number(guestsRaw);
        // Ensure the request is authenticated and has a DB user attached
        if(!req.user){
            return res.status(401).json({success:false, message: 'Not authenticated - user missing'});
        }
        const user=req.user._id;

        // Basic payload validation
        if(!room || !checkInDate || !checkOutDate || guestsRaw === undefined){
            return res.status(400).json({success:false, message: 'Missing required booking fields'});
        }
        if (Number.isNaN(guests) || guests <= 0) {
            return res.status(400).json({ success: false, message: 'Guests must be a positive number' });
        }

//Before Booking Check Availability
const isAvailable=await checkAvailability({
    checkInDate, 
    checkOutDate,
     room
    });
    if(!isAvailable){
        return res.json({success:false ,message:"Room not available"});
    }
     //Get totalPrice from Room
     const roomData = await Room.findById(room).populate("hotel");
     if (!roomData) {
         return res.status(404).json({ success: false, message: 'Room not found' });
     }
     // Defensive: ensure hotel is populated or present as id
     const hotelId = roomData.hotel?._id || roomData.hotel;
     if (!hotelId) {
         console.log('createBooking: room found but hotel missing on room:', roomData._id);
         return res.status(500).json({ success: false, message: 'Room is not linked to a hotel' });
     }
     let totalPrice = roomData.pricePerNight;

        //Calculate totalPrice based on nights with validation
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date' });
        }
        if (checkOut <= checkIn) {
            return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
        }
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (nights <= 0 || !Number.isFinite(nights)) {
            return res.status(400).json({ success: false, message: 'Invalid booking duration' });
        }
        totalPrice *= nights;
        if (!Number.isFinite(totalPrice) || Number.isNaN(totalPrice)) {
            console.log('createBooking: computed invalid totalPrice:', totalPrice, { roomDataPrice: roomData.pricePerNight, nights });
            return res.status(500).json({ success: false, message: 'Failed to compute total price' });
        }
    const bookingPayload = {
        user,
        room,
        hotel: hotelId,
        guests: +guests,
        checkInDate,
        checkOutDate,
        totalPrice,
    };

        console.log('createBooking: creating booking with payload keys:', Object.keys(bookingPayload));
        try {
            const booking = await Booking.create(bookingPayload);

            const mailOptions={
                from: process.env.SENDER_EMAIL,
                to: req.user.email,
                subject: 'Hotel Booking Details',
                html: `
                <h2>Your Booking Details</h2>
                <p>Dear ${req.user.username},</p>
                <p>Thank you for your booking! Here are your details: </p>
                <ul>
                <li><strong>Booking ID:</strong> ${booking._id}</li>
                 <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                  <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                   <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
                    <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice} /night</li>
                </ul>
                <p>We look forward to welcoming you!</p>
                <p>If you need to make any changes,feel free to contact us.</p>
                `
            }
            await transporter.sendMail(mailOptions);

            res.json({ success: true, message: 'Booking created successfully', bookingId: booking._id });
        } catch (createError) {
            console.error('createBooking - Booking.create error:', createError);
            return res.status(500).json({ success: false, message: createError.message || 'Failed to create booking record' });
        }
    } catch(error){
    console.error("Create booking error:", error);
    res.status(500).json({success:false ,message: error.message || "Failed to create booking"});
    }
};
//API to get all bookinngs of a user
//GET /api/booking/
export const getUserBookings=async(req,res)=>{
    try{
        const user=req.user._id;
        const bookings=await Booking.find({user}).populate("room hotel").sort({createdAt:-1});
        res.json({success:true ,bookings});
    }catch(error){
    res.json({success:false ,message:"Failed to fetch bookings"});
    }
}
export const getHotelBookings=async(req,res)=>{
    try{
         const hotel=await Hotel.findOne({owner:req.user._id});
 if(!hotel){
 return res.json({success:false ,message:"Hotel not found"});
 }
 const bookings=await Booking.find({hotel:hotel._id}).populate("room hotel user").sort({createdAt:-1});
 //Total Bookings
 const totalBookings=bookings.length;
 //Total Revenue
 const totalRevenue=bookings.reduce((acc,booking)=>acc + booking.totalPrice ,0);
 res.json({success:true ,dashboardData:{bookings, totalBookings, totalRevenue}});
    }  catch(error){
    res.json({success:false ,message:"Failed to fetch bookings"});
    }
}
