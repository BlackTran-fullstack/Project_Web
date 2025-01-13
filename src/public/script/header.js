document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll(".nav-item");
    const currentPage = window.location.pathname.split("/").pop() || "home";

    let isActiveSet = false;

    navItems.forEach((item) => {
        const page = item.getAttribute("data-page");
        if (page === currentPage) {
            item.classList.add("active");
            isActiveSet = true;
        } else {
            item.classList.remove("active");
        }
    });

    if (!isActiveSet) {
        navItems.forEach((item) => item.classList.remove("active"));
    }

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            navItems.forEach((i) => i.classList.remove("active"));
            item.classList.add("active");
            localStorage.setItem("activePage", item.getAttribute("data-page"));
        });
    });
});

function toggle() {
    // Lấy phần tử dropdown menu bằng id
    const dropdownMenu = document.getElementById("user-dropdown");

    // Kiểm tra và thêm/xóa lớp 'show' để bật/tắt menu
    if (dropdownMenu) {
        dropdownMenu.classList.toggle("show");
    }
}

document.addEventListener("click", (event) => {
    const dropdownMenu = document.getElementById("user-dropdown");
    const userIcon = document.querySelector(".fa-user"); // Biểu tượng người dùng

    // Kiểm tra nếu nhấp ngoài menu và biểu tượng
    if (
        dropdownMenu &&
        !dropdownMenu.contains(event.target) &&
        !userIcon.contains(event.target)
    ) {
        dropdownMenu.classList.remove("show");
    }
});

function toggleRes() {
    const dropdownMenu = document.querySelector(
        ".dropdown-menu-res.open #user-dropdown"
    );

    console.log(1);

    if (dropdownMenu) {
        dropdownMenu.classList.toggle("show");
        console.log(2);
    }
}

const toggleBtn = document.querySelector(".toggle-btn");
const toggleBtnIcon = document.querySelector(".toggle-btn i");
const dropdownMenuRes = document.querySelector(".dropdown-menu-res");

toggleBtn.onclick = function () {
    dropdownMenuRes.classList.toggle("open");
    const isOpen = dropdownMenuRes.classList.contains("open");

    toggleBtnIcon.classList = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
};
