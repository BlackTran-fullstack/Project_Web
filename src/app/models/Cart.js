const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema cho từng mục trong giỏ hàng
const CartItem = new Schema({
    id: { type: Schema.Types.ObjectId, required: true, ref: "Products" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imagePath: { type: String },
    quantity: { type: Number, required: true, default: 1 },
});

// Schema cho giỏ hàng
const Cart = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: "Users" }, // Liên kết với collection Users
    items: [CartItem], // Danh sách các mục trong giỏ hàng
});

// Xuất mô hình
module.exports = mongoose.model("Cart", Cart);
