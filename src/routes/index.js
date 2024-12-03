const siteRouter = require("./site");
const shopRouter = require("./shop");
const cartRouter = require("./cart");

function route(app) {
    app.use("/", siteRouter);

    app.use("/shop", shopRouter);

    app.use("/cart", cartRouter);
}

module.exports = route;
