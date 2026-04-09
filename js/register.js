    import { login, register } from "./auth.js";
    

    const registerBtn = document.getElementById("registerBtn");
    //Lắng nghe sự kiện nhấn nút đăng ký
    registerBtn.addEventListener("click", function(e){
        e.preventDefault(); // set để cho mỗi khi nhấn nút không reload lại trang á
        handleRegister(); // Gọi hàm này để truyền dữ liệu và giải quyết lỗi 
    });
    //---
    const registerFull = document.getElementById("registerFull");
    const registerEmail = document.getElementById("registerEmail");
    const registerGender = document.getElementById("registerGender");
    const registerTel = document.getElementById("registerTel");
    const registerPass = document.getElementById("registerPass");
    const registerRePass = document.getElementById("registerRePass");
    const registerAddress = document.getElementById("registerAddress");
    //---
    let isRegistering = false;
    async function handleRegister() {
    if (isRegistering) return;
    if (!validForm()) return;

    isRegistering = true;
    
    // Thêm: Vô hiệu hóa nút bấm và hiện loading text
    registerBtn.disabled = true;
    const originalText = registerBtn.innerText;
    registerBtn.innerText = "Đang xử lý...";

    const userData = {
        fullName: registerFull.value.trim(),
        email: registerEmail.value.trim(),
        password: registerPass.value.trim(),
        phone: registerTel.value.trim(),
        address: registerAddress.value.trim()
    };

    try {
        const result = await register(userData);
        
        if (result.code === 1000) {
            showMessage({
                title: "Thành công 🎉",
                message: "Đăng ký tài khoản thành công!",
                type: "success",
                onOk: () => {
                    window.location.href = "../login.html";
                }
            });
        } else {
            // Xử lý các mã lỗi khác (giữ nguyên logic của bạn)
            handleErrors(result);
            
            // QUAN TRỌNG: Nếu đăng ký thất bại, phải mở lại nút để họ sửa thông tin
            isRegistering = false;
            registerBtn.disabled = false;
            registerBtn.innerText = originalText;
        }

    } catch (error) {
        console.error(error);
        showMessage({
            title: "Server Error",
            message: "Không thể kết nối tới server",
            type: "error"
        });
        
        // QUAN TRỌNG: Giải phóng trạng thái khi có lỗi kết nối
        isRegistering = false;
        registerBtn.disabled = false;
        registerBtn.innerText = originalText;
    }
}

 function validForm() {
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;

    if (registerFull.value.trim() === "") {
        showRequired(registerFull, "field-required");
        isValid = false;
    }

    if (registerEmail.value.trim() === "") {
        showRequired(registerEmail, "field-required");
        isValid = false;
    } else if (!emailRegex.test(registerEmail.value.trim())) {
        showRequired(registerEmail, "required-formatEmail");
        isValid = false;
    }

    const phoneVal = registerTel.value.trim();
    if (phoneVal !== "" && !phoneRegex.test(phoneVal)) {
        showRequired(registerTel, "field-required");
        isValid = false;
    }

    if (registerPass.value.trim().length < 8) {
        showRequired(registerPass, "field-required");
        isValid = false;
    }

    if (registerRePass.value.trim() === "") {
        showRequired(registerRePass, "field-required");
        isValid = false;
    } else if (registerRePass.value.trim() !== registerPass.value.trim()) {
        showRequired(registerRePass, "field-required-notmatch");
        isValid = false;
    }

    return isValid;
}
    function showRequired(tagInput, className) {
    let parent = tagInput.parentElement;
    let errorMsg = parent.querySelector("." + className);
    
    if (errorMsg) {
        errorMsg.style.display = "block";
        tagInput.classList.add("border-danger"); // Thêm viền đỏ của Bootstrap hoặc CSS
        tagInput.style.borderColor = "#ff6b6b";  // Force màu đỏ nếu CSS không ăn
    }
}
    document.querySelectorAll(".register input, .register select").forEach(element => {
    element.addEventListener("input", function() {
        // 1. Ẩn tất cả thẻ <p> báo lỗi trong cùng thẻ cha
        let parent = this.parentElement;
        parent.querySelectorAll("p").forEach(p => {
            p.style.display = "none";
        });
        
        // 2. Xóa viền đỏ của input
        this.classList.remove("border-danger");
        this.style.borderColor = "#eee"; // Trả về màu border mặc định
    });
});
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

