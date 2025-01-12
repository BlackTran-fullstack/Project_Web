const express = require("express");
const router = express.Router();

const CartController = require("../app/controllers/CartController");
const SiteController = require("../app/controllers/SiteController");
const paginatedResults = require("../middlewares/paginated");
const Cart = require("../app/models/Cart");

router.post(
    "/add",
    CartController.addToCart
);

router.post(
    "/remove",
    SiteController.checkAuthenticated,
    CartController.removeFromCart
);

router.post("/sync", CartController.syncCart);

router.get("/summary", CartController.cartSummary);

router.get("/api/products", CartController.getPaginatedCart);

router.get("/", SiteController.checkAuthenticated, CartController.cart);

module.exports = router;
