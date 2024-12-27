    const User = require('../models/Users'); // Giả định bạn đã có model User
    const { mutipleMongooseToObject } = require("../../util/mongoose");
    const { mongooseToObject } = require("../../util/mongoose");
    const bcrypt = require('bcrypt');


    const { createClient } = require('@supabase/supabase-js');

    // Cấu hình Supabase
    const supabaseUrl = 'https://tbfnfobqgvbtcvkedqng.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZm5mb2JxZ3ZidGN2a2VkcW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyODY3MDIsImV4cCI6MjA1MDg2MjcwMn0.SOpgZEZmEE0T3rJxzpmG2xlG4cw4g4nM4iOIomt-ugg';
    const supabase = createClient(supabaseUrl, supabaseKey);


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

        // [POST] /profile/update-password
        async updatePassword(req, res) {
            try {
                const userId = req.user.id;
                const user = await User.findById(userId);
                const currentPassword = req.body.currentPassword;
                const newPassword = req.body.newPassword;
                const confirmPassword = req.body.confirmPassword;

                // So sánh mật khẩu cũ
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({ error: "Incorrect current password" });
                }

                if (newPassword !== confirmPassword) {
                    return res.status(400).json({ error: "New password and confirm password do not match" });
                }
                //so sanh mat khau cu va mat khau moi
                else if (newPassword === currentPassword) {
                    return res.status(400).json({ error: "New password must be different from current password" });
                }
                else {
                    // Mã hóa mật khẩu mới
                    const hashedPassword = await bcrypt.hash(newPassword, 10);
                    user.password = hashedPassword;
                    await user.save();
                    res.status(200).json({ message: "Password updated successfully" });
                }
            }
            catch (error) {
                console.error('Error updating password:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }

        // [POST] /profile/update-avatar
        // async updateAvatar(req, res) {
        //     try {
        //         const userId = req.user.id;
        //         const file = req.file;

        //         // Kiểm tra xem file có tồn tại hay không
        //         if (!file) {
        //             return res.status(400).json({ error: 'No file uploaded' });
        //         }

        //         // Tạo tên tệp duy nhất (ví dụ dùng UUID hoặc timestamp)
        //         const fileName = `${Date.now()}-${file.originalname}`;


        //         // Upload ảnh lên Supabase
        //         const { data, error } = await supabase.storage
        //             .from('users-avatar') // Bucket trong Supabase
        //             .upload(`avatars/${fileName}`, file.buffer, {
        //                 cacheControl: '3600',
        //                 upsert: true,
        //             });

        //         if (error) {
        //             console.error('Error uploading to Supabase:', error);
        //             return res.status(500).json({ error: 'Error uploading avatar', details: error.message });
        //         }

        //         // Lấy URL của ảnh đã upload
        //         const avatarUrl = `${supabaseUrl}/storage/v1/object/public/users-avatar/avatars/${data.path}`;

        //         // Lưu URL vào MongoDB
        //         const user = await User.findById(userId);
        //         if (!user) {
        //             return res.status(404).json({ error: 'User not found' });
        //         }

        //         // Cập nhật avatar mới cho người dùng
        //         user.avatar = avatarUrl;
        //         await user.save();

        //         res.status(200).json({ message: 'Avatar updated successfully', avatarUrl });
        //     } catch (error) {
        //         console.error('Error updating avatar:', error);
        //         res.status(500).json({ error: 'Internal Server Error', details: error.message });
        //     }
        // }
    }

    module.exports = new ProfileController();
