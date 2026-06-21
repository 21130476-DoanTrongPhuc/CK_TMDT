document
    .getElementById("login-form")
    .addEventListener(
        "submit",
        login
    );

async function login(event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const rememberMe =
        document.getElementById("remember_me").checked;

    const request = {
        email,
        password
    };

    try {

        const response =
            await fetch(
                "http://localhost:8081/api/v1/auth",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(request)
                }
        );

        if (!response.ok) {
            throw new Error(
                "Login failed"
            );
        }

        const data =
            await response.json();

        console.log(data);

        /*
            {
                accessToken: "...",
                refreshToken: "...",
                user: {...}
            }
        */

        localStorage.setItem(
            "accessToken",
            data.token
        );

        if (rememberMe) {

            localStorage.setItem(
                "userEmail",
                email
            );
        }

        window.location.href =
            "/index.html";

    } catch(error) {

        console.error(error);

        alert(
            "Email hoặc mật khẩu không đúng"
        );
    }
}





