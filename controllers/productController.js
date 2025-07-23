import Product from "../Models/product.js";

export function createProduct(req,res) {
    if (req.user == null) {
        res.status(403).json({
            message : "you need to login first"
        })

        return;
    }
    
    if (req.user.role != "admin") {
        res.status(403).json({
            message : "You are not authorized to create a product"
        })

        return;
    }

    const product = new Product(req.body);

    product.save().then(
        ()=>{
            res.json({
                message : "product saved successfully"
            })
            
        }
    ).catch(
        (err)=>{
            console.log(err);
            res.status(500).json({
                message : "Product not saved"
            })
            
        }
    )
}

export function getProducts(req,res){
    Product.find().then(
        (products)=>{
            res.json(products)
        }
    ).catch(
        (err)=>{
            res.status(500).json({
                message : " Products not found "
            })
        }
    )
}


export async function getProductById (req, res) {
        const productId = req.params.id
        console.log(productId);
        const product = await Product.findOne({productId : productId})
        if (product == null){
            res.status(404).json({
                message : "Product not found"
            })
            return;
        }
        res.json({product : product});
}

export function deleteProduct(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "You need to login first"
        })
        return;
    }

    if (req.user.role != "admin") {
        res.status(403).json({
            message: "You are not authorized to delete a product"
        })
        return;
    }
    
    Product.findOneAndDelete({
        productId : req.params.productId
    }).then(
        ()=>{
            res.json({
                message : " product deleted successfully "
            })
        }
    ).catch(
        (err)=>{
            res.status(500).json({
                message : "Product not deleted"
            })
        }
    )
}

export function updateProduct(req, res) {
    if (req.user == null) {
        return res.status(403).json({
            message: "You need to login first"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "You are not authorized to update a product"
        });
    }

    Product.findOneAndUpdate(
        { productId: req.params.productId }, 
        req.body, 
        { new: true } 
    )
    .then((updatedProduct) => {
        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully"
        });
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({
            message: "Product not updated"
        });
    });
}

export async function searchProducts(req,res){
    try{
        const search = req.params.id;
        const product = await Product.find({
        
            $or: [
                { name: { $regex: search, $options: 'i' } },
        { altNames: { $regex: search, $options: 'i' } }
            ],

        
        })
        res.json({
            products : product
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message : "Products not found"
        })
    }
        
}