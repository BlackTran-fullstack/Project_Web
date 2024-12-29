const avatarImg = document.getElementById("avatar-img");
const avatarInput = document.getElementById("avatar-input");
// Thêm sự kiện click vào ảnh để mở hộp thoại chọn file
avatarImg.addEventListener("click", () => {
    avatarInput.click(); // Mở hộp thoại chọn ảnh
});

// Thêm sự kiện change vào input file để thay đổi avatar khi chọn ảnh
avatarInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            avatarImg.src = e.target.result; // Thay đổi src của ảnh avatar
            const formData = new FormData();
            formData.append("avatar", avatarInput.files[0]);

            try {
                const response = await fetch("/profile/update-avatar", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(result.message);
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.error}`);
                }
            } catch (err) {
                console.error("Error updating avatar:", err);
                alert("An error occurred while updating avatar.");
            }
        };
        reader.readAsDataURL(file); // Đọc file ảnh và hiển thị lên avatar
    }
});

const phoneInput = document.getElementById("phone");
const phoneForm = document.querySelector(".form-phone");
const emailInput = document.getElementById("email");
const emailForm = document.querySelector(".form-email");

const validatePhone = () => {
    const phonePattern = /^[0-9]{10}$/;
    if (!phoneInput.value.match(phonePattern)) {
        phoneForm.classList.add("invalid");
        return false;
    }
    phoneForm.classList.remove("invalid");
    return true;
};

const validateEmail = () => {
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailInput.value.match(emailPattern)) {
        emailForm.classList.add("invalid");
        return false;
    }
    emailForm.classList.remove("invalid");
    return true;
};

phoneInput.addEventListener("keyup", validatePhone);
emailInput.addEventListener("keyup", validateEmail);

document.getElementById("update-button").addEventListener("click", async () => {
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    const data = {
        firstName: document.getElementById("first-name").value.trim(),
        lastName: document.getElementById("last-name").value.trim(),
        address: document.getElementById("address").value.trim(),
        city: document.getElementById("city").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
    };

    if (
        firstName === "" ||
        lastName === "" ||
        address === "" ||
        city === "" ||
        phone === "" ||
        email === ""
    ) {
        alert("Please fill in all fields.");
        return;
    }

    if (!validatePhone() || !validateEmail()) {
        alert("Please enter a valid phone number and email address.");
        return;
    }

    try {
        const response = await fetch("/profile/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            location.reload(); // Reload lại trang để cập nhật thông tin
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (err) {
        console.error("Error updating profile:", err);
        alert("An error occurred while updating profile.");
    }
});

// Get elements
const changePasswordButton = document.getElementById("change-password-button");
const overlay = document.getElementById("password-overlay");
const closeOverlayButton = document.getElementById("close-overlay");
const passwordForm = document.getElementById("password-form");

// Show overlay on button click
changePasswordButton.addEventListener("click", () => {
    overlay.classList.add("visible");
});

// Hide overlay on close button click
closeOverlayButton.addEventListener("click", () => {
    overlay.classList.remove("visible");
});

const currentPasswordInput = document.getElementById("current-password");
const currentPasswordForm = document.querySelector(".form-current-password");
const currentPasswordError = document.querySelector(
    ".current-password-error .error-text"
);
const newPasswordInput = document.getElementById("new-password");
const newPasswordForm = document.querySelector(".form-new-password");
const newPasswordError = document.querySelector(
    ".new-password-error .error-text"
);
const confirmPasswordInput = document.getElementById("confirm-password");
const confirmPasswordForm = document.querySelector(".form-confirm-password");

const validateNewPassword = () => {
    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!newPasswordInput.value.match(passwordPattern)) {
        newPasswordError.textContent =
            "Please enter at least 8 character with number, symbol, small and capital letter.";
        newPasswordForm.classList.add("invalid");
        return false;
    }
    newPasswordForm.classList.remove("invalid");
    return true;
};

const validateConfirmPassword = () => {
    if (
        newPasswordInput.value !== confirmPasswordInput.value ||
        confirmPasswordInput.value === ""
    ) {
        confirmPasswordForm.classList.add("invalid");
        return false;
    }
    confirmPasswordForm.classList.remove("invalid");
    return true;
};

newPasswordInput.addEventListener("keyup", validateNewPassword);
confirmPasswordInput.addEventListener("keyup", validateConfirmPassword);

// Submit password form
passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (validateNewPassword() && validateConfirmPassword()) {
        const formData = {
            currentPassword: document.getElementById("current-password").value,
            newPassword: document.getElementById("new-password").value,
            confirmPassword: document.getElementById("confirm-password").value,
        };

        try {
            const response = await fetch("/profile/update-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                overlay.classList.remove("visible"); // Hide overlay on success
                location.reload(); // Reload to reflect changes
            } else if (data.errors) {
                data.errors.forEach((error) => {
                    if (error === "Current password is incorrect") {
                        currentPasswordError.textContent =
                            "Current password is incorrect";
                        currentPasswordForm.classList.add("invalid");
                    } else if (
                        error ===
                        "New password must be different from current password"
                    ) {
                        newPasswordError.textContent =
                            "New password must be different from current password";
                        newPasswordForm.classList.add("invalid");
                    }
                });
            }
        } catch (error) {
            console.error("Error updating password:", error);
            alert("An error occurred while updating password.");
        }
    }
});
