import User from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import axios from "axios";
dotenv.config()
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
                messege : "Email Error"
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
                    messege : "Password Error"
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
            const newUser = new User({
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                role: "user",
                isEmailVerified: true,
                password: accessToken // Consider hashing or generating a random password
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
                isDisabled: user.isDisabled || false,
                isEmailVerified: user.isEmailVerified || false
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