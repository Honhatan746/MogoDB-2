    const API_PRODUCT = "https://kid-clothes-store.onrender.com/api/v1/products";
    const API_CATEGORY = "https://kid-clothes-store.onrender.com/api/v1/categories";

    // Load categories
    async function loadCategories() {
    const token = localStorage.getItem("token"); 

    const res = await fetch(API_CATEGORY, {
        headers: {
        "Authorization": `Bearer ${token}` 
        }
    });

    const data = await res.json();

    console.log("CATEGORY DATA:", data);

    const select = document.getElementById("categoryID");

    if (!data.result) {
        alert("Không load được category");
        return;
    }

    data.result.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
    }

    const imageInput = document.getElementById("imageUrls");
    const preview = document.getElementById("preview");
    const countSpan = document.getElementById("count");

    let imageArray = [];

// Khi nhập URL
imageInput.addEventListener("input", () => {
    const value = imageInput.value.trim();

    if (!value) {
        imageArray = [];
        renderPreview();
        return;
    }

    // Tách bằng dấu phẩy
    imageArray = value
        .split(",")
        .map(url => url.trim())
        .filter(url => url !== "");

    renderPreview();
});

// Render preview
function renderPreview() {
    preview.innerHTML = "";

    imageArray.forEach((url, index) => {
        const col = document.createElement("div");
        col.className = "col-md-3 mb-3";

        col.innerHTML = `
            <div class="card shadow-sm position-relative">
                
                <!-- Nút Xóa góc phải -->
                <button 
                    class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 remove-btn"
                    style="z-index: 10; border-radius: 50%; width: 28px; height: 28px; padding: 0;">
                    ✕
                </button>
                <img 
                    src="${url}" 
                    class="card-img-top" 
                    style="height:150px; object-fit:cover;"
                    onerror="this.src='https://via.placeholder.com/150?text=Error'">
            </div>
        `;

        // Xóa ảnh
        col.querySelector(".remove-btn").addEventListener("click", () => {
            imageArray.splice(index, 1);

            // Cập nhật lại input
            imageInput.value = imageArray.join(", ");

            renderPreview();
        });

        preview.appendChild(col);
    });

    countSpan.textContent = imageArray.length;
}
    loadCategories();

//Submit form
document.getElementById("productForm").addEventListener("submit", async function(e){
    e.preventDefault();

    document.getElementById("productForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const token = localStorage.getItem("token");

    const name = document.getElementById("nameProduct").value.trim();
    const price = parseFloat(document.getElementById("priceProduct").value);
    const categoryId = document.getElementById("categoryID").value;
    const description = document.getElementById("descriptionProduct").value.trim();

    const size = document.getElementById("size").value.trim();
    const color = document.getElementById("color").value.trim();
    const stock = parseInt(document.getElementById("stockProduct").value);

    // validate
    if(!name || !price || !categoryId){
        alert("Thiếu thông tin sản phẩm");
        return;
    }

    if(!size || !color){
        alert("Vui lòng nhập size và color");
        return;
    }

    if(imageArray.length === 0){
        alert("Vui lòng nhập ít nhất 1 ảnh");
        return;
    }

    const productData = {
        name,
        price,
        categoryId,
        description,
        images: imageArray, // ✅ dùng trực tiếp
        variants: [
            {
                size,
                color,
                stock
            }
        ]
    };

    console.log("DATA GỬI:", productData);

    try {
        const res = await fetch(API_PRODUCT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        const data = await res.json();
        console.log("RESPONSE:", data);

        if(data.code === 1000){
            alert("Thêm sản phẩm thành công!");
            window.location.href = "../productList.html";
        }else{
            alert(data.message || "Thêm thất bại");
        }

    } catch(err){
        console.error("Lỗi:", err);
        alert("Lỗi server");
    }
});
});