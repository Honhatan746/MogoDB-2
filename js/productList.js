  const API_URL = "https://kid-clothes-store.onrender.com/api/v1/products";
  const API_CATEGORY = "https://kid-clothes-store.onrender.com/api/v1/categories";

  let categoryMap = {}; // map id → name

  // Load category trước
  async function loadCategories() {
    const token = localStorage.getItem("token");

    const res = await fetch(API_CATEGORY, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (Array.isArray(data.result)) {
      data.result.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });
    }
  }

  // Load product
  async function fetchProducts() {
    const res = await fetch(API_URL);
    const data = await res.json();

    const table = document.getElementById("productTable");
    table.innerHTML = "";

    if (!Array.isArray(data.result)) {
      alert("Lỗi load sản phẩm");
      return;
    }

    data.result.forEach((p, index) => {
      table.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${p.name}</td>
          <td>${p.price.toLocaleString()}đ</td>
          <td>${categoryMap[p.categoryId] || "N/A"}</td>
          <td>
            <a href="editProduct.html?id=${p.id}" class="btn btn-warning btn-sm font-title">Edit</a>
            <button class="btn btn-danger btn-sm font-title" onclick="deleteProduct('${p.id}')">Delete</button>
            <button class="btn btn-secondary btn-sm font-title" onclick="viewVariants('${p.id}')">Variants</button>
          </td>
        </tr>
      `;
    });
  }

  // Delete product
  async function deleteProduct(id) {
    if (!confirm("Are you sure to delete?")) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.code === 1000) {
      alert("Xóa thành công");
      fetchProducts();
    } else {
      alert(data.message || "Xóa thất bại");
    }
  }

  // chạy
  async function init() {
    await loadCategories(); // load trước
    await fetchProducts(); // rồi mới render
  }

  init();
  let variantModal = null;
  let currentProducts = [];
//   Handle variant
 async function viewVariants(productId){
    const modalTitle = document.querySelector(".modal-title");
    const res = await fetch(`${API_URL}/${productId}`);
    const data = await res.json();

    currentProducts = data.result;
    modalTitle.textContent = currentProducts.name;
    document.getElementById("variantProductId").value = productId;
    

    renderVariantTable(currentProducts.variants);
    if(!variantModal){
    variantModal = new bootstrap.Modal(document.getElementById("variantModal"));
    }
    variantModal.show();
}
function renderVariantTable(variants) {
    const table = document.getElementById("variantTable");
    let tableHtml = "";

    variants.forEach((variant, index) => {
        tableHtml += `
            <tr>
                <td style="min-width = 80px;">
                    <input type="text" class="form-control form-control-sm edit-size font-title border border-0 p-2 " 
                           value="${variant.size}" onchange="updateLocalVariant(${index}, 'size', this.value)">
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm edit-color font-title border border-0 p-2" 
                           value="${variant.color}" onchange="updateLocalVariant(${index}, 'color', this.value)">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm edit-stock font-title border border-0 p-2" 
                           value="${variant.stock}" onchange="updateLocalVariant(${index}, 'stock', this.value)">
                </td>
                <td class="text-center">
                    <button class="btn btnTrashVariant btn-sm font-title" onclick="deleteVariantLocal(${index})">
                        <i class="ti-trash"></i> <span class="d-none d-md-inline">Xóa</span>
                    </button>
                </td>
            </tr>
        `;
    });
    table.innerHTML = tableHtml;
}
// Cập nahajt lại giá trị vào mảng
function updateLocalVariant(index, field, value) {
    if (field === 'stock') {
        currentProducts.variants[index][field] = parseInt(value) || 0;
    } else {
        currentProducts.variants[index][field] = value;
    }
}

function deleteVariantLocal(index) {
    if (confirm("Bạn có chắc muốn xóa variant này không?")) {
        currentProducts.variants.splice(index, 1); // Xóa khỏi mảng tạm
        renderVariantTable(currentProducts.variants); // Vẽ lại bảng
    }
}
// add variant
async function addVariant(){
  const productId = document.getElementById("variantProductId").value;

  const size = document.getElementById("vSize").value;
  const color = document.getElementById("vColor").value;
  const stock = Number(document.getElementById("vStock").value);

  const res = await fetch(`${API_URL}/${productId}`);
  const data = await res.json();
  const product = data.result;

  //  check trùng
  const exists = product.variants.some(v => v.size === size && v.color === color);
  if(exists){
    alert("Variant đã tồn tại");
    return;
  }

  product.variants.push({ size, color, stock });

  await updateVariants(productId, product.variants);
}
// Save chỉnh sửa
async function saveAllChanges() {
    const productId = document.getElementById("variantProductId").value;
    const token = localStorage.getItem("token"); // Lấy token của STAFF

    if (!token) {
        alert("Vui lòng đăng nhập quyền STAFF!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(currentProducts)
        });

        const data = await res.json();

        if (data.code === 1000) {
            alert("Cập nhật thành công!");
            currentProducts = data.result;
        } else {
            alert("Lỗi: " + (data.message || "Không thể cập nhật"));
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Lỗi server, vui lòng thử lại sau!");
    }
}

// update lại 
async function updateVariants(productId, variants){
  const token = localStorage.getItem("token");

  //  lấy product hiện tại
  const res = await fetch(`${API_URL}/${productId}`);
  const data = await res.json();
  const product = data.result;

    console.log("SEND DATA:", {
        name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      description: product.description,
      images: product.images,
      variants: variants
    });

  //  gửi full data 
  const resUpdate = await fetch(`${API_URL}/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      description: product.description,
      images: product.images,
      variants: variants
    })
  });

  const result = await resUpdate.json();

  if(result.code === 1000){
    viewVariants(productId);
  } else {
    alert("Lỗi update");
  }
}

async function findProduct() {
    const inputId = document.getElementById("findProductId").value.trim();
    const table = document.getElementById("productTable");

    if (!inputId) {
        fetchProducts(); // Nếu để trống thì hiện lại tất cả
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${inputId}`);
        const data = await res.json();

        if (data.code === 1000) {
            const p = data.result;
            // Chỉ hiển thị duy nhất sản phẩm tìm được lên bảng
            table.innerHTML = `
              <tr class="align-middle">
                    <td>1</td>
                    <td>${p.name}</td>
                    <td>${p.price.toLocaleString()}đ</td>
                    <td>${categoryMap[p.categoryId] || "N/A"}</td>
                    <td>
                      <a href="editProduct.html?id=${p.id}" class="btn btn-warning btn-sm font-title">Edit</a>
                      <button class="btn btn-danger btn-sm font-title" onclick="deleteProduct('${p.id}')">Delete</button>
                      <button class="btn btn-secondary btn-sm font-title" onclick="viewVariants('${p.id}')">Variants</button>
                    </td>
              </tr>
              `;
        } else {
            alert("Không tìm thấy mã sản phẩm này!");
        }
    } catch (error) {
        alert("Mã ID không hợp lệ hoặc lỗi server!");
    }
}

// Thêm sự kiện nhấn Enter cho ô nhập mã
document.getElementById("findProductId")?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") findProduct();
});