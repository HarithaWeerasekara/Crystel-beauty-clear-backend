import jwt from "jsonwebtoken";
// import User from "../models/User.js"; // Uncomment if you want full user info from DB

export default async function verifyJWT(req, res, next) {
    try {
        const header = req.header("Authorization");

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = header.replace("Bearer ", "");

        const decoded = jwt.verify(token, "random456"); // or process.env.JWT_SECRET

        // Optional: fetch full user document
        // const user = await User.findById(decoded.id);
        // if (!user) return res.status(401).json({ message: "User not found" });

        req.user = decoded; // or `req.user = user;` if you fetched from DB

        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
}
