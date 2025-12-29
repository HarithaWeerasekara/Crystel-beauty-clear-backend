import User from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../Models/otp.js";
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports

    auth: {
        user: "Harithaweerasekara128@gmail.com",
        pass: (process.env.PASS)
    }
});


export function saveUser(req, res) {

    if (req.body.role == "admin"){

            if (req.user==null) {

                res.status(403).json({
                    message: "Please login as admin before create admin account",
                });
            return;
                
            }

            if(req.user.role != "admin"){

                res.status(403).json({

                    message : "you are not Authorized"
                })
            }
    }



    const hashedpassword = bcrypt.hashSync(req.body.password, 10)
    const user = new User({
        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        password : hashedpassword,
        role : req.body.role,
    })

    user.save().then(()=>{
        res.status(200).json({
            message : "user saved successfully"
        })
        return;
    }).catch(()=>{
        res.status(500).json({
            message : "user saved unsuccessfully"
        })
        return;
    })
}

export function loginUser(req,res){

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        email : email
    }).then((user)=>{
        if (user == null) {
            res.status(404).json({
                message : "Email Error"
            })
        }else{
            const isPasswordCorrect = bcrypt.compareSync(password, user.password)
            if(isPasswordCorrect){
             const userData = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                phone: user.phone,
                isDisabled: user.isDisabled,
                isEmailVerified: user.isEmailVerified
             }

             

             const token = jwt.sign(userData,process.env.JWT_KEY)

             res.status(200).json ({
                message: "Login successful",
                token: token,
                user : userData
             });



            }else{
                res.status(403).json({
                    message : "Password Error"
                })
            }
        }
    })

} 

export async function googleLogin(req,res) {

    const accessToken = req.body.accessToken;

    try {

        const response = await axios.get ("https://www.googleapis.com/oauth2/v3/userinfo",{

            headers : {
                Authorization : `Bearer ${accessToken}`
            }

        })

        const user = await User.findOne({
            email: response.data.email
        });

        let userData;
        if (user == null) {
            // Generate a random password for the new user
            const randomPassword = bcrypt.hashSync(Math.random().toString(36).slice(-8), 10);
            const newUser = new User({
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                role: "user",
                isEmailVerified: true,
                password: randomPassword
            });
        
            await newUser.save();
        
            userData = {
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                role: "user",
                phone: "Not given",
                isDisabled: false,
                isEmailVerified: true
            };
        } else {
            userData = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                phone: user.phone || "Not given",
                isDisabled: user.isDisabled != null ? user.isDisabled : false,
                isEmailVerified: user.isEmailVerified != null ? user.isEmailVerified : false
            };
        }

        const token = jwt.sign(userData, process.env.JWT_KEY);

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: userData
        });
        
    } catch (error) {

        res.status(500).json({
            message : "Google login failed"
        })
        
    }

    
}

export function getUser(req, res) {

    if (req.user == null) {

        res.status(403).json({
            message: "Please login before get data"
        });
        return;
    }

    User.findOne({
        email: req.user.email
    }).then((user) => {
        if (user == null) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        } else {
            res.json(user);
            return;
        }
    }).catch((error) => {
        res.status(500).json({
            message: "Error retrieving user",
            error: error.message
        });
        return;
    });
}

export async function sendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 🔥 DELETE OLD OTP (FIX FOR DUPLICATE KEY ERROR)
    await OTP.deleteMany({ email });

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Save new OTP
    await OTP.create({
      email,
      otp,
      createdAt: new Date(),
    });

    // ✅ Email message
    const message = {
      from: "Harithaweerasekara128@gmail.com",
      to: email,
      subject: "OTP for Crystel Beauty Clear",
      text: `Your OTP is ${otp}`,
    };

    // ✅ Send email
    await transporter.sendMail(message);

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
}



export async function changePassword(req, res) {
  const { email, password, otp } = req.body;

  try {
    // 1️⃣ Check OTP
    const lastOTPData = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!lastOTPData) {
      return res.status(404).json({ message: "OTP not found or expired" });
    }

    // 2️⃣ Compare OTP (convert type)
    if (String(lastOTPData.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 3️⃣ Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    // 5️⃣ Remove OTPs
    await OTP.deleteMany({ email });

    res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
}



export async function blockUser(req, res) {
    try {
        const adminUser = req.user;
        const { userId } = req.params; // ⚠️ Must come from params, not body!

        console.log("🔐 Authenticated user:", adminUser);
        console.log("📦 Received userId to block:", userId);

        // Check if requester is admin
        if (adminUser.role !== "admin") {
            console.warn("⛔ Not authorized: role =", adminUser.role);
            return res.status(403).json({ message: "Not Authorized" });
        }

        // Find the user to be blocked
        const user = await User.findById(userId);
        if (!user) {
            console.warn("❌ User not found for ID:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        // Update user status
        user.isDisabled = true;
        user.isEmailVerified = false;

        await user.save();

        console.log("✅ User blocked successfully:", user.email);

        return res.status(200).json({ message: "User blocked successfully" });

    } catch (error) {
        console.error("🔥 Error in blockUser controller:", error);
        return res.status(500).json({ message: "Error blocking user" });
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await User.find({}).select("-password -__v");
        return res.status(200).json(users);
    } catch (error) {
        console.error("🔥 Error fetching users:", error);
        return res.status(500).json({ message: "Error fetching users" });
    }
}

export async function unblockUser(req, res) {
    try {
        const adminUser = req.user;
        const { userId } = req.params;

        if (adminUser.role !== "admin") {
            return res.status(403).json({ message: "Not Authorized" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isDisabled = false;
        user.isEmailVerified = true;

        await user.save();

        res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        console.error("❌ Error unblocking user:", error);
        res.status(500).json({ message: "Error unblocking user" });
    }
}
