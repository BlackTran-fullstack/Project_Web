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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;

        const filters = {};

        if (req.query.categories) {
            filters.categoriesId = { $in: req.query.categories.split(",") };
        }

        if (req.query.brands) {
            filters.brandsId = { $in: req.query.brands.split(",") };
        }

        if (req.query.priceMin && req.query.priceMax) {
            filters.price = {
                $gte: parseInt(req.query.priceMin),
                $lte: parseInt(req.query.priceMax),
            };
        }

        const sortBy = req.query.sortBy;
        let sortCriteria = {};

        switch (sortBy) {
            case "stock_0":
                sortCriteria = { stock: -1 };
                break;
            case "stock_1":
                sortCriteria = { stock: 1 };
                break;
            case "rating_0":
                sortCriteria = { rate: -1 };
                break;
            case "rating_1":
                sortCriteria = { rate: 1 };
                break;
            case "price_0":
                sortCriteria = { price: -1 };
                break;
            case "price_1":
                sortCriteria = { price: 1 };
                break;
            default:
                sortCriteria = {};
        }

        const startIndex = (page - 1) * limit;

        Promise.all([
            Products.find(filters)
                .sort(sortCriteria)
                .skip(startIndex)
                .limit(limit),
            Products.countDocuments(filters),
            Categories.find({}),
            Brands.find({}),
        ])
            .then(([products, totalDocuments, categories, brands]) => {
                const totalPages = Math.ceil(totalDocuments / limit);

                res.render("shop", {
                    products: mutipleMongooseToObject(products),
                    categories: mutipleMongooseToObject(categories),
                    brands: mutipleMongooseToObject(brands),
                    currentPage: page,
                    totalPages,
                    filters: req.query,
                    user: mongooseToObject(req.user),
                });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).render("error", {
                    message: "Unable to load shop data.",
                });
            });
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

        if (!product) {
            return res.status(404).send("Product not found!");
        }

        const feedbacks = await Feedbacks.find({ productId: product._id });
        const feedbacksObject = mutipleMongooseToObject(feedbacks);
        const feedbacksCount = feedbacks.length;

        const uniqueReviewersCount = await Feedbacks.aggregate([
            { $match: { productId: product._id } },
            { $group: { _id: "$userId" } },
            { $count: "uniqueUsers" },
        ]);
        const reviewersCount =
            uniqueReviewersCount.length > 0
                ? uniqueReviewersCount[0].uniqueUsers
                : 0;

        for (const feedback of feedbacksObject) {
            const user = await Users.findById(feedback.userId);
            const userObject = mongooseToObject(user);
            // Ẩn mật khẩu
            userObject.password = "********";
            feedback.user = userObject;
        }

        const userId = req.user ? req.user._id : null;

        let orders = await Orders.find({ userId });
        if (!userId) {
            orders = [];
        }
        const orderIds = orders.map((order) => order._id);

        const orderDetail = await OrderDetails.findOne({
            orderId: { $in: orderIds },
            productId: product._id,
            isReview: false,
        });
        let curOrder;

        if (orderDetail) {
            curOrder = await Orders.findOne({
                _id: orderDetail.orderId,
                status: "APPROVED",
            });
        }

        console.log("curOrder", curOrder);

        let isReviewed = curOrder ? false : true;

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
                            reviewersCount: reviewersCount, // Số lượng user duy nhất đã đánh giá
                            isReviewed: isReviewed, // Đã đánh giá
                            orderDetailId: orderDetail ? orderDetail._id : null, // Chi tiết đơn hàng
                            rate: product.rate,
                        });
                    })
                    .catch(next);
            })
            .catch(next);
    }

    // [GET] /shop/:slug/api/reviews
    async getPaginatedReviews(req, res, next) {
        try {
            const slug = req.params.slug;

            const product = await Products.findOne({ slug: slug });

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;

            const skip = (page - 1) * limit;

            const feedbacks = await Feedbacks.find({ productId: product._id })
                .populate("userId")
                .skip(skip)
                .limit(limit);

            console.log(feedbacks);

            const totalItems = await Feedbacks.countDocuments({
                productId: product._id,
            });
            const totalPages = Math.ceil(totalItems / limit);

            const feedback = feedbacks
                .map((item) => {
                    if (!item.userId) {
                        console.error(
                            `User not found for feedback item with ID ${item._id}`
                        );
                        return null;
                    }
                    return {
                        avatar: item.userId.avatar,
                        email: item.userId.email,
                        rating: item.rating,
                        message: item.message,
                    };
                })
                .filter((item) => item !== null);

            res.json({
                feedback,
                page,
                totalPages,
            });
        } catch (error) {
            console.error("Error paginating reviews:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [POST] /shop/postFeedback
    async postFeedback(req, res, next) {
        const { rating, feedback, productId, userId, orderDetailsId } =
            req.body;

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
                throw new Error("OrderDetail not found");
            }

            const result = await OrderDetails.updateOne(
                {
                    orderId: orderDetail.orderId,
                    productId: orderDetail.productId,
                },
                { $set: { isReview: true } }
            );

            if (!result) {
                throw new Error("Failed to update orderDetail");
            }

            const allFeedbacks = await Feedbacks.find({ productId });
            const totalRating = allFeedbacks.reduce(
                (sum, item) => sum + item.rating,
                0
            );
            const averageRating = Math.round(totalRating / allFeedbacks.length);

            const productUpdate = await Products.findByIdAndUpdate(
                productId,
                { $set: { rate: averageRating } },
                { new: true }
            );

            if (!productUpdate) {
                throw new Error("Failed to update product rating");
            }

            res.json({ success: true, averageRating });
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
