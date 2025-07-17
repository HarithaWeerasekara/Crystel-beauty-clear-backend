import express from 'express';
import bodyparser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import verifyJWT from './middleware/auth.js';
import orderRouter from './routes/orderRouter.js';
import dotenv from 'dotenv';
import cors from 'cors'
dotenv.config()


const app = express();
app.use(cors(

))

mongoose.connect(process.env.MONGO_URL).then(
    ()=>{
        console.log("Connected to the database");
    }
).catch(
    ()=>{
        console.log("Connection failed")
    }
)

app.use(bodyparser.json())
app.use(verifyJWT)


app.use("/api/user", userRouter);
app.use("/api/product", productRouter)
app.use("/api/order", orderRouter)






app.listen(3000, ()=>{
    console.log("server is running on port 3000");
 }
)
