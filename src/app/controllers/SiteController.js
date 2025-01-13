const Products = require("../models/Products");
const Users = require("../models/Users");
const Cart = require("../models/Cart");
const UsersVerification = require("../models/UsersVerification");
const PasswordReset = require("../models/PasswordReset");
const DeliveryUnits = require("../models/DeliveryUnits");
const PaymentMethods = require("../models/PaymentMethods");
const Orders = require("../models/Orders");
const OrderDetails = require("../models/OrderDetails");

const { mutipleMongooseToObject } = require("../../util/mongoose");
const { mongooseToObject } = require("../../util/mongoose");

const initializePassport = require("../../middlewares/passport");

const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

// path for static verified page
const path = require("path");
const { stat } = require("fs");
const mongoose = require("../../util/mongoose");
const { default: axios } = require("axios");

// nodemailer stuff
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

// testing success
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Ready for messages");
        console.log(success);
    }
});

initializePassport(
    passport,
    (email) => {
        return Users.findOne({ email: email });
    },
    (id) => {
        return Users.findById(id);
    }
);

// Gửi email xác minh
const sendVerificationEmail = async (user) => {
    const currentUrl = "http://localhost:3000/";

    const uniqueString = uuidv4() + user._id;

    try {
        // Tạo token xác minh
        const saltRounds = 10;
        const hashedUniqueString = await bcrypt.hash(uniqueString, saltRounds);

        const newVerification = new UsersVerification({
            userId: user._id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000,
        });
        await newVerification.save();

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: user.email,
            subject: "Verify Your Email",
            html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=${
                currentUrl + "verify/" + user._id + "/" + uniqueString
            }>here</a> to process.</p>`,
        };

        console.log(mailOptions.html);

        // Gửi email
        await transporter.sendMail(mailOptions);
        return {
            status: "PENDING",
            message: "Verification email sent",
        };
    } catch (error) {
        console.error("Error in sendVerificationEmail:", error);
        throw new Error("Failed to send verification email.");
    }
};

const sendOTPVerificationEmail = async (user, res) => {
    try {
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

        // Xóa OTP cũ trước khi tạo mới
        await PasswordReset.deleteOne({ userId: user._id });

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: user.email,
            subject: "Reset Password OTP",
            html: `<p>Your OTP for resetting your password is <b>${otp}</b><p>This code <b>expires in 1 hour</b></p>.</p>`,
        };

        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);

        const newOTPVerification = new PasswordReset({
            userId: user._id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        await newOTPVerification.save();

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error in sendOTPVerificationEmail:", error);
        res.status(500).json({
            success: false,
            errors: ["Failed to send OTP. Please try again later."],
        });
    }
};

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

    // [GET] /search
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

    // [GET] /search-ajax
    searchAjax(req, res, next) {
        const search = req.query.q;

        if (!search) {
            return res.json({ products: [] });
        }

        Products.find({
            $or: [
                { name: { $regex: search, $options: "i" } }, // Tìm kiếm theo tên
                { description: { $regex: search, $options: "i" } }, // Tìm kiếm theo mô tả
            ],
        })
            .then((products) => {
                res.json({ products: mutipleMongooseToObject(products) });
            })
            .catch(next);
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
                return res.status(400).json({
                    success: false,
                    errors: [info.message],
                });
            }

            if (user.isBanned) {
                return res.status(400).json({
                    success: false,
                    errors: ["Account has been banned."],
                });
            }

            if (!user.verified) {
                return res.status(400).json({
                    success: false,
                    errors: ["Please verify your email address."],
                });
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

                return res.status(200).json({
                    success: true,
                    message: "Login successful.",
                });
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
            const user = new Users({
                ...req.body,
                password: hashedPassword,
                verified: false,
            });

            await user.save();

            // Gửi email xác minh
            sendVerificationEmail(user);

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

    // [GET] /verify/:userId/:uniqueString
    verifyEmail(req, res) {
        const { userId, uniqueString } = req.params;

        UsersVerification.find({ userId })
            .then((result) => {
                if (result.length > 0) {
                    // user verification record exists so we proceed

                    const { expiresAt } = result[0];
                    const hashedUniqueString = result[0].uniqueString;

                    console.log(userId);
                    console.log(uniqueString);

                    console.log(hashedUniqueString);

                    console.log(
                        bcrypt.compare(uniqueString, hashedUniqueString)
                    );

                    // checking for expired unique string
                    if (expiresAt < Date.now()) {
                        // record has expired so we delete it
                        UsersVerification.deleteOne({ userId })
                            .then((result) => {
                                Users.deleteOne({ _id: userId })
                                    .then(() => {
                                        const message =
                                            "Link has expired. Please sign up again.";
                                        res.redirect(
                                            `/verified/error=true&message=${message}`
                                        );
                                    })
                                    .catch((error) => {
                                        const message =
                                            "Clearing user width expired unique string failed.";
                                        res.redirect(
                                            `/verified/error=true&message=${message}`
                                        );
                                    });
                            })
                            .catch((error) => {
                                console.log(error);
                                const message =
                                    "An error occurred while clearing expired user verification record.";
                                res.redirect(
                                    `/verified/error=true&message=${message}`
                                );
                            });
                    } else {
                        // valid record exists so we validate the user string
                        // first compare the hashed unique string
                        bcrypt
                            .compare(uniqueString, hashedUniqueString)
                            .then((result) => {
                                if (result) {
                                    // strings match

                                    Users.updateOne(
                                        { _id: userId },
                                        { verified: true }
                                    )
                                        .then(() => {
                                            UsersVerification.deleteOne({
                                                userId,
                                            })
                                                .then(() => {
                                                    res.sendFile(
                                                        path.join(
                                                            __dirname,
                                                            "./../../resources/views/verified.html"
                                                        )
                                                    );
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                    const message =
                                                        "An error occurred while finalizing successful verification.";
                                                    res.redirect(
                                                        `/verified/error=true&message=${message}`
                                                    );
                                                });
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            const message =
                                                "An error occurred while updating user record to show verified.";
                                            res.redirect(
                                                `/verified/error=true&message=${message}`
                                            );
                                        });
                                } else {
                                    // existing record but incorrect verification details passed.
                                    const message =
                                        "Invalid verification details passed. Check your inbox.";
                                    res.redirect(
                                        `/verified/error=true&message=${message}`
                                    );
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                const message =
                                    "An error occurred while comparing unique strings.";
                                res.redirect(
                                    `/verified/error=true&message=${message}`
                                );
                            });
                    }
                } else {
                    // user verification record doesn't exist
                    const message =
                        "Account record doesn't exist or has been verified already. Please sign up or log in.";
                    res.redirect(`/verified/error=true&message=${message}`);
                }
            })
            .catch((error) => {
                console.log(error);
                const message =
                    "An error occurred while checking for existing user verification record";
                res.redirect(`/verified/error=true&message=${message}`);
            });
    }

    // [GET] /verified
    verified(req, res) {
        res.sendFile(
            path.join(__dirname, "./../../resources/views/verified.html")
        );
    }

    // [GET] /forgot-password
    forgotPassword(req, res) {
        res.render("forgotPassword", { error: req.flash("error") });
    }

    // [POST] /forgot-password
    async forgotPasswordPost(req, res) {
        const { email } = req.body;

        try {
            const user = await Users.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    errors: ["Email does not exist."],
                });
            }

            if (user.googleId) {
                return res.status(400).json({
                    success: false,
                    errors: ["Email associated with Google account."],
                });
            }

            if (!user.verified) {
                return res.status(400).json({
                    success: false,
                    errors: ["Email not verified."],
                });
            }

            await sendOTPVerificationEmail(user, res);

            res.status(200).json({
                success: true,
                message: "OTP sent to email.",
                userId: user._id,
            });
        } catch (error) {
            console.error("Error in forgotPasswordPost:", error);
            res.status(500).json({
                success: false,
                errors: ["Server error. Please try again later."],
            });
        }
    }

    // [GET] /reset-code
    resetCode(req, res) {
        res.render("resetCode", { error: req.flash("error") });
    }

    // [POST] /reset-code
    async resetCodePost(req, res) {
        const { userId, otp } = req.body;

        if (
            !userId ||
            typeof userId !== "string" ||
            !otp ||
            typeof otp !== "string"
        ) {
            return res.status(400).json({
                success: false,
                errors: ["Invalid input. Please check your data."],
            });
        }

        try {
            const user = await PasswordReset.findOne({ userId });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    errors: ["User not found."],
                });
            }

            const { expiresAt, otp: hashedOTP } = user;

            if (expiresAt < Date.now()) {
                await PasswordReset.deleteOne({ userId });
                return res.status(400).json({
                    success: false,
                    errors: ["OTP has expired. Please request a new one."],
                });
            }

            const validOTP = await bcrypt.compare(otp, hashedOTP);

            if (!validOTP) {
                return res.status(400).json({
                    success: false,
                    errors: ["Invalid OTP. Please try again."],
                });
            }

            await PasswordReset.deleteOne({ userId });

            res.status(200).json({
                success: true,
                message: "OTP verified successfully.",
                userId: userId,
            });
        } catch (error) {
            console.error("Error in resetCodePost:", error);
            res.status(500).json({
                success: false,
                errors: ["Server error. Please try again later."],
            });
        }
    }

    // [GET] /new-password
    newPassword(req, res) {
        res.render("newPassword", { error: req.flash("error") });
    }

    // [POST] /new-password
    async newPasswordPost(req, res) {
        const { userId, password } = req.body;

        try {
            const user = await Users.findById(userId);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    errors: ["User not found."],
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user.updateOne({ password: hashedPassword }).then(() => {
                res.status(200).json({
                    success: true,
                    message: "Password updated successfully.",
                });
            });
        } catch (error) {
            console.error("Error in newPasswordPost:", error);
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
            const deliveryUnits = await DeliveryUnits.find({}).sort({ Fee: 1 });
            const paymentMethods = await PaymentMethods.find({});

            // set delivery unit
            const deliveryUnit = deliveryUnits.map((unit) => {
                return {
                    name: unit.Name,
                    fee: unit.Fee,
                };
            });

            // set payment method
            const paymentMethod = paymentMethods.map((method) => {
                return {
                    name: method.Name,
                };
            });

            // set cart
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
                deliveryUnit,
                total,
                paymentMethod,
                user: mongooseToObject(req.user),
            });
        } catch (error) {
            console.error("Error retrieving cart:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // [GET] /about
    about(req, res) {
        res.render("about", { user: mongooseToObject(req.user) });
    }

    // [GET] /contact
    contact(req, res) {
        res.render("contact", { user: mongooseToObject(req.user) });
    }

    // [GET] /profile
    profile(req, res) {
        res.render("profile", { user: mongooseToObject(req.user) });
    }

    // [POST] /checkout
    async checkoutPost(req, res) {
        try {
            const userId = req.user.id;
            const cartItems = await Cart.find({ userId }).populate("productId");
            const deliveryUnit = await DeliveryUnits.findOne({
                Fee: req.body.deliveryFee,
            });

            if (!deliveryUnit) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid delivery unit.",
                });
            }

            // Xử lý giỏ hàng
            const cart = cartItems
                .map((item) => {
                    if (!item.productId) {
                        console.error(
                            `Product not found for cart item with ID ${item._id}`
                        );
                        return null;
                    }
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                    };
                })
                .filter((item) => item !== null);

            // Tính tổng tiền
            const total =
                cart.reduce(
                    (sum, item) => sum + item.productId.price * item.quantity,
                    0
                ) + deliveryUnit.Fee;

            // Thanh toán qua Momo
            if (req.body.paymentMethod === "Momo") {
                const order = new Orders({
                    userId: userId,
                    products: cart,
                    total: total,
                    deliveryUnit: deliveryUnit.Name,
                    paymentMethod: req.body.paymentMethod,
                    status: "PENDING",
                    createdAt: Date.now(),
                });

                await order.save();

                const paymentResult = await handleMomoPayment(
                    total,
                    order._id,
                    cart
                );

                if (paymentResult.success) {
                    return res.status(200).json({
                        success: true,
                        paymentUrl: paymentResult.paymentUrl,
                        message: "Redirecting to Momo payment gateway.",
                    });
                } else {
                    // Thanh toán thất bại
                    return res.status(400).json({
                        success: false,
                        message:
                            "Payment failed. Redirecting to checkout page.",
                        redirectUrl: "/checkout",
                    });
                }
            }

            // Thanh toán không qua Momo
            const order = new Orders({
                userId: userId,
                products: cart,
                total: total,
                deliveryUnit: deliveryUnit.Name,
                paymentMethod: req.body.paymentMethod,
                status: "PENDING",
                createdAt: Date.now(),
            });

            await order.save();

            // Lưu chi tiết đơn hàng
            const orderDetails = cart.map((item) => ({
                orderId: order._id,
                productId: item.productId,
                quantity: item.quantity,
            }));
            await OrderDetails.insertMany(orderDetails);

            // Xóa giỏ hàng
            await Cart.deleteMany({ userId });

            res.status(200).json({
                success: true,
                message: "Order placed successfully.",
            });
        } catch (error) {
            console.error("Error in checkoutPost:", error);
            res.status(500).json({
                success: false,
                errors: ["Server error. Please try again later."],
            });
        }
    }

    // [GET] /momo/redirect
    async momoRedirect(req, res) {
        const { resultCode, extraData } = req.query;
        const parsedData = JSON.parse(extraData);
        const userId = req.user.id;

        const { orderId, cart } = parsedData;

        console.log(cart);
        console.log(orderId);

        if (resultCode === "0") {
            // Lưu chi tiết đơn hàng
            const orderDetails = cart.map((item) => ({
                orderId: orderId,
                productId: item.productId,
                quantity: item.quantity,
            }));
            await OrderDetails.insertMany(orderDetails);

            // Xóa giỏ hàng
            await Cart.deleteMany({ userId });

            return res.redirect("/list-orders");
        } else {
            await Orders.deleteOne({ _id: orderId });
            return res.redirect("/checkout");
        }
    }
}

async function handleMomoPayment(total, order_id, cart) {
    try {
        var partnerCode = "MOMO";
        var accessKey = "F8BBA842ECF85";
        var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        var requestId = partnerCode + new Date().getTime();
        var orderId = order_id;
        var orderInfo = "Pay with MoMo";
        var redirectUrl = "https://project-web-0hth.onrender.com/momo/redirect";
        var ipnUrl = "https://callback.url/notify";
        var requestType = "captureWallet";
        var extraData = JSON.stringify({ orderId, cart });

        var rawSignature = `accessKey=${accessKey}&amount=${total}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const crypto = require("crypto");
        var signature = crypto
            .createHmac("sha256", secretkey)
            .update(rawSignature)
            .digest("hex");

        const requestBody = JSON.stringify({
            partnerCode,
            accessKey,
            requestId,
            amount: total,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: "vi",
        });

        const axios = require("axios");
        const options = {
            method: "POST",
            url: "https://test-payment.momo.vn/v2/gateway/api/create",
            headers: {
                "Content-Type": "application/json",
            },
            data: requestBody,
        };

        const result = await axios(options);

        return {
            success: true,
            paymentUrl: result.data.payUrl,
        };
    } catch (error) {
        console.error("Momo API Error:", error.response?.data || error.message);
        return { success: false };
    }
}

module.exports = new SiteController();
