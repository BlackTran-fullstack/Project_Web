const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController.js");

router.get(
    "/login",
    siteController.checkNotAuthenticated,
    siteController.login
);
router.post(
    "/login",
    siteController.checkNotAuthenticated,
    siteController.loginUser
);

router.get(
    "/register",
    siteController.checkNotAuthenticated,
    siteController.register
);
router.post(
    "/register",
    siteController.checkNotAuthenticated,
    siteController.registerUser
);

router.delete("/logout", siteController.logout);

router.get("/search", siteController.search);

//cart
router.get("/cart", siteController.checkAuthenticated, siteController.cart);

router.post("/cart/add", siteController.checkAuthenticated, siteController.addToCart);

router.post("/cart/remove", siteController.checkAuthenticated, siteController.removeFromCart);

router.get("/", siteController.home);

module.exports = router;
