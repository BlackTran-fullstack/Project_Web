const Products = require("../models/Products");
const Cart = require("../models/Cart");

const { mutipleMongooseToObject } = require("../../util/mongoose");
const { mongooseToObject } = require("../../util/mongoose");

class CartController {
    // [GET] /cart
    async cart(req, res) {
        try {
            const userId = req.user.id;

            const cartItems = await Cart.find({ userId }).populate("productId");

            // Kiểm tra sự tồn tại của item.productId trước khi truy cập các thuộc tính của nó
            const cart = cartItems
                .map((item) => {
                    if (!item.productId) {
                        console.error(
                            `Product not found for cart item with ID ${item._id}`
                        );
                        return null; // Tránh việc truy cập vào thuộc tính undefined
                    }
                    const subtotal = item.productId.price * item.quantity;
                    return {
                        productId: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        imagePath: item.productId.imagePath,
                        quantity: item.quantity,
                        subtotal,
                    };
                })
                .filter((item) => item !== null); // Lọc bỏ các giá trị null nếu có lỗi ở sản phẩm

            const total = cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            res.render("cart", {
                cart,
                total,
                user: mongooseToObject(req.user),
            });
        } catch (error) {
            console.error("Error retrieving cart:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // [POST] /cart/add
    async addToCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user.id; //Lay thong tin user da dang nhap
            const quantityInt = parseInt(quantity, 10);

            if (isNaN(quantityInt) || quantityInt <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid quantity",
                });
            }

            const product = await Products.findById(productId);

            if (!product) {
                return res
                    .status(404)
                    .json({ success: false, message: "Product not found" });
            }

            //Kiem tra xem trong cart da co san pham nay chua
            const existingCart = await Cart.findOne({ userId, productId });

            if (existingCart) {
                // Neu co thi cong them so luong
                existingCart.quantity += quantityInt;
                await existingCart.save(); // Luu vao database
            } else {
                // Chua co thi tao moi
                const newCart = new Cart({
                    userId,
                    productId,
                    quantity: quantityInt,
                });
                await newCart.save(); // Luu vao database
            }
            res.status(200).json({
                success: true,
                message: "Product added to cart successfully",
            });
        } catch (error) {
            console.error("Error adding to cart:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }

    // [POST] /cart/remove
    async removeFromCart(req, res) {
        try {
            const { productId } = req.body;
            const userId = req.user.id;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required",
                });
            }

            const result = await Cart.findOneAndDelete({ userId, productId });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found in cart",
                });
            }

            // Tính lại tổng tiền sau khi xóa sản phẩm
            const cartItems = await Cart.find({ userId }).populate("productId");

            // Kiểm tra sự tồn tại của item.productId trước khi truy cập các thuộc tính của nó
            const cart = cartItems
                .map((item) => {
                    if (!item.productId) {
                        console.error(
                            `Product not found for cart item with ID ${item._id}`
                        );
                        return null; // Tránh việc truy cập vào thuộc tính undefined
                    }
                    const subtotal = item.productId.price * item.quantity;
                    return {
                        productId: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        imagePath: item.productId.imagePath,
                        quantity: item.quantity,
                        subtotal,
                    };
                })
                .filter((item) => item !== null); // Lọc bỏ các giá trị null nếu có lỗi ở sản phẩm

            const total = cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            res.status(200).json({
                success: true,
                message: "Item removed from cart successfully",
                removedItem: result,
                newTotal: total,
            });
        } catch (error) {
            console.error("Error removing from cart:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }

    // [GET] /cart/summary
    async cartSummary(req, res) {
        try {
            const userId = req.user.id;
            const cartItems = await Cart.find({ userId });
            const totalQuantity = cartItems.reduce((sum) => sum + 1, 0);

            res.json({ totalQuantity });
        } catch (error) {
            console.error("Error retrieving cart summary:", error);
            res.status(500).json({ totalQuantity: 0 });
        }
    }
}

module.exports = new CartController();
