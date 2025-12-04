import User from "../models/User.js";
import { verifyToken } from '@clerk/backend';

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY
        });
        if (!payload || !payload.sub) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const userId = payload.sub;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ success: false, message: "Authentication failed" });
    }
};
 
