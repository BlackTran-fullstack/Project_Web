const express = require("express");
const router = express.Router();

const ShopController = require("../app/controllers/ShopController");
const paginatedResults = require("../middlewares/paginated");
const products = require("../app/models/Products");

router.get("/search", ShopController.search);

router.get("/:slug", ShopController.singleProduct);

router.get(
    "/api/products",
    paginatedResults(products),
    ShopController.getPaginatedProducts
);

// router.get("/", ShopController.shop);
router.get("/", paginatedResults(products), ShopController.shop);

module.exports = router;
