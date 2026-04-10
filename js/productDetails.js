import { addToCart } from "./cart.js";
    let selectedSize = null;
    let selectedColor = null;

//JavaScript Thumbail
window.changeImage  = function (img){
    const mainImg = document.getElementById("mainImg");
    const newSrc = img.src;

    if(mainImg.src === newSrc) return;

    mainImg.classList.add("fade-out");

    setTimeout(() => {
        mainImg.src = newSrc;

        mainImg.onload = () =>{
            mainImg.classList.remove("fade-out");
        }
    }, 300);
}
//Quantity
const inputQuan = document.getElementById("quantity");
window.subtract = function (){
    let value = parseInt(inputQuan.value);
    if(value > 1) inputQuan.value = value - 1;
}
window.add = function (){
    let value = parseInt(inputQuan.value);
    inputQuan.value = value + 1;
}

//
const API_PRODUCT = "https://kid-clothes-store.onrender.com/api/v1/products";

fetch(API_PRODUCT)
.then(res => res.json())
.then(data => {
    const products = data.result;
    productDetail(products);
});
let currentProduct = null;
function productDetail(products){
    let currentVariant = null;

    const params = new URLSearchParams(window.location.search);
    const productID  = params.get("id");

    const product = products.find(p => p.id === productID);
    currentProduct = product;
    if (!product){
            showMessage({
                title: "Lỗi",
                message: "Không tìm thấy sản phẩm",
                type: "error"
            });
            return;
        }

    // set default variant
    currentVariant = product.variants[0];
    window.currentColor = currentVariant.color;

    // NAME + ID
    document.getElementById("prodcutDTName").innerText = product.name;
    document.getElementById("prodcutDTID").innerText = product.id;

    // MAIN IMAGE
    document.getElementById("prodcutDTMainImg").innerHTML = `
        <img id="mainImg" class="height-auto img-cls" src="${product.images[0]}" />
    `;

    // THUMBNAIL
    let thumbail = "";
    product.images.forEach(img => {
        thumbail += `
            <div class="product-dt_list_img">
                <img class="img-cls" onclick="changeImage(this)" src="${img}">
            </div>
        `;
    });
    document.getElementById("productDTList").innerHTML = thumbail;

    // PRICE
    document.getElementById("productDTPrice").innerText =
        product.price.toLocaleString("vi-VN") + "đ";

    // SIZE (từ variants)
    const sizeBox = document.getElementById("prodcutDTSize");
    const uniqueSizes = [...new Set(product.variants.map(v => v.size))];
    let sizeHTML = "";
    uniqueSizes.forEach((size, index) => {
        sizeHTML += `
            <div class="btncss sizeBtn" onclick="selectSize(this, '${size}')">
                ${size}
            </div>
        `;
    });
    sizeBox.innerHTML = sizeHTML;

    // COLOR (simple text hoặc button)
    // COLOR (Lọc duy nhất)
    const colorBox = document.getElementById("productDTcolor");
    // Tạo mảng chỉ chứa các màu không trùng lặp
    const uniqueColors = [...new Set(product.variants.map(v => v.color))];

    let colorHTML = "";
    uniqueColors.forEach((color, index) => {
        colorHTML += `
            <div class="btncss colorBtn" onclick="selectColor(this, '${color}')">
                ${color}
            </div>
        `;
    });
    colorBox.innerHTML = colorHTML;

    // DESCRIPTION
    document.getElementById("productDTDescription").innerText =
        product.description;

    // SELECT SIZE
    window.selectSize = function(element, sizeValue) {
    const sizeBtns = document.querySelectorAll("#prodcutDTSize .btncss");
    sizeBtns.forEach(btn => btn.classList.remove("activecss"));
    
    element.classList.add("activecss");
    selectedSize = sizeValue; // Gán trực tiếp giá trị size

    checkSelection();
}
    // HANDLE BTN BUY

    function checkSelection(){
    const btnReads = document.querySelectorAll(".btn-read");
    const btnBuys = document.querySelectorAll(".btn-mua");

    if(selectedSize && selectedColor){
        // 👉 Đã chọn đủ
        btnReads.forEach(btn => btn.style.display = "none");
        btnBuys.forEach(btn => btn.style.display = "inline-block");
    } else {
        // 👉 Chưa chọn đủ
        btnReads.forEach(btn => btn.style.display = "inline-block");
        btnBuys.forEach(btn => btn.style.display = "none");
    }
}

    // SELECT COLOR
    window.selectColor = function(element, colorValue) {
        const colorBtns = document.querySelectorAll("#productDTcolor .btncss");
        colorBtns.forEach(btn => btn.classList.remove("activecss"));
        
        element.classList.add("activecss");
        selectedColor = colorValue; // Gán trực tiếp giá trị màu

        checkSelection();
    }
console.log(product.categoryId);
// tableSize
        const tableDTSize = document.getElementById("tableDTSize");
        var table = "";
        if(product.categoryId === "69c60f68556d421a9dfbcdd6" || product.categoryId === "69c4ecf1911ef2eebc32d6b0"){
            table += `<h1 class="bo-bot upcass home-heading">Bảng Size cho bé</h1>
                <div class="table-wrapper">
                    <table class="table-dt-size wid-100 font-title">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Chiều cao</th>
                                <th>Cân nặng</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>S</td>
                                <td>60cm - 102cm</td>
                                <td>8kg - 15kg</td>
                            </tr>
                            <tr>
                                <td>M</td>
                                <td>120cm - 130cm</td>
                                <td>20kg - 29kg</td>
                            </tr>
                            <tr>
                                <td>L</td>
                                <td>110cm - 116cm</td>
                                <td>16kg - 23kg</td>
                            </tr>
                            <tr>
                                <td>XL</td>
                                <td>140cm - 150cm</td>
                                <td>28kg - 40kg</td>
                            </tr>
                        </tbody>
                    </table>
                </div>`;
                tableDTSize.innerHTML = table;
        }
}

