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

    search(req, res) {
        res.render("search");
    }

}

module.exports = new SiteController();
