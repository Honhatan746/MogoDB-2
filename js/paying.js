
const API_ORDER = "https://kid-clothes-store.onrender.com/api/v1/orders";
const API_CART = "https://kid-clothes-store.onrender.com/api/v1/cart";

function hide(){
    const dangNhapPaying = document.getElementById("dangNhapPaying");
    const token = localStorage.getItem("token");
    if(!token){
        dangNhapPaying.style.display = "block";
    }else {
        dangNhapPaying.style.display = "none";
    }
}
hide();
async function fetchMyInfo(){
    const token = localStorage.getItem("token");
    if(!token){
        alert("Bạn chưa đăngn nhập");
        return;
    }
    else{
        try {
            const res = await fetch("https://kid-clothes-store.onrender.com/api/v1/users/myInfo", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            if(data.code === 1000 ){
                fillForm(data.result);
            }else{
                console.log("Không thể lấy thông tin người dùng");
            }
        } catch (error) {
            
        }
    }
}
function fillForm(user) {
    // Gán dữ liệu vào các input dựa trên ID trong HTML của bạn
    if (user.fullName) document.getElementById("payingName").value = user.fullName;
    if (user.email) document.getElementById("payingEmail").value = user.email;
    if (user.phone) document.getElementById("payingTel").value = user.phone;
    if (user.address) document.getElementById("payingAddress").value = user.address;
    
    // Nếu bạn muốn hiển thị thông báo "Chào mừng" tại phần đăng nhập
    const dangNhapText = document.getElementById("dangNhapPaying");
    if (dangNhapText) {
        dangNhapText.innerHTML = `Chào, <strong>${user.fullName}</strong>`;
    }
}
async function getCart(){
    const token = localStorage.getItem("token");
    if(!token){
        alert("Vui lòng đăng nhập");
        return;
    }
    try {
        const  res = await fetch(API_CART, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        if(data.code === 1000){
            renderProduct(data.result.items || []);
        }
    } catch (error) {
        console.error("Loi load cart: ", error);
    }
    
}
function renderProduct(items){
    const list = document.querySelector(".paying-list");
    const totalTem = document.getElementById("totalTem");
    const totalEle = document.getElementById("total");
    list.innerHTML = "";
    
    if(items.length === 0){
        list.innerHTML = "<p>Giỏ hàng trống</p>";
        totalEle.innerText = "0đ";
        totalTem.innerText = "0đ";
        return;
    }
    let total = 0;
    items.forEach(item => {
        total += item.subTotal || 0;
        list.innerHTML += `
        <div class="paying-item di-flex alignItem-cen wid-100 justi-btw bo-bot mar-t-b">
        <div class="di-flex alignItem-cen ">
        <div class="frame_img paying-item-img">
        <img class="img-cls" src="${item.imageUrl}" alt="">
        <div class="absolute">${item.quantity}</div>
        </div>
        <p class="font-price">${item.productName}</p>
        </div>
        <p>${Number(item.subTotal).toLocaleString("vi-VN")}đ</p>
        </div>
        `;
    }); 
    totalEle.innerText = total.toLocaleString("vi-VN") + "đ";
    totalTem.innerText = total.toLocaleString("vi-VN") + "đ";
}

document.addEventListener("DOMContentLoaded", () => {
    getCart();
    fetchMyInfo();
});

async function creatOrder(){
    const token = localStorage.getItem("token");
    if(!token){
        alert("Vui lòng đăng nhập");
        return;
    }

    const name = document.getElementById("payingName").value.trim();
    const phone = document.getElementById("payingTel").value.trim();
    const address = document.getElementById("payingAddress").value.trim();

    const country = document.getElementById("payingCountruy").value.trim();
    const province = document.getElementById("payingProvince").value.trim();
    const quan = document.getElementById("payingQuan").value.trim();
    const phuong = document.getElementById("payingPhuong").value.trim();
    const fullAddress = `${address}, ${phuong}, ${quan}, ${province}, ${country}`;

    // validate
    if(!name || !phone || !address){
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    const info = {
        receiverName: name,
        receiverPhone: phone,
        shippingAddress: fullAddress,
        paymentMethod: "COD"
    }
    console.log(info);
    try {
        const res = await fetch("https://kid-clothes-store.onrender.com/api/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                receiverName: name,
                receiverPhone: phone,
                shippingAddress: fullAddress,
                paymentMethod: "COD"
            })
        });

        const data = await res.json();
          
        if(data.code === 1000){
            alert("Đặt hàng thành công!");
            clearCart();
            window.location.href = "index.html";

        } else {
            alert(data.message || "Tạo đơn thất bại");
        }

    } catch(err){
        console.error(err);
        alert("Lỗi server");
    }
}
async function clearCart(){
    const token = localStorage.getItem("token");
    try {
        const res = fetch(API_CART, {
            method: "DELETE",
            headers:{
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        if(data === 1000){
            console.log("Vỏ hàng được xóa sạch ròi");
        }
    } catch (error) {
        console.error("Lỗi gì nè: ", error);
    }
}