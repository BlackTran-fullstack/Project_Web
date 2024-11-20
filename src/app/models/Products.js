const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Products = new Schema(
    {
        name: { type: String, required: true, default: "" },
        description: { type: String },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        long_description: { type: String },
        slug: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Products", Products);
