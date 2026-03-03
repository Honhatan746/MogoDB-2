// Fetch data for girlfashion 
fetch("../data/girlFashion.json")
.then(response => response.json())
.then(girlProducts => {
    
    const girlContainer = document.getElementById("girlfashlist");

    var cart ='';
    
    girlProducts.forEach(girlProduct => {
        cart +=`
            <a href="../productDetail.html?id=${girlProduct.productID}" class="cart swiper-slide mr-10-30 max-width-cart-swiper">
                <div class="frame_img"> <img src="${girlProduct.variants[0].image[0]}" alt="image" class="img-cls"></div>
                <div class="cart_text">
                    <h3>${girlProduct.name}</h3>
                    <h3 class="heading-pink">${girlProduct.variants[0].item[0].price.toLocaleString("vi-VN",{style: "currency",currency: "VND"})}</h3>    
                    <div class="frame_img cart-color"><img class="img-cls" src="${girlProduct.variants[0].image[1]}"></div>       
                    </div>
            </a>  
        ` 
    })
    girlContainer.innerHTML = cart;


})
// Fetch data for boy fashion
fetch("../data/boyFashion.json")
.then(response => response.json())
.then(boyProducts => {
    
    const boyContainer = document.getElementById("boyfashlist");

    var cart ='';
    
    boyProducts.forEach(boyProduct => {
        cart +=`
            <a href="../productDetail.html?id=${boyProduct.productID}" class="cart swiper-slide mr-10-30 max-width-cart-swiper">
                <div class="frame_img"> <img src="${boyProduct.variants[0].image[0]}" alt="image" class="img-cls"></div>
                <div class="cart_text">
                    <h3>${boyProduct.name}</h3>
                    <h3 class="heading-pink">${boyProduct.variants[0].item[0].price.toLocaleString("vi-VN",{style: "currency",currency: "VND"})}</h3>    
                    <div class="frame_img cart-color"><img class="img-cls" src="${boyProduct.variants[0].image[1]}"></div>       
                    </div>
            </a> 
        ` 
    })
    boyContainer.innerHTML = cart;


})

//Fetch data for accessories fashion
fetch("../data/Accessories.json")
.then(response => response.json())
.then(accessProducts => {
    
    const accessContainer = document.getElementById("accessfashlist");

    var cart ='';
    
    accessProducts.forEach(accessProduct => {
        cart +=`
            <a href="../productDetail.html?id=${accessProduct.productID}" class="cart swiper-slide mr-10-30 max-width-cart-swiper">
                <div class="frame_img"> <img src="${accessProduct.variants[0].image[0]}" alt="image" class="img-cls"></div>
                <div class="cart_text">
                    <h3>${accessProduct.name}</h3>
                    <h3 class="heading-pink">${accessProduct.variants[0].item[0].price.toLocaleString("vi-VN",{style: "currency",currency: "VND"})}</h3>    
                    <div class="frame_img cart-color"><img class="img-cls" src="${accessProduct.variants[0].image[1]}"></div>       
                    </div>
            </a>  
        ` 
    })
    accessContainer.innerHTML = cart;


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