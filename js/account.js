
function handleAuthRedirect(){
    const token = localStorage.getItem("token");

    if(!token){
        showMessage({
            title: "Chưa đăng nhập",
            message: "Bạn cần đăng nhập để tiếp tục",
            type: "warning",
            showCancel: true,
            onOk: () => {
                window.location.href = "login.html";
            }
        });
    }else{
        window.location.href = "account(remake).html";
    }
}
// log out
const logout = document.getElementById("logout");

if(logout){
    logout.addEventListener("click", function(e){
        e.preventDefault();
        showMessage({
        title: "Xác nhận đăng xuất ?",
        message: "Bạn có muốn đăng xuất không này không?",
        type: "warning",
        showCancel: true,
        okText: "Xóa ngay",
        onOk:() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "index.html";
        }
    });
    });
}
document.addEventListener("DOMContentLoaded", () => {
    getUserInfo();
    handleUpdateProfile();
    handleChangePassword();
});

//Account
async function getUserInfo(){
    const token = localStorage.getItem("token");
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
        console.log(user);
        
        if(data.code === 1000){
            const roleBadge = document.getElementById("roleBadge");

            if(user.role === "USER"){
                roleBadge.innerText = "Khách hàng";
                roleBadge.classList.remove("badge-staff");
                roleBadge.classList.add("badge-user");
            }
            else if(user.role === "STAFF"){
                roleBadge.innerText = "Nhân viên";
                roleBadge.classList.remove("badge-user");
                roleBadge.classList.add("badge-staff");
            }
            document.getElementById("fullNameAccount").innerText = user.fullName;
            document.getElementById("emailAccount").innerHTML = `<i class="ti-email"></i> ${user.email}`;
            document.getElementById("addressAccount").innerHTML = user.address ? `<i class="ti-map-alt"></i> ${user.address}` : "";
            document.getElementById("telAccount").innerHTML =user.phone ? `<i class="ti-mobile"></i> ${user.phone}` : "";
            
            document.querySelector("input[name='fullName']").value = user.fullName;
            document.querySelector("input[name='phone']").value = user.phone || "";
            document.querySelector("textarea[name='address']").value = user.address || "";
            document.querySelector("input[type='email']").value = user.email
        }else{
            showToast("Không load được thông tin", true);
        }

    } catch (error) {
        console.error(error);
        showToast("Lỗi server", true);
    }
}
   // Hàm hiển thị thông báo Toast dựa trên Error Code của API
    function showToast(message, isError = false){
    const toastEl = document.getElementById("liveToast");
    const toastMsg = document.getElementById("toastMsg");

    toastMsg.innerText = message;

    toastEl.classList.remove("bg-primary", "bg-danger");
    toastEl.classList.add(isError ? "bg-danger" : "bg-primary");

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    }
// Update profile
    function handleUpdateProfile(){
        const form = document.getElementById("profileForm");
        if(!form) return;
        form.addEventListener("submit", async (e)=> {
            e.preventDefault();
            
            const token = localStorage.getItem("token");
            if(!token){
                showToast("Vui lòng đăng nhập", true);
                window.location.href ="../index.html";
                return;
            }

            const fullName = form.fullName.value.trim();
            const phone = form.phone.value.trim();
            const address = form.address.value.trim();
            // Validate
            if(fullName.length < 3){
                showToast("Tên phải ít nhất 3 ký tự", true);    
                return;
            }
            if(phone && !/^[0-9]{9,11}$/.test(phone)){
                showToast("Số điện thoại không hợp lệ", true);
                return;
            }
            try {
                const res = await fetch("https://kid-clothes-store.onrender.com/api/v1/users/myInfo", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fullName,
                        phone,
                        address
                    })
                });

                const data = await res.json();
                if(data.code === 1000){
                    showToast("Cập nhật thành công");
                    getUserInfo();
                }else{
                    showToast(data.message || "Cập nhật thất bại", true);
                }
            } catch (error) {
                console.error(error);
                showToast("Lỗi server", true);
            }
        })
    }
// Change password
function handleChangePassword(){    
    const form = document.getElementById("passwordForm");
    if(!form) return;

    const newPass = document.getElementById("newPassword");
    const confirmPass = document.getElementById("confirmPassword");
    const error = document.getElementById("matchError");

    // realtime check
    confirmPass.addEventListener("input", () => {
        if(confirmPass.value !== newPass.value){
            error.classList.remove("d-none");
        } else {
            error.classList.add("d-none");
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if(!token){
            showToast("Vui lòng đăng nhập", true);
            window.location.href ="../index.html";
            return;
        }

        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = newPass.value;
        const confirmPassword = confirmPass.value;
        console.log(oldPassword, newPassword, confirmPassword);
        // VALIDATE
        if(newPassword.length < 8){
            showToast("Mật khẩu phải >= 8 ký tự", true);
            return;
        }

        if(newPassword !== confirmPassword){
            showToast("Mật khẩu không khớp", true);
            return;
        }

        try {
            const res = await fetch(`https://kid-clothes-store.onrender.com/api/v1/users/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                    confirmPassword
                })
            });

            const data = await res.json();

            if(data.code === 1000){
                showToast("Đổi mật khẩu thành công");
                form.reset();
            } else if(data.code === 103) {
                showToast(data.message || "Mật khẩu cũ không chính xác", true);
            }else{
                showToast(data.message || "Mật khẩu không khớp", true);
            }

        } catch(err){
            console.error(err);
            showToast("Lỗi server", true);
        }
    });
}
