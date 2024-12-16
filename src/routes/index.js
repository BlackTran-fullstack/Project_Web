const siteRouter = require("./site");
const shopRouter = require("./shop");
const cartRouter = require("./cart");

const cartSummary = require("../middlewares/cartSummary");

function route(app) {
    app.use(cartSummary);

    app.use("/", siteRouter);

    app.use("/shop", shopRouter);

    app.use("/cart", cartRouter);
}

module.exports = route;
