const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// db.deliveryunit.insertOne({
//     _id: ObjectId(),
//     Name: "Standard Delivery",
//     Fee: 10.0
//   })

const DeliveryUnits = new Schema({
    _id: { type: Schema.Types.ObjectId },
    Name: { type: String, required: true },
    Fee: { type: Number, required: true },
});



module.exports = mongoose.model("DeliveryUnits", DeliveryUnits);