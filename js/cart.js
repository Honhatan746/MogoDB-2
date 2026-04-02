const API_CART = "https://kid-clothes-store.onrender.com/api/v1/cart";
getCart();
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

        if(data.code === 1000){
            renderCart(data.result.items || []);
        }
    } catch(err){
        console.error("Lỗi load cart:", err);
    }
}

// ================= RENDER CART =================
function renderCart(items){
    const cartList = document.getElementById("cartList");
    const cartCount = document.getElementById("cartCount");
    const cartSubTotal = document.getElementById("cartSubTotal");
    const cartTotal = document.getElementById("cartTotal");

    cartList.innerHTML = "";

    if(items.length === 0){
        cartList.innerHTML = "<p>Giỏ hàng trống</p>";
        cartCount.innerText = 0;
        cartSubTotal.innerText = "0đ";
        cartTotal.innerText = "0đ";
        return;
    }

    let total = 0;

    items.forEach(item => {
        total += item.subTotal || 0;

        cartList.innerHTML += `
            <div class="cart-item di-flex bo-bot">
                
                <i class="ti-close pointer absolute font-w-700 font-title"
                   onclick="removeItem('${item.productId}', '${item.size}', '${item.color}')"></i>

                <div class="frame_img">
                    <img class="img-cls" src="${item.imageUrl}" alt="">
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
                            <button class="btn no-bor font-w-700"
                                onclick="decrease('${item.productId}', '${item.size}', '${item.color}', ${item.quantity})">–</button>

                            <input type="text" 
                                class="quantity-input no-bor font-w-700"
                                value="${item.quantity}" readonly>

                            <button class="btn no-bor font-w-700"
                                onclick="increase('${item.productId}', '${item.size}', '${item.color}', ${item.quantity})">+</button>
                        </div>
                    </div>

                    <p class="font-w-700 heading-pink font-price under-line absolute">
                        ${Number(item.subTotal || 0).toLocaleString("vi-VN")}đ
                    </p>  

                </div> 
            </div>
        `;
    });

    // cập nhật tổng
    cartCount.innerText = items.length;
    cartSubTotal.innerText = total.toLocaleString("vi-VN") + "đ";
    cartTotal.innerText = total.toLocaleString("vi-VN") + "đ";
}

// ================= ADD TO CART =================
let isAdding = false;

export async function addToCart(productId, size, color, quantity){
    const token = localStorage.getItem("token");

    if(!token){
        alert("Vui lòng đăng nhập");
        return;
    }

    if(!size || !color){
        alert("Vui lòng chọn size và màu");
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
            body: JSON.stringify({
                productId,
                size,
                color,
                quantity
            })
        });

        const data = await res.json();

        if(data.code === 1000){
            alert("Thêm vào giỏ hàng thành công");
            getCart();
        } else {
            alert(data.message || "Lỗi thêm giỏ hàng");
        }

    } catch(err){
        console.error(err);
        alert("Lỗi server");
    }

    isAdding = false;
}

// ================= UPDATE QUANTITY =================
window.increase = function(productId, size, color, quantity){
    updateQuantity(productId, size, color, quantity + 1);
}

window.decrease = function(productId, size, color, quantity){
    if(quantity <= 1) return;
    updateQuantity(productId, size, color, quantity - 1);
}

async function updateQuantity(productId, size, color, quantity){
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(
            `${API_CART}/items/${productId}?size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}&quantity=${quantity}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if(res.ok){
            getCart();
        } else {
            alert("Cập nhật thất bại");
        }

    } catch(err){
        console.error(err);
    }
}

// ================= REMOVE ITEM =================
window.removeItem = async function(productId, size, color){
    const token = localStorage.getItem("token");

    if(!confirm("Xóa sản phẩm khỏi giỏ hàng?")) return;

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
// Payment
window.goToPaying = function(){
    const token = localStorage.getItem("token");

    if(!token){
        alert("Vui lòng đăng nhập");
        return;
    }

    // kiểm tra cart có hàng không
    if(document.getElementById("cartCount").innerText == "0"){
        alert("Giỏ hàng trống");
        return;
    }

    window.location.href ="../paying.html";
}