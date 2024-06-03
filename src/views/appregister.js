document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector(".register-form");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        const userData = {
            email: usernameInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData.message);
            } else {
                const errorMessage = await response.json();
                console.error("Error:", errorMessage.error);
            }
        } catch (err) {
            console.log(JSON.stringify("Error"));
        }
    });
});
