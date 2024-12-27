const avatarImg = document.getElementById('avatar-img');
const avatarInput = document.getElementById('avatar-input');
// Thêm sự kiện click vào ảnh để mở hộp thoại chọn file
avatarImg.addEventListener('click', () => {
    avatarInput.click(); // Mở hộp thoại chọn ảnh
});

// Thêm sự kiện change vào input file để thay đổi avatar khi chọn ảnh
avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload =async function(e) {
            avatarImg.src = e.target.result; // Thay đổi src của ảnh avatar
            // const formData = new FormData();
            // formData.append("avatar", avatarInput.files[0]);

            // try {
            //     const response = await fetch("/profile/update-avatar", {
            //         method: "POST",
            //         body: formData,
            //     });

            //     if (response.ok) {
            //         const result = await response.json();
            //         alert(result.message);
            //         location.reload(); // Reload lại trang để cập nhật thông tin
            //     } else {
            //         const error = await response.json();
            //         alert(`Error: ${error.error}`);
            //     }
            // } catch (err) {
            //     console.error("Error updating avatar:", err);
            //     alert("An error occurred while updating avatar.");
            // }
        };
        reader.readAsDataURL(file); // Đọc file ảnh và hiển thị lên avatar
    }
    
});


document.getElementById("update-button").addEventListener("click", async () => {

    
    const data = {
        firstName: document.getElementById("first-name").value,
        lastName: document.getElementById("last-name").value,
        streetAddress: document.getElementById("street-address").value,
        city: document.getElementById("city").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
    };

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

// Submit password form
passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const data = {
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
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            overlay.classList.remove("visible"); // Hide overlay on success
            location.reload(); // Reload to reflect changes
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (err) {
        console.error("Error updating password:", err);
        alert("An error occurred while updating password.");
    }
});

// document.getElementById("update-avatar-button").addEventListener("click", async () => {
//     const formData = new FormData();
//     formData.append("avatar", avatarInput.files[0]);

//     try {
//         const response = await fetch("/profile/update-avatar", {
//             method: "POST",
//             body: formData,
//         });

//         if (response.ok) {
//             const result = await response.json();
//             alert(result.message);
//             location.reload(); // Reload lại trang để cập nhật thông tin
//         } else {
//             const error = await response.json();
//             alert(`Error: ${error.error}`);
//         }
//     } catch (err) {
//         console.error("Error updating avatar:", err);
//         alert("An error occurred while updating avatar.");
//     }
// });

