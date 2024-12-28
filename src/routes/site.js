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
router.get("/search-ajax", siteController.searchAjax); // Route cho AJAX

router.get(
    "/checkout",
    siteController.checkAuthenticated,
    siteController.checkout
);

router.post("/checkout", siteController.checkoutPost);

router.get("/verify/:userId/:uniqueString", siteController.verifyEmail);

router.get("/verified", siteController.verified);

router.get("/forgot-password", siteController.forgotPassword);

router.post("/forgot-password", siteController.forgotPasswordPost);

router.get("/reset-code", siteController.resetCode);

router.post("/reset-code", siteController.resetCodePost);

router.get("/new-password", siteController.newPassword);

router.post("/new-password", siteController.newPasswordPost);

router.get("/", siteController.home);

module.exports = router;
