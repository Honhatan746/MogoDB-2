const API_PRODUCT = "https://kid-clothes-store.onrender.com/api/v1/products";
const API_CATEGORY = "https://kid-clothes-store.onrender.com/api/v1/categories";

// kiểm tra xem có đang đăng nhập không nếu không thì thông báo và thoát ra
function checkAuth(){
    const token = localStorage.getItem("token");

    if(!token){
        showMessage({
            title: "Chưa đăng nhập",
            message: "Bạn cần đăng nhập để sử dụng chức năng này",
            type: "warning",
            onOk: () => {
                window.location.href = "../login.html";
            }
        });
        return null;
    }
    return token;
}
checkAuth();
// LOAD CATEGORY
async function loadCategories() {
    const token = checkAuth();
    if(!token) return;

    try {
        const res = await fetch(API_CATEGORY, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        const select = document.getElementById("categoryID");

        if (!data.result) {
            showMessage({
                title: "Lỗi",
                message: "Không load được danh mục",
                type: "error"
            });
            return;
        }

        data.result.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });

    } catch (err) {
        console.error(err);
        showMessage({
            title: "Lỗi",
            message: "Lỗi server khi load category",
            type: "error"
        });
    }
}

// =======================
// IMAGE PREVIEW
// =======================
const imageInput = document.getElementById("imageUrls");
const preview = document.getElementById("preview");
const countSpan = document.getElementById("count");

let imageArray = [];

if(imageInput){
    imageInput.addEventListener("input", () => {
        const value = imageInput.value.trim();

        if (!value) {
            imageArray = [];
            renderPreview();
            return;
        }

        imageArray = value
            .split(",")
            .map(url => url.trim())
            .filter(url => url !== "");

        renderPreview();
    });
}

function renderPreview() {
    preview.innerHTML = "";

    imageArray.forEach((url, index) => {
        const col = document.createElement("div");
        col.className = "col-6 col-md-3 mb-4"; 

        col.innerHTML = `
    <div class="preview-card-v2 shadow-sm" style="position: relative; overflow: visible;">
        <button type="button" class="btn-remove-v2 remove-btn" 
                style="position: absolute; top: -10px; right: -10px; z-index: 10;" 
                title="Xóa ảnh">
            ✕
        </button>
        
        <div class="preview-image-wrapper" style="border-radius: 1.5rem; overflow: hidden;">
            <img src="${url}" 
                 class="img-fluid" 
                 style="width: 100%; height: 100%; object-fit: cover;"
                 onerror="this.src='https://placehold.co/300x300?text=Invalid+Image'">
        </div>
        
        <div class="preview-info">
            <span>Ảnh ${index + 1}</span>
        </div>
    </div>
`;

        col.querySelector(".remove-btn").addEventListener("click", () => {
            imageArray.splice(index, 1);
            imageInput.value = imageArray.join(", ");
            renderPreview();
        });

        preview.appendChild(col);
    });

    countSpan.textContent = imageArray.length;
}
// =======================
// SUBMIT FORM
// =======================
const form = document.getElementById("productForm");

if(form){
    form.addEventListener("submit", async function(e){
        e.preventDefault();

        const token = checkAuth();
        if(!token) return;

        const name = document.getElementById("nameProduct").value.trim();
        const price = parseFloat(document.getElementById("priceProduct").value);
        const categoryId = document.getElementById("categoryID").value;
        const description = document.getElementById("descriptionProduct").value.trim();
        const size = document.getElementById("size").value.trim();
        const color = document.getElementById("color").value.trim();
        const stock = parseInt(document.getElementById("stockProduct").value);

        // ===== VALIDATE =====
        if(!name || !price || !categoryId){
            showMessage({
                title: "Thiếu dữ liệu",
                message: "Vui lòng nhập đầy đủ thông tin sản phẩm",
                type: "warning"
            });
            return;
        }

        if(!size || !color){
            showMessage({
                title: "Thiếu biến thể",
                message: "Vui lòng nhập size và màu sắc",
                type: "warning"
            });
            return;
        }

        if(imageArray.length === 0){
            showMessage({
                title: "Thiếu ảnh",
                message: "Vui lòng nhập ít nhất 1 ảnh",
                type: "warning"
            });
            return;
        }

        const productData = {
            name,
            price,
            categoryId,
            description,
            images: imageArray,
            variants: [
                { size, color, stock }
            ]
        };

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

            if(data.code === 1000){
                showMessage({
                    title: "Thành công",
                    message: "Thêm sản phẩm thành công",
                    type: "success",
                    onOk: () => {
                        window.location.href = "../productList.html";
                    }
                });
            }else{
                showMessage({
                    title: "Thất bại",
                    message: data.message || "Không thể thêm sản phẩm",
                    type: "error"
                });
            }

        } catch(err){
            console.error(err);
            showMessage({
                title: "Lỗi",
                message: "Lỗi server",
                type: "error"
            });
        }
    });
}

// =======================
loadCategories();