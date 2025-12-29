import express from 'express';
import bodyparser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';

import orderRouter from './routes/orderRouter.js';
import dotenv from 'dotenv';
import cors from 'cors'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

import cors from "cors";

app.use(
  cors({
    origin: [
      "https://cbc-frontend-seven.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use("/api/user", userRouter);
app.use("/api/product", productRouter)
app.use("/api/order", orderRouter)






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
