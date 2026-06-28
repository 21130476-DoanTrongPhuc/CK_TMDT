const token = localStorage.getItem("accessToken");

const user = localStorage.getItem("userEmail");

// =========================
// Update Primary Menu
// =========================
function updateNavbar() {

    const accountMenu = document.getElementById("account-menu");


    if (!accountMenu) return;

    if (token) {
        accountMenu.classList.remove("d-none");
    } else {
        accountMenu.classList.add("d-none");
    }

}

// =========================
// Update Account
// =========================
function updateAccount() {


    console.log(token);
    console.log(user);

    const greeting = document.getElementById("account-greeting");

    const email = document.getElementById("account-email");

    const logoutBtn = document.getElementById("logout-btn");

    const accountNav = document.getElementById("account-nav-item");

    const accountLink = document.getElementById("account-link");

    if (
        !greeting ||
        !email ||
        !logoutBtn ||
        !accountNav ||
        !accountLink
    ) {
        return;
    }



    if (token && user) {

        greeting.textContent = "Hello,";

        email.textContent = user;

        logoutBtn.classList.remove("d-none");

        accountNav.classList.remove("d-none");

        accountLink.href = "account-profile.html";

    } else {

        greeting.textContent = "Hello, Sign in";

        email.textContent = "My Account";

        logoutBtn.classList.add("d-none");

        accountNav.classList.add("d-none");

        accountLink.href = "account-signin.html";

    }

}

// =========================
// Logout
// =========================
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function (e) {

        e.preventDefault();

        localStorage.removeItem("accessToken");

        localStorage.removeItem("user");

        updateNavbar();

        updateAccount();

        window.location.href = "account-signin.html";

    });

}

// =========================
// Init Navbar
// =========================
document.addEventListener("DOMContentLoaded", function () {

    updateNavbar();

    updateAccount();


});