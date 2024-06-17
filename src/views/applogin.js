import axios from "axios";
document.addEventListener("DOMContentLoaded",()=>{
    const login=document.querySelector(".login-form");
    login.addEventListener("submit",async (event)=>{
        event.preventDefault();
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        const userData={
            email:usernameInput.value,
            password:passwordInput.value
        };
        try{
            const response=await axios.get("/index.html",{
                headers:{
                    "Content-Type": "application/json"
                },
                data:userData
            });
            console.log(JSON.stringify(response.data.message));
        }catch (err)
        {
            console.log(JSON.stringify("Error"+err));
        }
    });
});