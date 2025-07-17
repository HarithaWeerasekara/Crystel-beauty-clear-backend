import express from "express";
import { createOrder, getOrders, updateOrder } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.post("/:orderId", updateOrder)

export default orderRouter;


