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

router.get("/", siteController.home);

router.get("/search", siteController.search);

module.exports = router;
