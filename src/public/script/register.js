document
    .getElementById("register-form")
    .addEventListener("submit", function (event) {
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirm_password").value;

        if (password !== confirmPassword) {
            event.preventDefault(); // Ngừng gửi form nếu mật khẩu không trùng

            const errorMessage = document.getElementById(
                "error-message-font-end"
            );
            errorMessage.style.display = "flex"; // Hiển thị thông báo lỗi

            // Ẩn thông báo sau 2 giây
            setTimeout(function () {
                errorMessage.style.display = "none";
            }, 2000);
        }
    });
