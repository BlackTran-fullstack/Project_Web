const Products = require("../models/Products");
const Categories = require("../models/Categories");
const Brands = require("../models/Brands");
const Feedbacks = require("../models/Feedbacks");
const Users = require("../models/Users");
const Orders = require("../models/Orders");
const OrderDetails = require("../models/OrderDetails");

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
    async singleProduct(req, res, next) {
        const slug = req.params.slug;

        const product = await Products.findOne({ slug: slug });

        const feedbacks = await Feedbacks.find({ productId: product._id });
        const feedbacksObject = mutipleMongooseToObject(feedbacks);
        const feedbacksCount = feedbacks.length;

        for (const feedback of feedbacksObject) {
            const user = await Users.findById(feedback.userId);
            const userObject = mongooseToObject(user);
            // Ẩn mật khẩu
            userObject.password = "********";
            feedback.user = userObject;
        }

        const userId = req.user ? req.user._id : null;

        let orders = await Orders.find({ userId });
        if (!userId)
        {
            orders = [];
        }
        const orderIds = orders.map(order => order._id);

        const orderDetail = await OrderDetails.findOne({ orderId: { $in: orderIds }, productId: product._id, isReview: false });

        let isReviewed = orderDetail ? false : true;

        if (!userId) {
            isReviewed = true;
        }

        // Tìm sản phẩm chính theo slug
        Products.findOne({ slug: slug })
            .populate("categoriesId") // Populate danh mục
            .populate("brandsId") // Populate thương hiệu
            .then((product) => {
                if (!product) {
                    return res.status(404).send("Product not found!");
                }

                // Truy vấn các sản phẩm liên quan
                Products.find({
                    $or: [
                        { categoriesId: product.categoriesId._id }, // Sản phẩm cùng danh mục
                        { brandsId: product.brandsId._id }, // Sản phẩm cùng thương hiệu
                    ],
                    _id: { $ne: product._id }, // Loại trừ sản phẩm hiện tại
                })
                    .limit(4) // Giới hạn 4 sản phẩm liên quan
                    .then((relatedProducts) => {
                        res.render("singleProduct.hbs", {
                            product: mongooseToObject(product), // Sản phẩm chính
                            categories: mongooseToObject(product.categoriesId), // Danh mục
                            brands: mongooseToObject(product.brandsId), // Thương hiệu
                            products: mutipleMongooseToObject(relatedProducts), // Sản phẩm liên quan
                            user: mongooseToObject(req.user), // Người dùng
                            feedbacks: feedbacksObject, // Đánh giá
                            feedbacksCount: feedbacksCount, // Số lượng đánh giá
                            isReviewed: isReviewed, // Đã đánh giá
                            orderDetailId: orderDetail ? orderDetail._id : null, // Chi tiết đơn hàng
                        });
                    })
                    .catch(next);
            })
            .catch(next);
    }

    // [POST] /shop/postFeedback
    async postFeedback(req, res, next) {
        const { rating, feedback, productId, userId, orderDetailsId } = req.body;

        try {
            const feedbackData = {
                rating: rating,
                message: feedback,
                productId,
                userId,
            };

            const feedbackSave = new Feedbacks(feedbackData);
            await feedbackSave.save();

            const orderDetail = await OrderDetails.findById(orderDetailsId);

            if (!orderDetail) {
                throw new Error('OrderDetail not found');
            }

            const result = await OrderDetails.updateOne({orderId: orderDetail.orderId, productId: orderDetail.productId}, { $set: { isReview: true } });

            if (!result) {
                throw new Error('Failed to update orderDetail');
            }

            res.json({ success: true });
        } catch (error) {
            console.error("Error in postFeedback:", error);
            res.json({ success: false, message: error.message });
        }
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

    // [GET] /api/get-slug/:productId
    async getSlugByProductId(req, res, next) {
        const productId = req.params.productId;

        try {
            const product = await Products.findById(productId);

            if (!product) {
                return res.status(404).json({ message: "Product not found!" });
            }

            res.status(200).json({ slug: product.slug });
        } catch (error) {
            console.error("Error in getSlugByProductId:", error);
            next(error);
        }
    }
}

module.exports = new ShopController();
