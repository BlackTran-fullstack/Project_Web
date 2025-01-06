class AuthController {
    //[GET] /auth/google/callback
    googleCallback(req, res, next) {
        res.redirect("/");
    }
}

module.exports = new AuthController();
