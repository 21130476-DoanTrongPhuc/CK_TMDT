document.getElementById("logout-btn")
    .addEventListener("click", function (e) {

        e.preventDefault();

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        window.location.href = "account-signin.html";
    });