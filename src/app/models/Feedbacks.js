const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Feedbacks = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    message: { type: String, required: true },
    rating: { type: Number, required: true },
});

module.exports = mongoose.model("Feedbacks", Feedbacks);
