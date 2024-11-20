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

    // [GET] /login
    login(req, res, next) {
        res.render("login");
    }

    // [POST] /login
    loginUser(req, res, next) {
        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/login",
            failureFlash: true,
        })(req, res, next); // Gọi hàm xác thực
    }

    // [GET] /register
    register(req, res, next) {
        res.render("register");
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
}

module.exports = new SiteController();
