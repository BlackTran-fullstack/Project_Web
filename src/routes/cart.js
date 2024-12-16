const express = require("express");
const router = express.Router();

const CartController = require("../app/controllers/CartController");
const SiteController = require("../app/controllers/SiteController");

router.post(
    "/add",
    SiteController.checkAuthenticated,
    CartController.addToCart
);

router.post(
    "/remove",
    SiteController.checkAuthenticated,
    CartController.removeFromCart
);

router.get("/summary", CartController.cartSummary);

router.get("/", SiteController.checkAuthenticated, CartController.cart);

module.exports = router;
