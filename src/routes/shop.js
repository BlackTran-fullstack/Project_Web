const express = require("express");
const router = express.Router();

const ShopController = require("../app/controllers/ShopController");
const siteController = require("../app/controllers/SiteController");
const paginatedResults = require("../middlewares/paginated");
const products = require("../app/models/Products");

router.get("/search", ShopController.search);

router.get("/:slug", ShopController.singleProduct);

router.post("/postFeedback", 
    siteController.checkAuthenticated,
    ShopController.postFeedback);

router.get(
    "/api/products",
    paginatedResults(products),
    ShopController.getPaginatedProducts
);

router.get("/api/get-slug/:productId", ShopController.getSlugByProductId);

// router.get("/", ShopController.shop);
router.get("/", paginatedResults(products), ShopController.shop);

module.exports = router;
