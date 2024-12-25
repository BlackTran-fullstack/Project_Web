const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Users = new Schema(
    {
        googleId: { type: String, unique: true, sparse: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        verified: { type: Boolean },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Users", Users);
