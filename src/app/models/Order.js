const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const order = {
//     userId: userId,
//     products: cart,
//     total: total,
//     deliveryUnit: deliveryUnit.Name,
//     paymentMethod: req.body.paymentMethod,
// };

const Orders = new Schema({
    _id: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    products: { type: Array },
    total: { type: Number },
    deliveryUnit: { type: Schema.Types.ObjectId, ref: "DeliveryUnits" },
    paymentMethod: { type: Schema.Types.ObjectId, ref: "PaymentMethods" },
    status: { type: String, default: "Pending" },   
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model("Orders", Orders);