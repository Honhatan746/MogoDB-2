    import { login } from "./auth.js";
const loginBtn = document.getElementById("loginBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");

loginBtn.addEventListener("click", function(e){
    e.preventDefault();
    handleLogin();
})
async function handleLogin(){
    const email = loginEmail.value.trim();
    const password = loginPass.value.trim();

    // VALIDATE
    if(email === "" || password === ""){
        showMessage({
            title: "Thiếu thông tin",
            message: "Vui lòng nhập đầy đủ email và mật khẩu",
            type: "warning"
        });
        return;
    }

    try {
        const result = await login({email, password});

        if(result.result?.token){
            localStorage.setItem("token", result.result.token);

            await getProfile();

            showMessage({
                title: "Thành công",
                message: "Đăng nhập thành công",
                type: "success",
                onOk: () => {
                    window.location.href = "../index.html";
                }
            });

        }else{
            showMessage({
                title: "Thất bại",
                message: "Sai email hoặc mật khẩu",
                type: "error"
            });
        }

    } catch (err){
        console.error(err);
        showMessage({
            title: "Lỗi",
            message: "Không thể kết nối server",
            type: "error"
        });
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
document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", function() {
        // Tìm input tương ứng dựa trên data-target
        const targetId = this.getAttribute("data-target");
        const passwordInput = document.getElementById(targetId);
        
        // Chuyển đổi type giữa password và text
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.classList.replace("ti-lock", "ti-unlock");
        } else {
            passwordInput.type = "password";
            this.classList.replace("ti-unlock", "ti-lock");
        }
    });
});
