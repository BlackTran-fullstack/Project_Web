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

    search(req, res, next) {
        const search = req.query.q;

        if (!search) {
            return res.render('search', { products: [] });
        }
        else{
            // Tìm kiếm sản phẩm theo tên
            Products.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // Tìm kiếm theo tên (không phân biệt chữ hoa/thường)
                    { description: { $regex: search, $options: 'i' } } // Tìm kiếm theo mô tả
                ]
            })
                .limit(4)
                .then((products) => {
                    res.render("search", {
                        products: mutipleMongooseToObject(products),
                        q: search,
                    });
                    //res.json(products);
                })
                .catch(next);
        }
    }
}

module.exports = new SiteController();
