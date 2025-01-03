const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Feedbacks = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    rating: { type: Number, required: true },
});

module.exports = mongoose.model("Feedbacks", Feedbacks);