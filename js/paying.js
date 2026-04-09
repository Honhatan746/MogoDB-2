
const API_ORDER = "https://kid-clothes-store.onrender.com/api/v1/orders";
const API_CART = "https://kid-clothes-store.onrender.com/api/v1/cart";

function hide(){
    const dangNhapPaying = document.getElementById("dangNhapPaying");
    const token = localStorage.getItem("token");

    if(!token){
        dangNhapPaying.style.display = "block";

        showMessage({
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để thanh toán",
            type: "warning",
            onOk: () => window.location.href = "login.html"
        });

    }else{
        dangNhapPaying.style.display = "none";
    }
}
async function fetchMyInfo(){
    const token = localStorage.getItem("token");

    if(!token){
        showMessage({
            title: "Lỗi",
            message: "Bạn chưa đăng nhập",
            type: "warning",
            onOk: () => window.location.href = "login.html"
        });
        return;
    }

    try {
        const res = await fetch("https://kid-clothes-store.onrender.com/api/v1/users/myInfo", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if(data.code === 1000){
            fillForm(data.result);
        }else{
            showMessage({
                title: "Lỗi",
                message: "Không lấy được thông tin user",
                type: "error"
            });
        }

    } catch (error){
        console.error(error);
        showMessage({
            title: "Lỗi server",
            message: "Không thể kết nối server",
            type: "error"
        });
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
        showMessage({
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để xem giỏ hàng",
            type: "warning",
            onOk: () => window.location.href = "login.html"
        });
        return;
    }

    try {
        const res = await fetch(API_CART, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if(data.code === 1000){
            renderProduct(data.result.items || []);
        }

    } catch (error){
        console.error(error);
        showMessage({
            title: "Lỗi",
            message: "Không load được giỏ hàng",
            type: "error"
        });
    }
}

function renderProduct(items){
    const list = document.querySelector(".paying-list");
    const totalTem = document.getElementById("totalTem");
    const totalEle = document.getElementById("total");

    if(!list) return;

    list.innerHTML = "";

    if(items.length === 0){
        list.innerHTML = "<p>Giỏ hàng trống</p>";
        totalEle.innerText = "0đ";
        totalTem.innerText = "0đ";
        return;
    }

    let total = 0;
    let html = "";

    items.forEach(item => {
        total += item.subTotal || 0;

        html += `
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

    list.innerHTML = html;
    totalEle.innerText = total.toLocaleString("vi-VN") + "đ";
    totalTem.innerText = total.toLocaleString("vi-VN") + "đ";
}

let isOrdering = false; // 1. Biến cờ hiệu để kiểm soát trạng thái

async function creatOrder() {
    // 2. Nếu đang trong quá trình đặt hàng, chặn không cho chạy tiếp
    if (isOrdering) return; 

    const token = localStorage.getItem("token");
    if (!token) {
        // ... (Giữ nguyên logic thông báo chưa đăng nhập)
        return;
    }

    // Lấy nút bấm để xử lý giao diện (Giả sử ID nút là btnOrder)
    const btnOrder = document.getElementById("btnOrder"); 

    const name = document.getElementById("payingName").value.trim();
    const phone = document.getElementById("payingTel").value.trim();
    const address = document.getElementById("payingAddress").value.trim();
    const country = document.getElementById("payingCountruy").value.trim();

    // VALIDATE
    if (!name || !phone || !address) {
        showMessage({
            title: "Thiếu thông tin",
            message: "Vui lòng nhập đầy đủ thông tin",
            type: "warning"
        });
        return;
    }

    try {
        // 3. Bắt đầu quá trình gửi request: Khóa trạng thái và nút bấm
        isOrdering = true; 
        if (btnOrder) {
            btnOrder.disabled = true;
            btnOrder.innerText = "ĐANG XỬ LÝ...";
        }

        const res = await fetch(API_ORDER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                receiverName: name,
                receiverPhone: phone,
                shippingAddress: `${address}, ${country}`,
                paymentMethod: "COD"
            })
        });

        const data = await res.json();

        if (data.code === 1000) {
            showMessage({
                title: "Thành công",
                message: "Đặt hàng thành công!",
                type: "success",
                onOk: async () => {
                    await clearCart();
                    window.location.href = "index.html";
                }
            });
        } else {
            // Nếu server trả về lỗi, mở lại nút để user thử lại
            isOrdering = false; 
            if (btnOrder) {
                btnOrder.disabled = false;
                btnOrder.innerText = "ĐẶT HÀNG";
            }
            showMessage({
                title: "Thất bại",
                message: data.message || "Tạo đơn thất bại",
                type: "error"
            });
        }

    } catch (err) {
        console.error(err);
        // 4. Nếu lỗi mạng/server, cũng phải mở lại nút
        isOrdering = false; 
        if (btnOrder) {
            btnOrder.disabled = false;
            btnOrder.innerText = "ĐẶT HÀNG";
        }
        showMessage({
            title: "Lỗi server",
            message: "Không thể kết nối server",
            type: "error"
        });
    }
}
async function clearCart(){
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API_CART, {
            method: "DELETE",
            headers:{
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if(data.code === 1000){
            console.log("Đã xóa giỏ hàng");
        }

    } catch (error){
        console.error(error);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    hide();
    getCart();
    fetchMyInfo();
});