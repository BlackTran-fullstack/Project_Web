const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Feedbacks = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    Message: { type: String, required: true },
    Rating: { type: Number, required: true },
});

module.exports = mongoose.model("Feedbacks", Feedbacks);