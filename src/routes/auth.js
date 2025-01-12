const express = require("express");
const passport = require("passport");
const router = express.Router();

const AuthController = require("../app/controllers/AuthController");

const initializeGGPassport = require("../middlewares/ggpassport");
initializeGGPassport(passport);

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    AuthController.googleCallback
);

router.get("/status", AuthController.authStatus);

module.exports = router;