const btnAdd = document.getElementById("addtoCart");

btnAdd.addEventListener("click", function () {
    const token = localStorage.getItem("token");

    if(!token){
        showMessage({
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để thêm vào giỏ hàng",
            type: "warning",
            onOk: () => window.location.href = "../login.html"
        });
        return;
    }

    const productID = document.getElementById("prodcutDTID").innerText;
    const sizeBtn = document.querySelector("#prodcutDTSize .activecss");
    const size = sizeBtn ? sizeBtn.innerText : null;
    const color = selectedColor;
    const quantity = parseInt(inputQuan.value) || 1;

    if (!isStockAvailable(quantity)) return;

    addToCart(productID, size, color, quantity);
    showMessage({
        title: "Thành công",
        message: "Đã thêm vào giỏ hàng",
        type: "success"
    });
});

const buyNowBtn = document.getElementById("buyNow");
if(buyNowBtn) {
    buyNowBtn.addEventListener("click", handleBuyNow);
}

async function handleBuyNow() {
    const token = localStorage.getItem("token");

    if (!token) {
        showMessage({
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để mua hàng!",
            type: "warning",
            onOk: () => window.location.href = "../login.html"
        });
        return;
    }

    if (!selectedSize || !selectedColor) {
        showMessage({
            title: "Thiếu thông tin",
            message: "Vui lòng chọn đầy đủ size và màu!",
            type: "warning"
        });
        return;
    }
    
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    if (!isStockAvailable(quantity)) return;

    try {
        // Có thể thêm hiệu ứng chờ ở đây
        console.log("Đang xử lý luồng Mua ngay...");

        // BƯỚC A: Xóa sạch giỏ hàng hiện tại
        await fetch("https://kid-clothes-store.onrender.com/api/v1/cart", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        // BƯỚC B: Thêm sản phẩm này vào giỏ
        const resAdd = await fetch("https://kid-clothes-store.onrender.com/api/v1/cart/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: currentProduct.id,
                size: selectedSize.trim(),
                color: selectedColor.trim(),
                quantity: quantity
            })
        });

        const dataAdd = await resAdd.json();

        if (dataAdd.code === 1000) {
            // Xóa dữ liệu buyNow cũ (nếu có) để tránh xung đột logic
            localStorage.removeItem("buyNow"); 
            
            // 🚀 Chuyển sang trang thanh toán
            window.location.href = "../paying.html";
        } else {
            throw new Error(dataAdd.message || "Lỗi thêm vào giỏ");
        }

    } catch (error) {
        console.error("Lỗi:", error);
        showMessage({
            title: "Lỗi",
            message: "Không thể xử lý yêu cầu mua ngay lúc này",
            type: "error"
        });
    }
}
// Hàm kiểm tra tồn kho
function isStockAvailable(quantity) {
    // Tìm variant khớp với size và color đã chọn
    const variant = currentProduct.variants.find(v => 
        v.size === selectedSize && v.color === selectedColor
    );

    if (!variant) return false;

    if (quantity > variant.stock) {
        showMessage({
            title: "Hết hàng",
            message: `Sản phẩm này chỉ còn ${variant.stock} món trong kho.`,
            type: "warning"
        });
        return false;
    }
    return true;
}


