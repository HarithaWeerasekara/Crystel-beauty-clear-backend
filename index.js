import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";

dotenv.config();

const app = express();

/* =========================
   CORS (FIXED)
========================= */
app.use(
  cors({
    origin: [
      "https://cbc-frontend-seven.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 VERY IMPORTANT (preflight support)
app.options("*", cors());

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(bodyParser.json());

/* =========================
   ROUTES
========================= */
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);

/* =========================
   DB
========================= */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to database"))
  .catch(() => console.log("DB connection failed"));

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
