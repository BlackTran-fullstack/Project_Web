// Đảm bảo rằng thông báo lỗi được hiển thị trong 2 giây
if (document.getElementById("error-message")) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.style.display = "block"; // Hiển thị thông báo lỗi

    // Ẩn thông báo sau 2 giây
    setTimeout(function () {
        errorMessage.style.display = "none";
    }, 2000); // 2000ms = 2 giây
}
