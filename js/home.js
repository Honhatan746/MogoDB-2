const API_PRODUCT = "https://kid-clothes-store.onrender.com/api/v1/products";
// ID category áo bé gái
const GIRL_CATEGORY_ID = "69c60f68556d421a9dfbcdd6";
const BOY_CATEGORY_Id = "69c4ecf1911ef2eebc32d6b0"
const ACCESSORIES_CATEGORY_ID = "69c60f83556d421a9dfbcdd7";

function getProductLink(productId){
    const role = localStorage.getItem("role");
    if(role === "STAFF") return `../editProduct.html?id=${productId}`;
    else return `../productDetail.html?id=${productId}`;
}
fetch(API_PRODUCT)
.then(res => res.json())
.then(data => {

    const products = data.result; 
    const girlContainer = document.getElementById("girlfashlist");

    let cart = '';

    // Loc Nhung san pham do nu
    const girlProducts = products.filter(p => 
        p.categoryId === GIRL_CATEGORY_ID
    );

    girlProducts.forEach(p => {
        const productLink = getProductLink(p.id);
        cart += `
            <a href="${productLink}" class="cart swiper-slide mr-10-30 max-width-cart-swiper">
                <div class="frame_img">
                    <img src="${p.images[0]}" class="img-cls">
                </div>
                <div class="cart_text">
                    <h3>${p.name}</h3>
                    <h3 class="heading-pink">
                        ${p.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND"
                        })}
                    </h3>
                     <div class="frame_img cart-color">
                        <img class="img-cls" src="${p.images[1] || p.images[0]}">
                    </div>
                </div>
            </a>
        `;
    });
    if(girlProducts.length === 0){
        girlContainer.innerHTML = "<p>Không có sản phẩm áo bé gái</p>";
    } else {
        girlContainer.innerHTML = cart;
    }
});
// Fetch data for boy fashion
fetch(API_PRODUCT)
.then(response => response.json())
.then(data => {
    const products = data.result;
    const boyContainer = document.getElementById("boyfashlist");

    let cart ='';
    const boyProducts = products.filter(p=> 
        p.categoryId === BOY_CATEGORY_Id
    );

    boyProducts.forEach(boyProduct => {
        const productLink = getProductLink(boyProduct.id);

        cart +=`
            <a href="${productLink}" class="cart swiper-slide mr-10-30 max-width-cart-swiper">
                <div class="frame_img">
                    <img src="${boyProduct.images[0]}" class="img-cls">
                </div>
                <div class="cart_text">
                    <h3>${boyProduct.name}</h3>
                    <h3 class="heading-pink">
                        ${boyProduct.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND"
                        })}
                    </h3>
                     <div class="frame_img cart-color">
                        <img class="img-cls" src="${boyProduct.images[1] || boyProduct.images[0]}">
                    </div>
                </div>
            </a>
        ` 
    })
    if(boyProducts.length === 0){
        boyContainer.innerHTML = "<p>Không có sản phẩm áo bé trái</p>";
    }else{
        boyContainer.innerHTML = cart;
    }


})

//Fetch data for accessories fashion
fetch(API_PRODUCT)
.then(response => response.json())
.then(data => {
    
    const products = data.result;
    const accessContainer = document.getElementById("accessfashlist");

    let cart ='';
    const accessProducts = products.filter(p => 
        p.categoryId === ACCESSORIES_CATEGORY_ID
    );
    accessProducts.forEach(accessProduct => {
        const productLink = getProductLink(accessProduct.id);
        cart +=`
            <a href="${productLink}" class="cart swiper-slide mr-10-30 max-width-cart-swiper">
                <div class="frame_img">
                    <img src="${accessProduct.images[0]}" class="img-cls">
                </div>
                <div class="cart_text">
                    <h3>${accessProduct.name}</h3>
                    <h3 class="heading-pink">
                        ${accessProduct.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND"
                        })}
                    </h3>
                     <div class="frame_img cart-color">
                        <img class="img-cls" src="${accessProduct.images[1] || accessProduct.images[0]}">
                    </div>
                </div>
            </a>
        ` 
    })
    if(accessProducts.length === 0){
        accessContainer.innerHTML ="<p>Không có sản phẩm phụ kiện</p>";
    }else{
        accessContainer.innerHTML = cart;
    }


})
// Swiper
    const swipers = document.querySelectorAll('.swiper'); //return a lot of elements : NodeList
    swipers.forEach(swiper => {
        const wraper = swiper.querySelector('.swiper-wrapper');
        const btnPre = swiper.querySelector('.swiper-button-prev');
        const btnNext = swiper.querySelector('.swiper-button-next');

        btnPre.addEventListener('click', ()=>{
            wraper.scrollLeft -= 300;
        });
        btnNext.addEventListener('click', ()=>{
            wraper.scrollLeft += 300;
        });
    });
// End Swiper
// Slide
    document.addEventListener('DOMContentLoaded', () => {
        const swiper = document.querySelector('.swiper-wrapper');
        const slides = swiper.querySelectorAll('.swiper-slide');
        
        let index = 0;
        const total = slides.length;
        const delay = 3000;
        
        setInterval(() => {
            index++;
            
            if (index >= total) {
                index = 0;
            }
            
            swiper.scrollTo({
                left: index * swiper.clientWidth,
                behavior: 'smooth'
            });
        }, delay);
    });
// End Slide