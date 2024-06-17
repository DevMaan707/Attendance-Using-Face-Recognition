//const { error } = require("console");

document.addEventListener("DOMContentLoaded",()=>{
    const updatepwd=document.querySelector(".update-form");
    updatepwd.addEventListener("submit",async(event)=>{
        event.preventDefault();
        const usernameInput=document.getElementById("username");
        const oldpass=document.getElementById("oldpassword");
        const newpass=document.getElementById("newpassword");
        const userData={
            email:usernameInput.value,
            oldpassword:oldpass.value,
            newpassword:newpass.value,
        };
        try{
            const response=await fetch("/update",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(userData)
            });
            if(response.ok){
                const responseData= await response.json();
                console.log(responseData.message);
            }else{
                const errorMessage=await response.json();
                console.error("Error:",errorMessage.error);
            }
        }catch(err){
            console.log(JSON.stringify({error:{}}));
        }

    });
});