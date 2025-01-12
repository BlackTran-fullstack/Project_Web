class AuthController {
    //[GET] /auth/google/callback
    googleCallback(req, res, next) {
        res.redirect("/");
    }

    //[GET] /auth/status
    authStatus(req, res) {
        if (req.user) {
            res.json({ loggedIn: true, user: req.user });
        } else {
            res.json({ loggedIn: false });
        }
    }
}

module.exports = new AuthController();
