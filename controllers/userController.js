import User from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import axios from "axios";
import nodemailer from "nodemailer";
import Otp from "../Models/otp.js";
import OTP from "../Models/otp.js";
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports

    auth: {
        user: "Harithaweerasekara128@gmail.com",
        pass: "dsjljairizgdnlfo"
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

export async function sendOTP (req,res){

    const email = req.body.email;
    const otp = Math.floor(Math.random() * 90000) + 10000  
    const message = {

        from: "Harithaweerasekara128@gmail.com",
        to: email,
        subject: "OTP for Crystel Beauty Clear",
        text: `Your OTP is ${otp}`


    }
    const newOtp = new OTP({
        email: email,
        otp: otp
    })
    
    newOtp.save().then(()=>{
        console.log("OTP saved successfully");
    }
    )
    

    transporter.sendMail(message).then(()=>{
        res.status(200).json({
            message : "OTP sent successfully",
            otp : otp
        })
    }).catch(()=>{
        res.status(500).json({
            message : "Failed to send OTP"
        })
    })
    return;
    

}
export async function changePassword(req, res) {

    const email = req.body.email
    const password = req.body.password
    const otp = req.body.otp

    try {

        const lastOTPData = await OTP.findOne({

            email: email
        }).sort({ createdAt: -1 });
        if (!lastOTPData) {
            return res.status(404).json({
                message: "No OTP found for this email"
            });
        }
        if (lastOTPData.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        await User.updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );
        await OTP.deleteMany({
            email: email
        });

        res.status(200).json({
            message: "Password changed successfully"
        });

        
        
    } catch (error) {
        
        console.error("Error changing password:", error);
        res.status(500).json({
            message: "Error changing password"
        });
    }
}