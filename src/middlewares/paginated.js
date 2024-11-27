function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page) || 1; // Mặc định là trang 1 nếu không được truyền
        const limit = parseInt(req.query.limit) || 16; // Mặc định hiển thị 16 mục nếu không được truyền

        const startIndex = (page - 1) * limit; // Vị trí bắt đầu
        const endIndex = page * limit; // Vị trí kết thúc

        const results = {};

        try {
            // Lấy tổng số lượng tài liệu trong collection
            const totalDocuments = await model.countDocuments().exec();

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
                .find()
                .limit(limit)
                .skip(startIndex)
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
