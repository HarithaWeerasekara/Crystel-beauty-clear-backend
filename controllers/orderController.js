import Order from "../Models/order.js";
import Product from "../Models/product.js";



export async function createOrder(req,res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        })
        return;
    }
    const body = req.body
    const orderData = {

        orderId : "",
        email : req.user.email,
        name : body.name,
        address : body.address,
        phoneNumber : body.phoneNumber,
        billItems : [],
        total : 0

    }
    const lastBills = Order.find().sort({
        date : -1
    }).limit(1).then(async (lastBills)=>{
        if(lastBills.length == 0) {
            orderData.orderId = "ORD0001"
        }else{
        
            const lastbill = lastBills [0];
            const lastOrderId = lastbill.orderId;
            const lastOrderNumber = lastOrderId.replace("ORD", " ")
            const lastOrderNumberInt = parseInt(lastOrderNumber);
            const newOrderNumberInt = lastOrderNumberInt + 1;
            const newOrderNumberStr = newOrderNumberInt.toString().padStart(4, '0');
            orderData.orderId = "ORD" + newOrderNumberStr;
            
        
        
        }

        for (let i = 0; i < body.billItems.length; i++) {
  const item = await Product.findOne({
    productId: body.billItems[i].productId,
  });

  if (!item) {
    res.status(404).json({
      message: "Product with productId " + body.billItems[i].productId + " not found",
    });
    return;
  }

  orderData.billItems.push({
    productId: item.productId,
    productName: item.name,
    image: item.images?.[0] || "",
    quantity: body.billItems[i].quantity,
    price: item.price,
  });

  orderData.total += item.price * body.billItems[i].quantity;
}

        
        const order = new Order(orderData);
        order.save().then((savedOrder)=>{
           console.log("✅ Order saved:", savedOrder);

            res.json({
            message: "Order saved successfully",
            order: savedOrder, // optional: also return it to frontend
  });
        
        }).catch((err)=> {
            console.log(err);
            res.status(500).json({
                message : "Order not saved"
            })
        })
    })
};

export function getOrders(req,res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        })
        return;
    }
    if (req.user.role == "admin") {

        Order.find().then(
            (orders)=>{
                res.json(orders)
            }
        ).catch(
            (err)=>{
                res.status(500).json({

                    message : "Orders not found"

                })
            }
        )

    }else{
        Order.find({
            email : req.user.email
        }).then(

            (orders)=>{
                res.json(orders)
            }

        ).catch(
            (err)=>{
                res.status(500).json({
                    message : "Orders not found"
                })
            }
        )
    }
    

}
 
export async function  updateOrder (req,res){

    try {

        const { status } = req.body;


        if(req.user == null){

            res.status(403).json({
                message : "Please login before change data"
            })
            return
        }

        if(req.user.role != "admin"){

            res.status(403).json({
                message : "Not Authorized"
            })
            return

        }

        const orderId = req.params.orderId;
        const order = await Order.findOneAndUpdate(
            { orderId },             
            { status },
            { new: true }
        );

        res.json({

            message : "Order updated successfully"

        });

    } catch (error) {

        res.status(500).json({
            message : "order not updated"
        })
        
    }

}