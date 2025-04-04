import express from 'express';
import bodyparser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import verifyJWT from './middleware/auth.js';
import orderRouter from './routes/orderRouter.js';


const app = express();

mongoose.connect("mongodb+srv://admin:123@cluster0.8i4jf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
    ()=>{
        console.log("Connected to the database");
    }
).catch(
    ()=>{
        console.log("Connection failed")
    }
)

//mongodb+srv://admin:123@cluster0.8i4jf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

app.use(bodyparser.json())
app.use(verifyJWT)




app.use("/api/user", userRouter);
app.use("/api/product", productRouter)
app.use("/api/order", orderRouter)


app.get("/",
    (req,res)=>{
     Student.find().then(
        (students)=>{
            res.json(students)
        }
     ).catch(
        ()=>{
            res.json(
                {
                    messege : "An error occurred"
                }
            )
        }
     )

    }
)

app.post("/", (req, res) => {
    // Correct the typo: mongoose.Schema (uppercase 'S')
    

    // Correct the way you are creating the student: use req.body (not req,body)
    const student = new Student(req.body);  // Corrected this line

    // Save the student to the database
    student.save().then(() => {
        res.json({
            message: "Student saved successfully"
        });
    }).catch(() => {
        res.json({
            message: "Student save failed"
        });
    });
});

 

app.delete("/",
    (req,res)=>{
        console.log(req,res)
        console.log("Delete request recived")
        res.json({
            massage: "This is a Delete Response"
        })
    }
)

app.put('/',
    (req,res)=>{
        console.log(req,res)
        console.log("Put request recived")
        res.json({
            massage: "This is put Response"
        })
    }
)

app.listen(3000, ()=>{
    console.log("sever is running on port 3000");
 }
)
