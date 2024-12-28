const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentMethods = new Schema({
    _id: { type: Schema.Types.ObjectId },
    Name: { type: String, required: true }
});



module.exports = mongoose.model("PaymentMethods", PaymentMethods);