const Products = require("../models/Products");
const Categories = require("../models/Categories");
const Brands = require("../models/Brands");

const { mutipleMongooseToObject } = require("../../util/mongoose");
const { mongooseToObject } = require("../../util/mongoose");
const paginatedResults = require("../../middlewares/paginated");

class ShopController {
    // [GET] /shop
    shop(req, res, next) {
        Promise.all([Products.find({}), Categories.find({}), Brands.find({})])
            .then(([products, categories, brands]) => {
                res.render("shop", {
                    products: mutipleMongooseToObject(products),
                    categories: mutipleMongooseToObject(categories),
                    brands: mutipleMongooseToObject(brands),
                    user: mongooseToObject(req.user),
                });
            })
            .catch(next);
    }

    // [GET] /shop/api/products
    getPaginatedProducts(req, res, next) {
        if (res.paginatedResults) {
            res.json(res.paginatedResults);
        } else {
            res.status(500).json({ message: "Pagination results not found" });
        }
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
                    user: mongooseToObject(req.user),
                });
            })
            .catch(next);
    }

    
    // [GET] /shop/search
    search(req, res, next) {
        const search = req.query.q;

        if (!search) {
            Products.find({})
                .then((products) => {
                    res.render("shop", {
                        products: mutipleMongooseToObject(products),
                        user: mongooseToObject(req.user),
                    });
                })
                .catch(next);
        } else {
            // Tìm kiếm sản phẩm theo tên
            Products.find({
                $or: [
                    { name: { $regex: search, $options: "i" } }, // Tìm kiếm theo tên (không phân biệt chữ hoa/thường)
                    { description: { $regex: search, $options: "i" } }, // Tìm kiếm theo mô tả
                ],
            })
                .then((products) => {
                    res.render("shop", {
                        products: mutipleMongooseToObject(products),
                        user: mongooseToObject(req.user),
                    });
                    //res.json(products);
                })
                .catch(next);
        }
    }
}

module.exports = new ShopController();
