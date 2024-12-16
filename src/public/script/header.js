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
    const dropdown = document.getElementById("user-dropdown");
    dropdown.classList.toggle("show");
}
