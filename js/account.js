// log out
const logout = document.getElementById("logout");
logout.addEventListener("click", function(e){
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "./index.html";
})
//Account
async function getUserInfo(){
    if(!token){
        window.location.href = "login.html";
        return;
    }
    try {
        const respone = await fetch("https://kid-clothes-store.onrender.com/api/v1/users/myInfo", {
            headers: {
                 "Authorization": `Bearer ${token}`
            }
        });
        const data = await respone.json();
        const user = data.result;
        console.log(user)
        
        const fullNameAccounts = document.querySelectorAll(".fullNameAccount");
        const emailAccount = document.getElementById("emailAccount");
        const telAccount = document.getElementById("telAccount");
        const addressAccount = document.getElementById("addressAccount");
        
        fullNameAccounts.forEach(fullNameAccount => {
            fullNameAccount.innerText = user.fullName;
        })
        emailAccount.innerText  = user.email;
        telAccount.innerText = user.phone;
        addressAccount.innerText = user.address; 
    } catch (error) {
        console.error("Lỗi: ", error);
    }
}

getUserInfo();