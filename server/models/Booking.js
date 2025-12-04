import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    // Clerk user IDs are strings (e.g. "user_..."), so store user as String
    user: { type: String, ref: "User", required: true },
    room: {type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true},
    hotel: {type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true},
    checkInDate: {type: Date, required: true},
    checkOutDate: {type: Date, required: true},
    totalPrice: {type: Number, required: true},
    guests: {type: Number, required: true},
    status: {type: String, 
        enum: ["pending", "booked", "confirmed", "cancelled"], 
        default: "pending"
    },
    paymentMethod: {
        type: String, 
        required: true, 
        default:"Pay At Hotel"
    },
    isPaid: {type: Boolean, default: false},
},{timestamps:true});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;