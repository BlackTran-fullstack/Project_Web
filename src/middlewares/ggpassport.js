const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Users = require("../app/models/Users");

function initializeGG(passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:3000/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await Users.findOne({ googleId: profile.id });

                    if (!user) {
                        user = new Users({
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            verified: true,
                        });

                        await user.save();
                    }

                    done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        const user = await Users.findById(id);
        return done(null, user);
    });
}

module.exports = initializeGG;
