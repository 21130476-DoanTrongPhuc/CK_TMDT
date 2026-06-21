document
    .getElementById("password-recovery-form")
    .addEventListener(
        "submit",
        recoverPassword
    );

async function recoverPassword(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("recover-email")
            .value
            .trim();

    if (!email) {

        alert("Please enter your email");

        return;
    }

    const request = {
        email: email
    };

    try {

        const response = await fetch(
            "http://localhost:8081/api/v1/customers/resetPassword",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            }
        );

        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);
        }

        const message =
            await response.text();

        alert(message);

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}