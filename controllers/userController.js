import User from "../Models/user.js";
import OTP from "../Models/otp.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

import transporter from "../config/mail.js";

/* =========================
   REGISTER USER
========================= */
export async function saveUser(req, res) {
  try {
    // 🔐 Admin creation protection
    if (req.body.role === "admin") {
      if (!req.user) {
        return res.status(403).json({
          message: "Please login as admin before creating admin account",
        });
      }

      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "You are not authorized",
        });
      }
    }

    // 🚫 Duplicate email check
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
      role: req.body.role || "user",
    });

    await user.save();

    return res.status(201).json({
      message: "User saved successfully",
    });
  } catch (error) {
    console.error("Save user error:", error);
    return res.status(500).json({
      message: "User registration failed",
    });
  }
}

/* =========================
   LOGIN
========================= */
export function loginUser(req, res) {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(403).json({ message: "Incorrect password" });
      }

      const userData = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        isDisabled: user.isDisabled,
        isEmailVerified: user.isEmailVerified,
      };

      const token = jwt.sign(userData, process.env.JWT_KEY, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: userData,
      });
    })
    .catch((error) => {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    });
}

/* =========================
   GOOGLE LOGIN
========================= */
export async function googleLogin(req, res) {
  try {
    const { accessToken } = req.body;

    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let user = await User.findOne({ email: response.data.email });

    if (!user) {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        10
      );

      user = new User({
        email: response.data.email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        role: "user",
        isEmailVerified: true,
        password: randomPassword,
      });

      await user.save();
    }

    const userData = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || "Not given",
      isDisabled: user.isDisabled || false,
      isEmailVerified: user.isEmailVerified || false,
    };

    const token = jwt.sign(userData, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({
      message: "Google login failed",
    });
  }
}

/* =========================
   GET LOGGED USER
========================= */
export async function getUser(req, res) {
  if (!req.user) {
    return res.status(403).json({
      message: "Please login first",
    });
  }

  try {
    const user = await User.findOne({ email: req.user.email }).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving user" });
  }
}

/* =========================
   SEND OTP
========================= */
export async function sendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // ⏱ Cooldown: 1 minute
    const recentOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (recentOTP) {
      const diff = Date.now() - new Date(recentOTP.createdAt).getTime();
      if (diff < 60 * 1000) {
        return res.status(429).json({
          message: "Please wait 1 minute before requesting another OTP",
        });
      }
    }

    // 🧹 Remove old OTPs
    await OTP.deleteMany({ email });

    // 🔐 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({ email, otp });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Crystel Beauty Clear",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
}

/* =========================
   CHANGE PASSWORD
========================= */
export async function changePassword(req, res) {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const otpData = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpData) {
      return res.status(404).json({ message: "OTP expired or not found" });
    }

    // ⏳ OTP expiry: 5 minutes
    const OTP_EXPIRY = 5 * 60 * 1000;
    const diff = Date.now() - new Date(otpData.createdAt).getTime();
    if (diff > OTP_EXPIRY) {
      await OTP.deleteMany({ email });
      return res.status(410).json({ message: "OTP expired" });
    }

    if (String(otpData.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    await OTP.deleteMany({ email });

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/* =========================
   ADMIN: BLOCK USER
========================= */
export async function blockUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDisabled = true;
    user.isEmailVerified = false;
    await user.save();

    return res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error blocking user" });
  }
}

/* =========================
   ADMIN: UNBLOCK USER
========================= */
export async function unblockUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDisabled = false;
    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error unblocking user" });
  }
}

/* =========================
   ADMIN: GET ALL USERS
========================= */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).select("-password -__v");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users" });
  }
}
