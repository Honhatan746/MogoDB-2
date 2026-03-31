// Lấy giỏ hàng
 async function getCart(){
    const token = localStorage.getItem("token");

    const res = await fetch("https://kid-clothes-store.onrender.com/api/v1/cart", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await res.json();
    if(data.code === 1000){
        renderCart(data.result.items);
    }
 }
// Gender sản phẩm
 function renderCart(items){
    const cartList = document.getElementById("cartList");
    cartList.innerHTML = "";

    items.forEach(item => {
        cartList.innerHTML += `
            <div class="cart-item di-flex bo-bot">
                            <i class="ti-close absolute font-w-700 font-title" onclick="removeItem('${item.productId}', '${item.size}', '${item.color}')"></i>
                            <div class="frame_img"><img class="img-cls" src="${item.imageUrl}" alt=""></div>
                        <div class="di-flex flex-colum font-text cart-detail">
                            <p class=" font-w-700 font-price">${item.productName}</p>
                            <div class="di-flex g-1">
                                <p class=" font-w-100 font-text">${item.color},</p>
                                <p class=" font-w-100 font-text">${item.size}</p>
                            </div>
                            <div class="product-dt-quantity">
                                <p class="font-title mar-t-b">So Luong:</p>
                            <div>
                                <button class="btn no-bor font-w-700" onclick="decrease('${item.productId}', '${item.size}', '${item.color}', ${item.quantity})">–</button>
                                <input type="text" id="quantity" class="no-bor font-w-700" value="${item.quantity}" readonly>
                                <button class="btn no-bor font-w-700" onclick="increase('${item.productId}', '${item.size}', '${item.color}', ${item.quantity})">+</button>
                            </div>
                            </div>
                            <p class="font-w-700 heading-pink font-price under-line absolute">${item.subTotal}</p>  
                        </div> 
            </div>
        `
    });
 }

//  Thêm sản phẩm vào giỏ hàng
export async function addToCart(productId, size, color, quantity){
    const token = localStorage.getItem("token");
    if(!token){
        alert("Vui lòng đăng nhập");
        return;
    }
    console.log(typeof productId,  typeof size,  typeof color, typeof quantity);
    const res = await fetch("https://kid-clothes-store.onrender.com/api/v1/cart/items", {
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

    console.log("Request body:",
        JSON.stringify({
   productId, size, color, quantity}, null, 2));


    const data = await res.json();

    if(data.code === 1000){
        alert("Thêm vào giỏ hàng thành công");
        getCart();
    } else {
        alert(data.message);
    }
}
function increase(productId, size, color, quantity){
    updateQuantity(productId, size, color, quantity + 1);
}
function decrease(productId, size, color, quantity){
    if(quantity <= 1) return;
    updateQuantity(productId, size, color, quantity - 1);
}
async function updateQuantity(productId, size, color, quantity){
    const token = localStorage.getItem("token");

    await fetch(`https://kid-clothes-store.onrender.com/api/v1/cart/items/${productId}?size=${size}&color=${color}&quantity=${quantity}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    getCart(); 
}