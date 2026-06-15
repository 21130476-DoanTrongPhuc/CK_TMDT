document
    .getElementById("register-form")
    .addEventListener(
        "submit",
        register
    );

async function register(event) {

    event.preventDefault();

    const email =
        document.getElementById("reg-email").value.trim();

    const password =
        document.getElementById("reg-password").value;

    const confirmPassword =
        document.getElementById("reg-password-confirm").value;

    // Validate
    if (password !== confirmPassword) {

        alert("Passwords do not match");

        return;
    }

    const request = {
        email: email,
        password: password
    };

    try {

        const response = await fetch(
            "http://localhost:8081/api/v1/customers",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            }
        );

        if(response.ok){
            $('#registerSuccessModal')
                .modal('show');

            document
                .getElementById("register-form")
                .reset();

            return;
        }

        if(response.status === 500){

            $('#registerFailedModal')
                .modal('show');

            return;
        }

        const data =
            await response.json();

        console.log("Register success:", data);

        alert("Register successful!");

        // Nếu backend trả JWT luôn
        if (data.accessToken) {

            localStorage.setItem(
                "accessToken",
                data.accessToken
            );

            window.location.href =
                "index.html";
        }

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}