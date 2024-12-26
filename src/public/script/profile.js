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
        reader.onload = function(e) {
            avatarImg.src = e.target.result; // Thay đổi src của ảnh avatar
        };
        reader.readAsDataURL(file); // Đọc file ảnh và hiển thị lên avatar
    }
});
