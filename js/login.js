    import { login } from "./auth.js";
const loginBtn = document.getElementById("loginBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");

loginBtn.addEventListener("click", function(e){
    e.preventDefault();
    handeLogin();
})
async function handeLogin(){
    const email = loginEmail.value.trim();
    const password = loginPass.value.trim();

    if(email === "" || password === ""){
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    const result = await login({email, password});

    if(result.result?.token){
        localStorage.setItem("token", result.result.token);
        await getProfile();
        alert("Đăng nhập thành công");
        window.location.href = "../index.html";
    }else{
        alert("Sai email hoặc mật khẩu");
    }

}
async function getProfile(){
        const token = localStorage.getItem("token");

        const res = await fetch("https://kid-clothes-store.onrender.com/api/v1/users/myInfo", {
        headers: {
                    "Authorization": `Bearer ${token}`
                }
        });
        const data = await res.json();
        if(data.code === 1000){
                localStorage.setItem("role", data.result.role);
                localStorage.setItem("userId", data.result.id);
            }
        }