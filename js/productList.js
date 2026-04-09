  const API_URL = "https://kid-clothes-store.onrender.com/api/v1/products";
  const API_CATEGORY = "https://kid-clothes-store.onrender.com/api/v1/categories";

  function requireAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    showMessage({
      title: "Chưa đăng nhập",
      message: "Bạn cần đăng nhập để thực hiện chức năng này",
      type: "warning",
      onOk: () => {
        window.location.href = "../login.html";
      }
    });
    return null;
  }

  return token;
}

  let categoryMap = {}; // map id → name

  // Load category trước
async function loadCategories() {
  const token = requireAuth();
  if (!token) return;

  try {
    const res = await fetch(API_CATEGORY, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (Array.isArray(data.result)) {
      data.result.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });
    } else {
      showMessage({
        title: "Lỗi",
        message: "Không load được category",
        type: "error"
      });
    }

  } catch (err) {
    showMessage({
      title: "Server Error",
      message: "Không thể tải category",
      type: "error"
    });
  }
}

  // Load product
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const table = document.getElementById("productTable");
    table.innerHTML = "";

    if (!Array.isArray(data.result)) {
      showMessage({
        title: "Lỗi",
        message: "Không load được sản phẩm",
        type: "error"
      });
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
            <a href="editProduct.html?id=${p.id}" class="btn btn-action-edit btn-sm font-title">Edit</a>
            <button class="btn btn-action-remove btn-sm font-title" onclick="deleteProduct('${p.id}')">Delete</button>
            <button class="btn btn-sm font-title btn-action-variant" onclick="viewVariants('${p.id}')">Variants</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    showMessage({
      title: "Lỗi",
      message: "Không thể load sản phẩm",
      type: "error"
    });
  }
}

  // Delete product
async function deleteProduct(id) {
  const token = requireAuth();
  if (!token) return;

  showMessage({
    title: "Xác nhận",
    message: "Bạn có chắc muốn xóa sản phẩm này?",
    type: "warning",
    showCancel: true,
    onOk: async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (data.code === 1000) {
          showMessage({
            title: "Thành công",
            message: "Xóa sản phẩm thành công",
            type: "success"
          });
          fetchProducts();
        } else {
          showMessage({
            title: "Thất bại",
            message: data.message || "Xóa thất bại",
            type: "error"
          });
        }

      } catch (err) {
        showMessage({
          title: "Server Error",
          message: "Không thể kết nối server",
          type: "error"
        });
      }
    }
  });
}

  // chạy
  async function init() {
    await loadCategories(); // load trước
    await fetchProducts(); // rồi mới render
  }

  init();
  let variantModal = null;
  let isLoading = null;
  let currentProducts = [];
//   Handle variant
async function viewVariants(productId){
  if(isLoading) return;
  isLoading = true;

  try {
    const res = await fetch(`${API_URL}/${productId}`);
    const data = await res.json();

    currentProducts = data.result;

    document.querySelector(".modal-title").textContent = currentProducts.name;
    document.getElementById("variantProductId").value = productId;

    renderVariantTable(currentProducts.variants);

    if(!variantModal){
      variantModal = new bootstrap.Modal(document.getElementById("variantModal"));
    }

    variantModal.show();

  } catch (err) {
    showMessage({
      title: "Lỗi",
      message: "Không load được variant",
      type: "error"
    });
  } finally {
    isLoading = false;
  }
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
  showMessage({
    title: "Xác nhận",
    message: "Bạn có chắc muốn xóa variant này?",
    type: "warning",
    showCancel: true,
    onOk: () => {
      currentProducts.variants.splice(index, 1);
      renderVariantTable(currentProducts.variants);
    }
  });
}
// add variant
async function addVariant(){
  const productId = document.getElementById("variantProductId").value;

  const size = document.getElementById("vSize").value;
  const color = document.getElementById("vColor").value;
  const stock = Number(document.getElementById("vStock").value);

  if(!size || !color){
    showMessage({
      title: "Thiếu thông tin",
      message: "Vui lòng nhập size và color",
      type: "warning"
    });
    return;
  }

  const res = await fetch(`${API_URL}/${productId}`);
  const data = await res.json();
  const product = data.result;

  const exists = product.variants.some(v => v.size === size && v.color === color);

  if(exists){
    showMessage({
      title: "Trùng variant",
      message: "Variant đã tồn tại",
      type: "warning"
    });
    return;
  }

  product.variants.push({ size, color, stock });

  await updateVariants(productId, product.variants);
}
// Save chỉnh sửa
async function saveAllChanges() {
  const productId = document.getElementById("variantProductId").value;
  const token = requireAuth();
  if (!token) return;

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
      showMessage({
        title: "Thành công",
        message: "Cập nhật thành công",
        type: "success"
      });
      currentProducts = data.result;
    } else {
      showMessage({
        title: "Lỗi",
        message: data.message || "Không thể cập nhật",
        type: "error"
      });
    }

  } catch (err) {
    showMessage({
      title: "Server Error",
      message: "Vui lòng thử lại sau",
      type: "error"
    });
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
    fetchProducts();
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${inputId}`);
    const data = await res.json();

    if (data.code === 1000) {
      const p = data.result;

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
      showMessage({
        title: "Không tìm thấy",
        message: "Không có sản phẩm với ID này",
        type: "warning"
      });
    }

  } catch (err) {
    showMessage({
      title: "Lỗi",
      message: "ID không hợp lệ hoặc lỗi server",
      type: "error"
    });
  }
}

// Thêm sự kiện nhấn Enter cho ô nhập mã
document.getElementById("findProductId")?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") findProduct();
});