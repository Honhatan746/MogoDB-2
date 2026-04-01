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
            <a href="editProduct.html?id=${p.id}" class="btn btn-warning btn-sm">Edit</a>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">Delete</button>
            <button class="btn btn-secondary btn-sm" onclick="viewVariants('${p.id}')">Variants</button>
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
//   Handle variant
 async function viewVariants(productId){
    const modalTitle = document.querySelector(".modal-title");
    const res = await fetch(`${API_URL}/${productId}`);
    const data = await res.json();

    const product = data.result;
    modalTitle.textContent = product.name;
    document.getElementById("variantProductId").value = productId;
    

    renderVariantTable(product.variants);
    const model = new bootstrap.Modal(document.getElementById("variantModal"));
    model.show();
}

function renderVariantTable(variants){
    const table = document.getElementById("variantTable");
    table.innerHTML = "";
    variants.forEach((variant, index) => {
        table.innerHTML += `
            <tr>
        <td>${variant.size}</td>
        <td>${variant.color}</td>
        <td>${variant.stock}</td>
        <td>
          <button class="btn btn-danger btn-sm"
            onclick="deleteVariant(${index})">X</button>
        </td>
      </tr>
        `
    });
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

  // ❗ check trùng
  const exists = product.variants.some(v => v.size === size && v.color === color);
  if(exists){
    alert("Variant đã tồn tại");
    return;
  }

  product.variants.push({ size, color, stock });

  await updateVariants(productId, product.variants);
}
// delete variant
async function deleteVariant(index){
  const productId = document.getElementById("variantProductId").value;
  const res = await fetch(`${API_URL}/${productId}`);
  const data = await res.json();
  const product = data.result;

  product.variants.splice(index, 1);

  await updateVariants(productId, product.variants);
}
// update lại 
async function updateVariants(productId, variants){
  const token = localStorage.getItem("token");

  // 👉 lấy product hiện tại
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

  // 👉 gửi full data (QUAN TRỌNG)
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