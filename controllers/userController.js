import User from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
        res.json({
            messege : "user saved successfully"
        })
        return;
    }).catch(()=>{
        res.status(500).json({
            messege : "user saved unsuccessfully"
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
            res.json({
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

             

             const token = jwt.sign(userData,"random456")

             res.json ({
                messege: "Loginn successful",
                token: token
             });



            }else{
                res.json({
                    messege : "Password Error"
                })
            }
        }
    })

} 