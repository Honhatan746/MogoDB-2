fetch( "https://kid-clothes-store.onrender.com/api/v1/products")
.then(response => response.json())
.then(data => {
    const products = data.result;
    const container = document.getElementById("showcaselist");

    const sortedProducts  = products.sort((a,b) => b.price - a.price);
    const top8 = sortedProducts.slice(0, 8);

    var cart = '';
    
    top8.forEach(product => {
        cart += `
             <a href="../productDetail.html?id=${product.id}" class="cart swiper-slide mr-10-30 max-width-cart-swiper">
                <div class="frame_img">
                    <img src="${product.images[0]}" class="img-cls">
                </div>
                <div class="cart_text">
                    <h3>${product.name}</h3>
                    <h3 class="heading-pink">
                        ${product.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND"
                        })}
                    </h3>
                     <div class="frame_img cart-color">
                        <img class="img-cls" src="${product.images[1] || product.images[0]}">
                    </div>
                </div>
            </a>
        `
    })
    if(top8.length === 0){
        container.innerHTML = "<p>Không có sản phẩm showcase</p>";
    } else {
        container.innerHTML = cart;
    }
    })