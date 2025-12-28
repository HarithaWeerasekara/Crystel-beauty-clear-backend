import express from 'express';
import { createProduct, deleteProduct, getProductById, getProducts, searchProducts, updateProduct } from '../controllers/productController.js';
import verifyJWT from '../middleware/auth.js';



const productRouter = express.Router();

productRouter.post("/",createProduct)
productRouter.get("/",getProducts)
productRouter.get("/search/:id", searchProducts)
productRouter.get("/:id", getProductById);
productRouter.delete("/:productId",deleteProduct)
productRouter.put("/:productId", verifyJWT, updateProduct);



export default productRouter;