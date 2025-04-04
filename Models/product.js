import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    productId : {
        type : String,
        required : true,
        unique : true
    },

    name : {
        type : String,
        required : true
    },

    altNames : {
        type : [String],
        default : []
    },

    price : {
        type : Number,
        required : true
    },

    labeledPrice : {
        type : Number,
        required : true
    },

    description : {
        type : String,
        required : true
    },

    images : {
        type : [String],
        required : true,
        default : ["https://imgs.search.brave.com/xZKdUWUZPbOCxIdHK8IX6sj0_QCIuS8F34TXPJtCTmg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTg0/Mjk3NjA3L3Bob3Rv/L2Nvc21ldGljLXBy/b2R1Y3RzLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz11NFJy/U1lHc0ZhS0tPLXNx/Zm04RGt4ZjUwckJj/T25SUGx4U0hWWHVU/ck5ZPQ"]
    },

    stock : {
        type : Number,
        required : true
    }

})

const Product = mongoose.model("products",productSchema)
export default Product;