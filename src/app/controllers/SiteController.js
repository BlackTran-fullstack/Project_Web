const Products = require("../models/Products");
const Users = require("../models/Users");

const { mutipleMongooseToObject } = require("../../util/mongoose");
const { mongooseToObject } = require("../../util/mongoose");

const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("../../middlewares/passport");
const jwt = require("jsonwebtoken");

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
                req.flash("error", "Email already exists");
                return res.redirect("/register");
            }

            // Mã hóa mật khẩu và lưu người dùng mới
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new Users({ ...req.body, password: hashedPassword });

            await user.save();
            res.redirect("/login");
        } catch (error) {
            console.error("Error in registerUser:", error);
            req.flash("error", "An error has occurred. Please try again.");
            res.redirect("/register");
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
        res.redirect("/login");
    }

    // Middleware: Kiểm tra chưa đăng nhập
    checkNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }
        next();
    }

    // [GET] /cart
    cart(req, res) {
        const cart = req.session.cart || [];
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        res.render("cart", {
            cart: cart,
            total: total,  // Truyền tổng vào view
            user: req.user ? mongooseToObject(req.user) : null,
        });
    }
    

    // [POST] /cart/add
    addToCart(req, res) {
        const { productId, quantity } = req.body;
        const quantityInt = parseInt(quantity, 10);  // Đảm bảo quantity là kiểu số

        // Lấy thông tin sản phẩm từ database
        Products.findById(productId)
            .then((product) => {
                if (!product) {
                    return res.status(404).send("Product not found.");
                }

                // Khởi tạo giỏ hàng trong session nếu chưa có
                if (!req.session.cart) {
                    req.session.cart = [];
                }

                const cart = req.session.cart;

                // Kiểm tra nếu sản phẩm đã có trong giỏ hàng
                const existingItem = cart.find((item) => item.productId.toString() === productId);
                if (existingItem) {
                    // Cập nhật số lượng nếu sản phẩm đã có
                    existingItem.quantity += quantityInt;
                } else {
                    // Thêm mới sản phẩm vào giỏ hàng
                    cart.push({
                        productId: productId,
                        name: product.name,
                        price: product.price,
                        imagePath: product.imagePath,
                        quantity: quantityInt,
                    });
                }

                // Lưu lại giỏ hàng vào session
                req.session.cart = cart;
                res.redirect("/cart");
            })
            .catch((err) => {
                console.error("Error adding to cart:", err);
                res.status(500).send("Internal Server Error");
            });
    }

    // [POST] /cart/remove
    removeFromCart(req, res) {
        const { productId } = req.body;

        if (!req.session.cart) {
            return res.redirect("/cart");
        }

        req.session.cart = req.session.cart.filter(
            (item) => item.productId !== productId
        );

        res.redirect("/cart");
    }
}

module.exports = new SiteController();
