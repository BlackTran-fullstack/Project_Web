const siteRouter = require("./site");
const shopRouter = require("./shop");

function route(app) {
    app.use("/", siteRouter);

    app.use("/shop", shopRouter);
}

module.exports = route;
