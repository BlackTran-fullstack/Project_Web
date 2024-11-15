const express = require("express");
const router = express.Router();

const ShopController = require("../app/controllers/ShopController");

router.get("/:slug", ShopController.singleProduct);
router.get("/", ShopController.shop);

module.exports = router;