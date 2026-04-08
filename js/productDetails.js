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

function productDetail(products){
    let currentVariant = null;

    const params = new URLSearchParams(window.location.search);
    const productID  = params.get("id");

    const product = products.find(p => p.id === productID);
    if (!product) return;

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
    let sizeHTML = "";

    product.variants.forEach((v, index) => {
        sizeHTML += `
            <div class="btncss" onclick="selectSize(${index})">
                ${v.size}
            </div>
        `;
    });
    sizeBox.innerHTML = sizeHTML;

    // COLOR (simple text hoặc button)
    const colorBox = document.getElementById("productDTcolor");
    let colorHTML = "";

    product.variants.forEach((v, index) => {
        colorHTML += `
            <div class="btncss colorBtn" onclick="selectColor(${index})">
                ${v.color}
            </div>
        `;
    });
    colorBox.innerHTML = colorHTML;

    // DESCRIPTION
    document.getElementById("productDTDescription").innerText =
        product.description;

    // SELECT SIZE
    window.selectSize = function(index){
    const sizeBtns = document.querySelectorAll("#prodcutDTSize .btncss");

    sizeBtns.forEach(btn => btn.classList.remove("activecss"));
    sizeBtns[index].classList.add("activecss");

    selectedSize = sizeBtns[index].innerText;

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
    window.selectColor = function(index){
    const colorBtns = document.querySelectorAll("#productDTcolor .btncss");

    colorBtns.forEach(btn => btn.classList.remove("activecss"));
    colorBtns[index].classList.add("activecss");

    selectedColor = colorBtns[index].innerText;

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
    const productID = document.getElementById("prodcutDTID").innerText;
    const sizeBtn = document.querySelector("#prodcutDTSize .activecss");
    const size = sizeBtn ? sizeBtn.innerText : null;
    const color = selectedColor;
    const quantity = parseInt(inputQuan.value) || 1;

    addToCart(productID, size, color, quantity);
});



