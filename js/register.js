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
    async function handleRegister(){
        if (!validForm()){
            return;
        }
        const userData = {
            fullName: registerFull.value,
            email: registerEmail.value,
            password: registerPass.value,
            phone: registerTel.value,
            address: registerAddress.value
        }
        const result = await register(userData);
        console.log(result);

        if(result.code === 1000){
            // alert("Đăng ký tài Khoản thành công");
            // //luu email/password gui vo api signin->luu token
            // const loginResult = await login({
            //     email: registerEmail.value,
            //     password: registerPass.value
            // }); 
            // if(loginResult.result?.token){
            //     localStorage.setItem("token", loginResult.result.token);
            //     window.location.href = "../login.html";
            // }else{
            //     alert("Đăng Nhập thất bại");
            // }

            window.location.href = "../login.html";
            //lay token do de get danhsch sanpham chuyen trang home  
        }else if (result.code === 400){
            alert(result.message)
        }
        else if(result.code === 666){
            alert("Người dùng đã tồn tại")
        }

}

    function validForm(){
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(registerFull.value.trim() === ""){
            showRequired(registerFull, "field-required");
            return false;
        }if(registerEmail.value.trim() === ""){
            showRequired(registerEmail, "field-required");
            return false;
        }if(!emailRegex.test(registerEmail.value.trim())){
            showRequired(registerEmail, "required-formatEmail");
            return false;
        }if((registerTel.value.trim().length >= 1 && registerTel.value.trim().length !== 10 ) || /\s/.test(registerTel.value) || isNaN( registerTel.value.trim()) || (registerTel.value.trim().length === 10 &&  registerTel.value.trim()[0] !== "0") ){
            showRequired(registerTel, "field-required");
            return false;
        }if(registerPass.value.trim().length < 8 ){
            showRequired(registerPass, "field-required");
            return false;
        }if(registerRePass.value.trim() === ""){
            showRequired(registerRePass, "field-required");
            return false;
        }if(registerRePass.value.trim() !== registerPass.value){
            showRequired(registerRePass, "field-required-notmatch");
            return false;
        }
        return true;
    }
    function showRequired(tagParent, fieldRequired){
        let parent = tagParent.parentElement;
        let ptag = parent.querySelector("." + fieldRequired);
        ptag.style.display = "block";
        tagParent.focus();
    }
    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("keyup", function(){
            let parent = this.parentElement;
            let ptags = parent.querySelectorAll("p");
            ptags.forEach(function(ptag){
                ptag.style.display = "none";
            })
        })
    })

