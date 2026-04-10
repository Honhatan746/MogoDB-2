const API_PRODUCT = "https://kid-clothes-store.onrender.com/api/v1/products";
const API_CATEGORY = "https://kid-clothes-store.onrender.com/api/v1/categories";

function checkAuth(){
    const token = localStorage.getItem("token");

    if(!token){
        showMessage({
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để tiếp tục",
            type: "warning",
            onOk: () => window.location.href = "../login.html"
        });
        return null;
    }

    return token;
}

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let imageArray = []; // 🔥 lưu danh sách ảnh

// ================= LOAD CATEGORY =================
async function loadCategories(selectedId){
    const token = checkAuth();
    if(!token) return;

    try {
        const res = await fetch(API_CATEGORY, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        const select = document.getElementById("category");

        select.innerHTML = `<option value="">-- Select Category --</option>`;

        data.result.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;

            if(cat.id == selectedId){
                option.selected = true;
            }

            select.appendChild(option);
        });

    } catch (err){
        console.error(err);
        showMessage({
            title: "Lỗi",
            message: "Không load được danh mục",
            type: "error"
        });
    }
}
// ================= LOAD PRODUCT =================
let variantsData = [];
async function loadProduct(){
    try {
        const res = await fetch(`${API_PRODUCT}/${productId}`);
        const data = await res.json();

        if(!data.result){
            showMessage({
                title: "Lỗi",
                message: "Không tìm thấy sản phẩm",
                type: "error"
            });
            return;
        }

        const p = data.result;

        document.getElementById("idInput").value = p.id;
        document.getElementById("productId").value = p.id;
        document.getElementById("name").value = p.name;
        document.getElementById("price").value = p.price;
        document.getElementById("description").value = p.description || "";

        variantsData = p.variants || [];

        imageArray = [...p.images];
        document.getElementById("images").value = imageArray.join(", ");

        renderPreview();

        await loadCategories(p.categoryId);

    } catch (err){
        console.error(err);
        showMessage({
            title: "Lỗi",
            message: "Không load được sản phẩm",
            type: "error"
        });
    }
}

// ================= RENDER PREVIEW =================
function renderPreview(){
        const preview = document.getElementById("preview");
        preview.innerHTML = "";

        imageArray.forEach((url, index) => {
           const col = document.createElement("div");
    // Responsive: 2 cột (mobile), 3 cột (tablet), 4 cột (desktop)
    col.className = "col-6 col-sm-4 col-lg-3 mb-3 col-preview";

    col.innerHTML = `
        <div class="card shadow-sm border-0 position-relative overflow-hidden" style="border-radius: 10px;">
            
            <button 
                type="button"
                class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 remove-btn shadow"
                onclick="removeImage(${index})"
                style="z-index:10; border-radius:50%; width:26px; height:26px; line-height:26px; padding:0; border: 2px solid white;">
                <i class="ti-close"></i>
            </button>

            <div style="width: 100%; padding-top: 100%; position: relative; background: #eee;">
                <img 
                    src="${url}" 
                    alt="Product Image"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                    onerror="this.src='https://via.placeholder.com/150?text=Error'">
            </div>
        </div>
    `;

        // 🔥 XÓA ẢNH
        col.querySelector(".remove-btn").addEventListener("click", () => {
            imageArray.splice(index, 1);

            document.getElementById("images").value = imageArray.join(", ");
            renderPreview();
        });

        preview.appendChild(col);
    });
}

// ================= INPUT IMAGE =================
document.getElementById("images").addEventListener("input", function(){
    imageArray = this.value
        .split(",")
        .map(i => i.trim())
        .filter(i => i !== "");

    renderPreview();
});

// ================= UPDATE PRODUCT =================
document.getElementById("editForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const token = checkAuth();
    if(!token) return;

    const id = document.getElementById("productId").value;
    const name = document.getElementById("name").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const categoryId = document.getElementById("category").value;
    const description = document.getElementById("description").value.trim();

    // 🔥 VALIDATE
    if(!name || !price || !categoryId){
        showMessage({
            title: "Thiếu dữ liệu",
            message: "Vui lòng nhập đầy đủ thông tin",
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
        variants: variantsData
    };

    // 🔥 CONFIRM UPDATE
    showMessage({
        title: "Xác nhận",
        message: "Bạn có chắc muốn cập nhật sản phẩm?",
        type: "warning",
        showCancel: true,

        onOk: async () => {
            try {
                const res = await fetch(`${API_PRODUCT}/${id}`, {
                    method: "PUT",
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
                        message: "Cập nhật sản phẩm thành công!",
                        type: "success",
                        onOk: () => {
                            window.location.href = "../productList.html";
                        }
                    });
                }else{
                    showMessage({
                        title: "Thất bại",
                        message: data.message || "Cập nhật thất bại",
                        type: "error"
                    });
                }

            } catch(err){
                console.error(err);
                showMessage({
                    title: "Server lỗi",
                    message: "Không thể kết nối server",
                    type: "error"
                });
            }
        }
    });
});

// INIT
loadProduct();