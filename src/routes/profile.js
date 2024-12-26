const express = require("express");
const router = express.Router();
const siteController = require("../app/controllers/SiteController.js");

const ProfileController = require("../app/controllers/ProfileController.js");


router.get("/", siteController.checkAuthenticated, ProfileController.profile);

router.post("/update", siteController.checkAuthenticated, ProfileController.updateProfile);


module.exports = router;