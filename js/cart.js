const API_CART = "https://kid-clothes-store.onrender.com/api/v1/cart";

function checkAuth(){
    const token = localStorage.getItem("token");

    if(!token){
        showMessage({
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để sử dụng giỏ hàng",
            type: "warning",
            onOk: () => window.location.href = "../login.html"
        });
        return null;
    }
    return token;
}
document.addEventListener("DOMContentLoaded", getCart);
// ================= GET CART =================
export async function getCart(){
    const token = localStorage.getItem("token");

    if(!token) return;

    try {
        const res = await fetch(API_CART, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        console.log(data);

        if(data.code === 1000){
            renderCart(data.result.items);
        }
    } catch(err){
        console.error("Lỗi load cart:", err);
    }
}


// ================= RENDER CART =================

function renderCart(items) {
    const cartList = document.getElementById("cartList");
    const cartCount = document.getElementById("cartCount");
    const cartSubTotal = document.getElementById("cartSubTotal");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartList) return;

    if (!items || items.length === 0) {
        cartList.innerHTML = "<p>Giỏ hàng trống</p>";
        cartCount.innerText = "0";
        cartSubTotal.innerText = "0đ";
        cartTotal.innerText = "0đ";
        return;
    }

    let total = 0;
    // 1. Tạo một biến trung gian để chứa toàn bộ HTML
    let htmlContent = ""; 

    items.forEach(item => {
        total += item.subTotal || 0;

        // 2. Cộng dồn chuỗi vào biến htmlContent 
        htmlContent += `
            <div class="cart-item di-flex bo-bot">
                <i class="ti-close pointer absolute font-w-700 font-title"
                   onclick="removeItem('${item.productId}', '${item.size}', '${item.color}')"></i>

                <div class="frame_img">
                    <img class="img-cls" src="${item.imageUrl}" alt="${item.productName}">
                </div>

                <div class="di-flex flex-colum font-text cart-detail">
                    <p class="font-w-700 font-price">${item.productName}</p>
                    <div class="di-flex g-1">
                        <p>${item.color},</p>
                        <p>${item.size}</p>
                    </div>

                    <div class="product-dt-quantity">
                        <p class="font-title mar-t-b">Số lượng:</p>
                        <div>
                            <button class="btncss no-bor font-w-700"
                                onclick="decrease('${item.productId}', '${item.size}', '${item.color}', ${item.quantity})">–</button>
                            <input type="text" class="quantity-input no-bor font-w-700" value="${item.quantity}" readonly>
                            <button class="btncss no-bor font-w-700 ${item.quantity >= item.stock ? 'btn-disabled' : ''}"
                                onclick="increase('${item.productId}', '${item.size}', '${item.color}', ${item.quantity}, ${item.stock})">+</button>
                        </div>
                    </div>

                    <p class="font-w-700 heading-pink font-price under-line absolute">
                        ${Number(item.subTotal || 0).toLocaleString("vi-VN")}đ
                    </p>
                </div> 
            </div>
        `;
    });

    // 3. Sau khi chạy xong vòng lặp, mới gán một lần duy nhất vào DOM
    cartList.innerHTML = htmlContent;

    // Cập nhật tổng
    cartCount.innerText = items.length;
    cartSubTotal.innerText = total.toLocaleString("vi-VN") + "đ";
    cartTotal.innerText = total.toLocaleString("vi-VN") + "đ";
}

// ================= ADD TO CART =================
let isAdding = false;

export async function addToCart(productId, size, color, quantity){
    const token = checkAuth();
    if(!token) return;

    if(!size || !color){
        showMessage({
            title: "Thiếu thông tin",
            message: "Vui lòng chọn size và màu",
            type: "warning"
        });
        return;
    }

    if(isAdding) return;
    isAdding = true;

    try {
        const res = await fetch(`${API_CART}/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productId, size, color, quantity })
        });

        const data = await res.json();

        if(data.code === 1000){
            showMessage({
                title: "Thành công",
                message: "Đã thêm vào giỏ hàng",
                type: "success"
            });
            getCart();
        } else {
            showMessage({
                title: "Lỗi",
                message: data.message || "Không thể thêm",
                type: "error"
            });
        }

    } catch(err){
        console.error(err);
        showMessage({
            title: "Lỗi",
            message: "Lỗi server",
            type: "error"
        });
    }

    isAdding = false;
}

// ================= UPDATE QUANTITY =================
window.increase = async function(productId, size, color, currentQuantity){
    const token = checkAuth();
    if(!token) return;

    try {
        // 1. Fetch thông tin sản phẩm để lấy stock mới nhất
        const res = await fetch(`https://kid-clothes-store.onrender.com/api/v1/products/${productId}`);
        const data = await res.json();
        
        if(data.code === 1000) {
            const product = data.result;
            // 2. Tìm đúng variant người dùng đang có trong giỏ
            const variant = product.variants.find(v => v.size === size && v.color === color);
            
            if(variant) {
                if(currentQuantity >= variant.stock) {
                    showMessage({
                        title: "Số lượng tối đa",
                        message: `Sản phẩm này chỉ còn ${variant.stock} món trong kho.`,
                        type: "warning"
                    });
                    return;
                }
                
                // 3. Nếu còn hàng thì mới tiến hành update
                updateQuantity(productId, size, color, currentQuantity + 1);
            }
        }
    } catch (err) {
        console.error("Lỗi kiểm tra kho:", err);
    }
}

window.decrease = function(productId, size, color, quantity){
    if(quantity <= 1) return;
    updateQuantity(productId, size, color, quantity - 1);
}

async function updateQuantity(productId, size, color, quantity){
    const token = checkAuth();
    if(!token) return;

    try {
        const res = await fetch(
            `${API_CART}/items/${productId}?size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}&quantity=${quantity}`,
            {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        const data = await res.json();

        if(res.ok && data.code === 1000){
            getCart();
        } else {
            // Hiển thị thông báo lỗi từ server (Ví dụ: "Số lượng vượt quá tồn kho")
            showMessage({
                title: "Không thể cập nhật",
                message: data.message || "Số lượng sản phẩm vượt quá mức cho phép",
                type: "error"
            });
        }
    } catch(err){
        console.error(err);
    }
}


// ================= REMOVE ITEM =================
window.removeItem = function(productId, size, color){
    const token = checkAuth();
    if(!token) return;

    showMessage({
        title: "Xóa sản phẩm",
        message: "Bạn có chắc muốn xóa sản phẩm này?",
        type: "warning",
        showCancel: true,
        onOk: async () => {
            try {
                await fetch(
                    `${API_CART}/items/${productId}?size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );
                getCart();
            } catch(err){
                console.error(err);
            }
        }
    });
}
// Payment
window.goToPaying = function(){
    const token = checkAuth();
    if(!token) return;

    if(document.getElementById("cartCount").innerText === "0"){
        showMessage({
            title: "Giỏ hàng trống",
            message: "Bạn chưa có sản phẩm nào",
            type: "warning"
        });
        return;
    }

    window.location.href = "../paying.html";
}