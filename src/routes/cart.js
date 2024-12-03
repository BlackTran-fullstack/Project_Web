const express = require("express");
const router = express.Router();

const CartController = require("../app/controllers/CartController");

router.post("/add", CartController.add);

// router.get("/", CartController.cart);

module.exports = router;
