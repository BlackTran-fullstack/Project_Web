const Cart = require("../app/models/Cart");

async function cartSummary(req, res, next) {
    try {
        if (!req.user) {
            res.locals.totalQuantity = 0;
            return next();
        }

        const userId = req.user.id;
        const cartItems = await Cart.find({ userId });
        const totalQuantity = cartItems.reduce((sum) => sum + 1, 0);

        res.locals.totalQuantity = totalQuantity;
        next();
    } catch (error) {
        console.error("Error calculating cart summary: ", error);
        res.locals.totalQuantity = 0;
        next();
    }
}

module.exports = cartSummary;
