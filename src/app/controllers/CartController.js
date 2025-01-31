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

    // [GET] /cart/api/products
    // getPaginatedCart(req, res, next) {
    //     if (res.paginatedResults) {
    //         res.json(res.paginatedResults);
    //     } else {
    //         res.status(500).json({ message: "Pagination results not found" });
    //     }
    // }

    async getPaginatedCart(req, res, next) {
        try {
            const userId = req.user.id;

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 3;

            const skip = (page - 1) * limit;

            const cartItems = await Cart.find({ userId })
                .populate("productId")
                .skip(skip)
                .limit(limit);

            const totalItems = await Cart.countDocuments({ userId });
            const totalPages = Math.ceil(totalItems / limit);

            const cart = cartItems
                .map((item) => {
                    if (!item.productId) {
                        console.error(
                            `Product not found for cart item with ID ${item._id}`
                        );
                        return null;
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
                .filter((item) => item !== null);

            const total = cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            res.json({
                cart,
                total,
                page,
                totalPages,
            });
        } catch (error) {
            console.error("Error paginating cart:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [POST] /cart/add
    async addToCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user ? req.user.id : null;
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
                    .json({ success: false, message: "Product not found." });
            }

            if (product.stock < quantityInt) {
                return res.status(404).json({ success: false, message: "Product quantity is not enough."})
            }

            product.stock -= quantity;
            await product.save();

            if (userId) {
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
            } else {
                return res.status(401).json({
                    success: false,
                    message: "User not logged in. Save cart in client-side storage."
                })
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }

    // [POST] /cart/sync
    async syncCart(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not logged in",
                });
            }

            const userId = req.user.id;
            const cartItems = req.body;

            for (const item of cartItems) {
                const { productId, quantity } = item;
                const quantityInt = parseInt(quantity, 10);
                
                if (isNaN(quantityInt) || quantityInt <= 0) {
                    continue;
                }

                const product = await Products.findById(productId);
                if (!product) {
                    continue;
                }

                const existingCart = await Cart.findOne({ userId, productId});

                if (existingCart) {
                    existingCart.quantity += quantityInt;
                    await existingCart.save();
                } else {
                    const newCart = new Cart({
                        userId, 
                        productId, 
                        quantity: quantityInt,
                    });
                    await newCart.save();
                }
            }

            res.status(200).json({
                success: true,
                message: "Cart synchronized successfully",
            })
        } catch(error) {
            console.error("Error synchronizing cart:", error);
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

            const cartItem = await Cart.findOne({ userId, productId});
            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found in cart",
                });
            }

            const quantityInCart = cartItem.quantity;

            const product = await Products.findById(productId);
            if (product) {
                product.stock += quantityInCart;
                await product.save();
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
