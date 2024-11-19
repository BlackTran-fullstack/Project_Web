const Products = require("../models/Products");
const Categories = require("../models/Categories");
const { mutipleMongooseToObject } = require("../../util/mongoose");
const { mongooseToObject } = require("../../util/mongoose");

class ShopController {
    // [GET] /shop
    shop(req, res, next) {
        Promise.all([
            Products.find({}),
            Categories.find({})
        ])
        .then(([products, categories]) => {
            res.render("shop", {
                products: mutipleMongooseToObject(products),
                categories: mutipleMongooseToObject(categories),
            });
        })
        .catch(next);
    }

    // [GET] /shop/:slug
    singleProduct(req, res, next) {
        const slug = req.params.slug;

        // Thực hiện hai truy vấn song song
        Promise.all([
            Products.findOne({ slug: slug }), // Tìm sản phẩm chính theo slug
            Products.find({}).limit(4), // Lấy toàn bộ danh sách sản phẩm (hoặc có thể lọc theo nhu cầu)
        ])
            .then(([product, products]) => {
                // Render view với cả sản phẩm chính và danh sách sản phẩm
                res.render("singleProduct.hbs", {
                    product: mongooseToObject(product),
                    products: mutipleMongooseToObject(products),
                });
            })
            .catch(next);
    }
}

module.exports = new ShopController();
