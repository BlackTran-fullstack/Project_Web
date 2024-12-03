const Cart = require("../models/Cart");
const { mutipleMongooseToObject } = require("../../util/mongoose");
const { mongooseToObject } = require("../../util/mongoose");

class CartController {
    // [POST] /cart/add
    async add(req, res, next) {
        try {
            const userId = req.user.id;
            const { id, name, price, image, quantity } = req.body;
            console.log(req.user.id);

            if (!id || !name || !price || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields.",
                });
            }

            let cart;
            try {
                cart = await Cart.findOne({ userId });
                console.log("Cart found:", cart);
            } catch (err) {
                console.error("Error finding cart:", err);
            }

            if (!cart) {
                cart = new Cart({ userId, items: [] });
            }

            const existingItem = cart.items.find(
                (item) => item.id.toString() === id
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ id, name, price, image, quantity });
            }

            await cart.save();

            res.json({
                success: true,
                message: "Product added to cart.",
                cart,
            });
        } catch (error) {
            console.error("Error adding to cart:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }
}

module.exports = new CartController();
