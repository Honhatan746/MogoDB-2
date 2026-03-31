import { addToCart } from "./cart.js";

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
const dataFile = [
    "../data/girlFashion.json",
    "../data/boyFashion.json",
    "../data/Accessories.json",
    "../data/showcase.json"
]

Promise.all(
    dataFile.map(file => fetch(file).then(res => res.json()))
).then(allData => {
    const products  = allData.flat();

    productDetail(products);
})
//show data
function productDetail(products){
    var currentVariant = null;
    var currentItem = null;

    const params = new URLSearchParams(window.location.search);
    const productID  = params.get("id");

        const product = products.find(p => p.productID === productID);
        if (!product) {
            return;
        }
        
        const variant = product.variants[0];
        currentVariant = variant;
        currentItem = variant.item[0];
        window.currentColor = currentVariant.color;
        
        document.getElementById("prodcutDTName").innerText = product.name;  // ten ban dau 
        document.getElementById("prodcutDTID").innerText = product.productID; // list anh ban dau khi chua nhan color
        
        let  thumbail = "";
        const list = document.getElementById("productDTList");
            product.variants[0].image.forEach(img => {
                thumbail += `
                    <div class="product-dt_list_img" >
                    <img class="img-cls" onclick="changeImage(this)" 
                    src="${img}"
                    alt=""></div>
                `;
            })
        list.innerHTML = thumbail;

        const sizeSection = document.getElementById("sizeSection");
        const sizeTable = document.getElementById("tableDTSize");
        const boxSize = document.getElementById("prodcutDTSize");
        const btnReads = document.querySelectorAll(".btn-read");
        const btnBuys = document.querySelectorAll(".btn-mua");
        let sizeFirst = "";

        product.variants[0].item.forEach((itemChild, index) => {
                if(currentVariant.item.length < 2 && !currentVariant.item[0].size){
                sizeSection.style.display = "none";
                sizeTable.style.display = "none";
                btnReads.forEach(btnRead => {
                    btnRead.style.display = "none";
                })
                btnBuys.forEach(btnBuy => {
                    btnBuy.style.display = "block";
                })
                return;
            }
            sizeTable.style.display = "block";
            sizeTable.innerHTML = product.sizeTable;
            sizeSection.style.display = "flex";
                sizeFirst += `
                    <div class="btn" 
                    onclick="selectSize(${index})">${itemChild.size}</div>
                `
            })
        boxSize.innerHTML = sizeFirst;

        //lấy ảnh chính và giá 
        document.getElementById("prodcutDTMainImg").innerHTML = `<img id="mainImg" class="height-auto img-cls" src="${variant.image[0]}" alt="Image">`;
        document.getElementById("productDTPrice").innerText = variant.item[0].price.toLocaleString("vi-VN") + "đ";
        //danh sách màu sắc
        const colorContain = document.getElementById("productDTcolor");
        let colorImg = "";
        product.variants.forEach((variant, index) => {
            colorImg += `
                <img class="pointer heith-45 img-cls" src="${variant.image[0]}"
                onclick="selectColor(${index})"
                alt="${variant.color}">
            `
        });
        colorContain.innerHTML = colorImg;
//Hàm click màu sác đổi ảnh và đổi giá, mã, size
        window.selectColor = function(index){ //Vì onclick trong type module do dùng innerHTML nên phải đưa ra window mới onclick được
            currentVariant = product.variants[index];
            currentItem = currentVariant.item[0];
            window.currentColor = currentVariant.color;

            document.getElementById("prodcutDTMainImg").innerHTML = `
            <img id="mainImg" class="height-auto img-cls" src="${currentVariant.image[0]}" alt="">
            `;
            let  thumbail = "";
            currentVariant.image.forEach(img => {
                thumbail += `
                    <div class="product-dt_list_img" >
                    <img class="img-cls" onclick="changeImage(this)" 
                    src="${img}"
                    alt=""></div>
                `;
            })
            list.innerHTML = thumbail;

        document.getElementById("productDTPrice").innerText = currentItem.price.toLocaleString("vi-VN") + "đ";


        document.getElementById("prodcutDTID").innerText = currentItem.sku;

        renderSizes();
        }
        //Hàm tạo size cho mỗi color
        
        function renderSizes(){

            if(currentVariant.item.length < 2 && !currentVariant.item[0].size){
                sizeSection.style.display = "none";
                btnReads.forEach(btnRead => {
                    btnRead.style.display = "none";
                })
                btnBuys.forEach(btnBuy => {
                    btnBuy.style.display = "block";
                })
                return;
            }
            sizeSection.style.display = "flex";
            let sizeBtn = "";

            currentVariant.item.forEach((itemChild, index) => {
                const activeSize = currentItem && currentItem.sku === itemChild.sku ? "active" : "";

                sizeBtn += `
                    <div class="btn ${activeSize}" id="sizeItem" 
                    onclick="selectSize(${index})">${itemChild.size}</div>
                `
            })
            boxSize.innerHTML = sizeBtn;
        }
        //Hàm chọn size
        window.selectSize = function(index){
            btnReads.forEach(btnRead => {
                btnRead.style.display = "none";
            })
            btnBuys.forEach(btnBuy => {
                btnBuy.style.display = "block";
            })
            currentItem = currentVariant.item[index];

            document.getElementById("productDTPrice").innerText = 
            currentItem.price.toLocaleString("vi-VN") + "đ";

            document.getElementById("prodcutDTID").innerText = currentItem.sku;

            renderSizes();
        }

        const description = document.getElementById("productDTDescription");
        description.innerHTML = product.descirption

}

const btnAdd = document.getElementById("addtoCart");

btnAdd.addEventListener("click", function () {
    const productID = document.getElementById("prodcutDTID").innerText;
    console.log(productID);
    const sizeBtn = document.querySelector("#prodcutDTSize .active");
    const size = sizeBtn ? sizeBtn.innerText : null;
    console.log(size);
    const color = window.currentColor;
    console.log(color);
    addToCart(productID, size, color, 1);
});



