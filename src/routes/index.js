const siteRouter = require("./site");
const shopRouter = require("./shop");
const cartRouter = require("./cart");
const ordersRouter = require("./orders");

const cartSummary = require("../middlewares/cartSummary");

function route(app) {
    app.use(cartSummary);

    app.use("/", siteRouter);

    app.use("/shop", shopRouter);

    app.use("/cart", cartRouter);

    app.use("/list-orders", ordersRouter);
}

module.exports = route;
