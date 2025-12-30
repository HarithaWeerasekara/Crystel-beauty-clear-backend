import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// ⏱ Auto delete OTP after 5 minutes
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.model("OTP", OTPSchema);
