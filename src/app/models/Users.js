const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Users = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Users", Users);
