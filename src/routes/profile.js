const express = require("express");
const router = express.Router();
const siteController = require("../app/controllers/SiteController.js");

const ProfileController = require("../app/controllers/ProfileController.js");

const { uploadAvatar } = require("../middlewares/multer");

router.get("/", siteController.checkAuthenticated, ProfileController.profile);

router.post(
    "/update",
    siteController.checkAuthenticated,
    ProfileController.updateProfile
);

router.post(
    "/update-password",
    siteController.checkAuthenticated,
    ProfileController.updatePassword
);

router.post("/update-avatar", uploadAvatar, ProfileController.updateAvatar);

module.exports = router;
