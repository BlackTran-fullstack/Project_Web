const express = require("express");
const router = express.Router();
const siteController = require("../app/controllers/SiteController.js");

const ProfileController = require("../app/controllers/ProfileController.js");

const upload = require('../middlewares/multer.js');


router.get("/", siteController.checkAuthenticated, ProfileController.profile);

router.post("/update", siteController.checkAuthenticated, ProfileController.updateProfile);

router.post("/update-password", siteController.checkAuthenticated, ProfileController.updatePassword);

// router.post("/update-avatar", upload.single('avatar'), ProfileController.updateAvatar);



module.exports = router;