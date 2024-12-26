const User = require('../models/Users'); // Giả định bạn đã có model User
const { mutipleMongooseToObject } = require("../../util/mongoose");
const { mongooseToObject } = require("../../util/mongoose");

class ProfileController{
    // [GET] /profile
    async profile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            res.render('profile', { user: mongooseToObject(user) });
        }
        catch (error) {
            console.error('Error retrieving profile:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // [POST] /profile/update
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updatedData = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                streetAddress: req.body.streetAddress,
                city: req.body.city,
                phone: req.body.phone,
                email: req.body.email,
            };

            await User.findByIdAndUpdate(userId, updatedData, { new: true });
            res.status(200).json({ message: "Profile updated successfully" });
        } catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = new ProfileController();
