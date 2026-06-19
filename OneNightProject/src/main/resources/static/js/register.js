document
    .getElementById("register-form")
    .addEventListener("submit", register);

async function register(event) {

    event.preventDefault();

    const email =
        document.getElementById("reg-email").value.trim();

    const password =
        document.getElementById("reg-password").value;

    const confirmPassword =
        document.getElementById("reg-password-confirm").value;

    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {

        $('#passwordMismatchModal').modal('show');

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

        // Đọc dữ liệu trả về
        let data = null;

        try {
            data = await response.json();
        } catch (e) {
            console.log("Response không có JSON");
        }

        console.log("HTTP Status:", response.status);
        console.log("Response Data:", data);

        // Email đã tồn tại
        if (response.status === 500) {

            $('#registerFailedModal').modal('show');

            return;
        }

        // Thành công
        if (response.ok) {

            // User chưa active
            if (data && data.status === "INACTIVE") {

                $('#registerInactive').modal('show');

                document
                    .getElementById("register-form");

                return;
            }

            $('#registerSuccessModal')
                .modal('show');

            document
                .getElementById("register-form");

            return;
        }

    } catch (error) {

        console.error("Register Error:", error);

        alert("Có lỗi xảy ra khi đăng ký");
    }
}