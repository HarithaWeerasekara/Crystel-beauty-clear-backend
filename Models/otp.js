import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5m' // OTP will expire after 5 minutes
    }
});

const OTP = mongoose.model("Otp", otpSchema);
export default OTP;