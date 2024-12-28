const express = require("express");
const router = express.Router();

const OrdersController = require("../app/controllers/OrdersController");
const siteController = require("../app/controllers/SiteController");

router.get(
    "/:orderId",
    siteController.checkAuthenticated,
    OrdersController.orderDetails
);

router.get("/", siteController.checkAuthenticated, OrdersController.listOrders);

module.exports = router;
