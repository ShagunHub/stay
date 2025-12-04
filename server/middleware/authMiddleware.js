import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Clerk attaches req.auth automatically
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized - no userId" });
    }

    // Your DB user
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found in DB with ID: ${userId}`);
      return res.status(404).json({ success: false, message: "User not found in database. Please try logging out and logging back in." });
    }

    req.user = user;
    next();
    
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ success: false, message: `Authentication failed: ${error.message}` });
  }
};
export const clerkAuth = ClerkExpressRequireAuth();