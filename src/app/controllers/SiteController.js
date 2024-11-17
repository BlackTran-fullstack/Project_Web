const Products = require("../models/Products");
const { mutipleMongooseToObject } = require("../../util/mongoose");

class SiteController {
    // [GET] /
    home(req, res, next) {
        Products.find({})
            .limit(8)
            .then((products) => {
                res.render("home", {
                    products: mutipleMongooseToObject(products),
                });
            })
            .catch(next);
    }

    // [GET] /login
    login(req, res, next) {
        res.render("login");
    }

    // [GET] /register
    register(req, res, next) {
        res.render("register");
    }
}

module.exports = new SiteController();
