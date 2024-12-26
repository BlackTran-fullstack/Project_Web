const siteRouter = require("./site");
const shopRouter = require("./shop");
const cartRouter = require("./cart");
const authRouter = require("./auth");
const profileRouter = require("./profile");

const cartSummary = require("../middlewares/cartSummary");
const { use } = require("passport");

function route(app) {
    app.use(cartSummary);

    app.use("/", siteRouter);

    app.use("/shop", shopRouter);

    app.use("/cart", cartRouter);

    app.use("/auth", authRouter);

    app.use("/profile", profileRouter);
}

module.exports = route;
