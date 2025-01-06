function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit; // Vị trí bắt đầu
        const endIndex = page * limit; // Vị trí kết thúc

        const filters = req.filters || {};

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

        const results = {};

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

        try {
            // Lấy tổng số lượng tài liệu trong collection
            const totalDocuments = await model.countDocuments(filters).exec();

            // Tính tổng số trang
            const totalPages = Math.ceil(totalDocuments / limit);

            // Thêm `totalPages` vào kết quả trả về
            results.totalPages = totalPages;

            // Tính toán thông tin trang tiếp theo (nếu có)
            if (endIndex < totalDocuments) {
                results.next = {
                    page: page + 1,
                    limit: limit,
                };
            }

            results.current = page;

            // Tính toán thông tin trang trước đó (nếu có)
            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit,
                };
            }

            // Truy vấn dữ liệu theo trang
            results.results = await model
                .find(filters)
                .limit(limit)
                .skip(startIndex)
                .sort(sortCriteria)
                .exec();

            // Gắn kết quả vào response
            res.paginatedResults = results;
            next();
        } catch (e) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
}

module.exports = paginatedResults;
