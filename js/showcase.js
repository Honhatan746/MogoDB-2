// 1. Hàm tạo URL Trending với thời gian tự động
function getTrendingUrl(limit) {
    const now = new Date();
    
    // Tạo mốc bắt đầu: Ngày 1 tháng 1 của năm hiện tại
    const startOfYear = `${now.getFullYear()}-01-01T00:00:00`;
    
    // Tạo mốc kết thúc: Thời điểm hiện tại (định dạng ISO nhưng lấy đến giây)
    // Chuyển về định dạng YYYY-MM-DDTHH:mm:ss bằng cách cắt chuỗi ISO
    const endOfNow = now.toISOString().split('.')[0]; 

    const baseUrl = "https://kid-clothes-store.onrender.com/api/v1/products/trending";
    return `${baseUrl}?startDate=${startOfYear}&endDate=${endOfNow}&limit=${limit}`;
}

// 2. Gọi API
const trendingUrl = getTrendingUrl(8);

fetch(trendingUrl)
    .then(response => response.json())
    .then(data => {
        const products = data.result || [];
        const container = document.getElementById("showcaselist");

        if (!container) return;

        let cartHTML = '';

        function getProductLink(productId) {
            const role = localStorage.getItem("role");
            return role === "STAFF" 
                ? `../editProduct.html?id=${productId}` 
                : `../productDetail.html?id=${productId}`;
        }

        products.forEach(product => {
            const productLink = getProductLink(product.id);
            cartHTML += `
                 <a href="${productLink}" class="cart swiper-slide mr-10-30 max-width-cart-swiper">
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
            `;
        });

        if (products.length === 0) {
            container.innerHTML = "<p>Không có sản phẩm bán chạy trong năm nay</p>";
        } else {
            container.innerHTML = cartHTML;
        }
    })
    .catch(error => {
        console.error("Lỗi lấy sản phẩm trending:", error);
    });