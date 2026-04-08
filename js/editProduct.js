const API_PRODUCT = "https://kid-clothes-store.onrender.com/api/v1/products";
const API_CATEGORY = "https://kid-clothes-store.onrender.com/api/v1/categories";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let imageArray = []; // 🔥 lưu danh sách ảnh

// ================= LOAD CATEGORY =================
async function loadCategories(selectedId){
    const token = localStorage.getItem("token");

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
}

// ================= LOAD PRODUCT =================
let variantsData = [];
async function loadProduct(){
    const res = await fetch(`${API_PRODUCT}/${productId}`);
    const data = await res.json();

    const p = data.result;

    document.getElementById("idInput").value = p.id;
    document.getElementById("productId").value = p.id;
    document.getElementById("name").value = p.name;
    document.getElementById("price").value = p.price;
    document.getElementById("description").value = p.description || "";

    variantsData =  p.variants || [];

    // 🔥 set image array
    imageArray = [...p.images];
    document.getElementById("images").value = imageArray.join(", ");

    renderPreview();

    await loadCategories(p.categoryId);
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

    const token = localStorage.getItem("token");

    const id = document.getElementById("productId").value;
    const name = document.getElementById("name").value;
    const price = parseFloat(document.getElementById("price").value);
    const categoryId = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    if(imageArray.length === 0){
        alert("Vui lòng nhập ít nhất 1 ảnh");
        return;
    }

    const productData = {
        name,
        price,
        categoryId,
        description,
        images: imageArray, // 🔥 dùng trực tiếp
        variants: variantsData
    };

    console.log("DATA UPDATE:", productData);

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
            alert("Cập nhật thành công!");
            window.location.href = "productList.html";
        }else{
            alert(data.message || "Cập nhật thất bại");
        }

    } catch(err){
        console.error(err);
        alert("Lỗi server");
    }
});

// INIT
loadProduct();