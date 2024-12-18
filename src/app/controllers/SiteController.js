const Products = require("../models/Products");
const Users = require("../models/Users");
const Cart = require("../models/Cart");

const { mutipleMongooseToObject } = require("../../util/mongoose");
const { mongooseToObject } = require("../../util/mongoose");

const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("../../middlewares/passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

initializePassport(
    passport,
    (email) => {
        return Users.findOne({ email: email });
    },
    (id) => {
        return Users.findById(id);
    }
);

class SiteController {
    // [GET] /
    home(req, res, next) {
        Products.find({})
            .limit(8)
            .then((products) => {
                res.render("home", {
                    products: mutipleMongooseToObject(products),
                    user: mongooseToObject(req.user), // Gửi thông tin người dùng nếu đăng nhập
                });
            })
            .catch(next);
    }

    search(req, res, next) {
        const search = req.query.q;
        const showAll = req.query.showAll === "true";

        if (!search) {
            return res.render("search", {
                products: [],
                user: mongooseToObject(req.user),
            });
        } else {
            // Tìm kiếm sản phẩm theo tên
            Products.find({
                $or: [
                    { name: { $regex: search, $options: "i" } }, // Tìm kiếm theo tên (không phân biệt chữ hoa/thường)
                    { description: { $regex: search, $options: "i" } }, // Tìm kiếm theo mô tả
                ],
            })

                .then((products) => {
                    const result = showAll ? products : products.slice(0, 4);
                    res.render("search", {
                        products: mutipleMongooseToObject(result),
                        showAll, // Gửi trạng thái showAll để hiển thị nút "Show All Result"
                        q: search,
                        user: mongooseToObject(req.user),
                    });
                    //res.json(products);
                })
                .catch(next);
        }
    }

    // [GET] /login
    login(req, res) {
        let rememberedEmail = "";
        const token = req.cookies.rememberMe;

        if (token) {
            try {
                // Giải mã JWT để lấy email
                const decoded = jwt.verify(token, "secret-key"); // Sử dụng "secret-key" đã dùng để mã hóa
                rememberedEmail = decoded.email; // Lấy email từ payload
            } catch (err) {
                console.error("Invalid token:", err);
            }
        }

        res.render("login", { rememberedEmail });
    }

    // [POST] /login
    loginUser(req, res, next) {
        passport.authenticate("local", (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                req.flash("error", info.message);
                return res.redirect("/login");
            }

            req.logIn(user, (err) => {
                if (err) return next(err);

                // Nếu chọn "Remember Me"
                if (req.body.rememberMe) {
                    const token = jwt.sign(
                        { email: user.email },
                        "secret-key",
                        {
                            expiresIn: "7d",
                        }
                    );
                    res.cookie("rememberMe", token, {
                        httpOnly: true,
                        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
                    });
                }

                res.redirect("/");
            });
        })(req, res, next);
    }

    // [GET] /register
    register(req, res, next) {
        res.render("register", { error: req.flash("error") });
    }

    // [POST] /register
    async registerUser(req, res) {
        try {
            const { email, password } = req.body;

            // Kiểm tra email đã tồn tại
            const existingUser = await Users.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    errors: ["Email already exists."],
                });
            }

            // Mã hóa mật khẩu và lưu người dùng mới
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new Users({ ...req.body, password: hashedPassword });
            await user.save();

            res.status(200).json({
                success: true,
                message: "Registration successful.",
            });
        } catch (error) {
            console.error("Error in registerUser:", error);
            res.status(500).json({
                success: false,
                errors: ["Server error. Please try again later."],
            });
        }
    }

    // [POST] /logout
    logout(req, res, next) {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect("/login");
        });
    }

    // Middleware: Kiểm tra đã đăng nhập
    checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect("/login");
    }

    // Middleware: Kiểm tra chưa đăng nhập
    checkNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }
        next();
    }

    // [GET] /checkout
    async checkout(req, res, next) {
        try {
            const userId = req.user.id;
            const cartItems = await Cart.find({ userId }).populate("productId");

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
                        name: item.productId.name,
                        price: item.productId.price,
                        quantity: item.quantity,
                        subtotal,
                    };
                })
                .filter((item) => item !== null); // Lọc bỏ các giá trị null nếu có lỗi ở sản phẩm

            const total = cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            res.render("checkout", {
                cart,
                total,
                user: mongooseToObject(req.user),
            });
        } catch (error) {
            console.error("Error retrieving cart:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}

module.exports = new SiteController();
