
function checkAuth(){
    const token = localStorage.getItem("token");

    if(!token){
        showMessage({
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để xem đơn hàng",
            type: "warning",
            onOk: () => window.location.href = "../login.html"
        });
        return null;
    }

    return token;
}

const API_ORDER = "https://kid-clothes-store.onrender.com/api/v1/orders/my-orders"; 
document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    const token = checkAuth();
    if(!token) return;

    if(role === "STAFF"){
        document.getElementById("staffControls").style.display = "block";
        loadOrdersByStatus();
    }else{
        getMyOrders();
    }
});

function formatPrice(price){
    return price.toLocaleString('vi-VN') + "đ";
}

function translateStatus(status){
    switch(status){
        case "PENDING_PAYMENT": return "Chờ thanh toán";
        case "PENDING_DELIVERY": return "Chờ giao hàng";
        case "DELIVERING": return "Đang giao hàng";
        case "DELIVERED": return "Đã giao";
        case "CANCELLED": return "Đã hủy";
        case "COMPLETED": return "Đơn hoàn thành";
        default: return status;
    }
}

function renderOrders(data){
    const container = document.getElementById("orderContainer");
    let html = "";
    
    data.forEach(order => {

        html += `
                <div class="card order-card shadow-sm mb-4">
                    <div class="card-body p-4">

                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <span class="text-muted" style="font-size: 1.3rem;">Mã đơn:</span>
                                <strong style="font-size: 1.5rem; color: var(--color-price);">#${order.id}</strong>
                            </div>
                            <span class="badge status-badge" style="background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;">
                                ${translateStatus(order.status)}
                            </span>
                        </div>

                        ${order.items.map(item => `
                            <div class="d-flex align-items-center mb-3 pb-3 border-bottom" style="border-bottom-style: dashed !important;">
                                
                                <div class="product-avatar me-3">
                                    ${item.productName.charAt(0)}
                                </div>

                                <div class="flex-grow-1">
                                    <div class="product-name">${item.productName}</div>
                                    <small class="text-muted">
                                        Size: <span class="text-dark">${item.size}</span> | Màu: <span class="text-dark">${item.color}</span>
                                    </small><br>
                                    <small class="fw-bold">x${item.quantity}</small>
                                </div>

                                <div class="text-end">
                                    <strong style="font-size: 1.6rem;">${formatPrice(item.price)}</strong>
                                </div>

                            </div>
                        `).join("")}

                        <div class="mb-4 p-3 rounded" style="background-color: #fcfaff; border: 1px solid #f0e6ff;">
                            <div class="mb-1 text-muted" style="font-size: 1.2rem; text-transform: uppercase; letter-spacing: 0.5px;">Thông tin nhận hàng</div>
                            <div style="font-size: 1.4rem;"><strong>${order.receiverName}</strong> | ${order.receiverPhone}</div>
                            <div class="text-muted" style="font-size: 1.3rem;">${order.shippingAddress}</div>
                        </div>

                        <div class="total-section">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted">Tạm tính:</span>
                                <span>${formatPrice(order.totalAmount - order.shippingFee)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Phí vận chuyển:</span>
                                <span>${formatPrice(order.shippingFee)}</span>
                            </div>
                            <div class="d-flex justify-content-between fw-bold pt-2 border-top">
                                <span style="font-size: 1.6rem;">Tổng cộng:</span>
                                <span class="total-amount">${formatPrice(order.totalAmount)}</span>
                            </div>
                        </div>

                        <div class="mt-4 d-flex justify-content-end gap-2">
                            
                            <!--${order.status === "DELIVERING" ? `
                                <button class="btn btn-confirm-order btn-sm" onclick="confirmReceived('${order.id}')">
                                    <i class="bi bi-check2-circle me-1"></i> Xác nhận đã nhận hàng
                                </button>
                            ` : ""}-->

                            <button class="btn btn-outline-danger btn-sm" 
                                ${order.status !== "PENDING_PAYMENT" && order.status !== "PENDING_DELIVERY" ? "disabled" : ""} 
                                onclick="cancelOrder('${order.id}')">
                                Hủy đơn
                            </button>
                        </div>

                    </div>
                </div>
                `;
    });

    container.innerHTML = html;
}

async function getMyOrders(){
    const token = checkAuth();
    if(!token) return;

    try {
        const res = await fetch(API_ORDER, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();

        if(data.code === 1000){
            renderOrders(data.result);
        } else {
            showMessage({
                title: "Lỗi",
                message: "Không lấy được đơn hàng",
                type: "error"
            });
        }

    } catch (error) {
        console.error(error);
        showMessage({
            title: "Server lỗi",
            message: "Không thể kết nối server",
            type: "error"
        });
    }
}
async function cancelOrder(orderId){
    const token = checkAuth();
    if(!token) return;

    showMessage({
        title: "Xác nhận",
        message: "Bạn có chắc muốn hủy đơn hàng này?",
        type: "warning",
        showCancel: true,
        onOk: async () => {
            try {
                const res = await fetch(
                    `https://kid-clothes-store.onrender.com/api/v1/orders/${orderId}`,
                    {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    }
                );

                const data = await res.json();

                if(data.code === 1000){
                    showMessage({
                        title: "Thành công",
                        message: "Đã hủy đơn hàng",
                        type: "success",
                        onOk: getMyOrders
                    });
                } else {
                    showMessage({
                        title: "Thất bại",
                        message: data.message || "Không thể hủy đơn",
                        type: "error"
                    });
                }

            } catch (err){
                console.error(err);
                showMessage({
                    title: "Server lỗi",
                    message: "Không thể kết nối server",
                    type: "error"
                });
            }
        }
    });
}

async function loadOrdersByStatus(){
    const token = checkAuth();
    if(!token) return;

    const status = document.getElementById("statusFilter").value;

    try {
        const res = await fetch(
            `https://kid-clothes-store.onrender.com/api/v1/orders/status/${status}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        const data = await res.json();

        if(data.code === 1000){
            renderStaffOrders(data.result);
        }

    } catch (error) {
        console.error(error);
        showMessage({
            title: "Lỗi",
            message: "Không load được danh sách",
            type: "error"
        });
    }
}

document.getElementById("statusFilter").addEventListener("change", loadOrdersByStatus);

function renderStaffOrders(data){
    const container = document.getElementById("orderContainer");

    let html = `
    <div class="table-responsive-custom">
    <table class="table table-bordered table-staff">
        <thead>
            <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <!--<th>Người nhận</th>-->
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach(order => {
        html += `<tr>
    <td data-label="Order ID">
        <span class="order-id-text">#${order.id}</span>
    </td>
    <td data-label="User ID">
        <small class="text-muted">${order.userId}</small>
    </td>
    <td data-label="Tổng tiền">
        <strong style="color: #333;">${formatPrice(order.totalAmount)}</strong>
    </td>
    <td data-label="Trạng thái">
        <span class="badge" style="background-color: ${getStatusBg(order.status)};padding: 0.6rem 1rem; border-radius: 2rem;">
            ${translateStatus(order.status)}
        </span>
    </td>
    <td data-label="Action">
        <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-staff-edit" onclick="viewOrderDetail('${order.id}')">
                <i class="bi bi-pencil-square"></i> Chi tiết
            </button>
            <button class="btn btn-staff-cancel" 
                ${order.status === 'CANCELED' || order.status === 'COMPLETED' ? 'disabled' : ''} 
                onclick="cancelOrderStaff('${order.id}')">
                Hủy đơn
            </button>
        </div>
    </td>
</tr>`;
    });

    html += "</tbody></table></div>";

    container.innerHTML = html;
}
function getStatusBg(status) {
    const colors = {
        'PENDING_PAYMENT': '#ffc107', // Vàng
        'PENDING_DELIVERY': '#17a2b8', // Xanh cyan
        'DELIVERING': '#B999FD',       // Tím chủ đạo
        'COMPLETED': '#28a745',        // Xanh lá
        'CANCELED': '#dc3545'          // Đỏ
    };
    return colors[status] || '#6c757d';
}
async function viewOrderDetail(orderId){
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(
            `https://kid-clothes-store.onrender.com/api/v1/orders/${orderId}`,
            {
                headers:{
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if(data.code === 1000){
            renderOrderDetailModal(data.result);

            const modal = new bootstrap.Modal(
                document.getElementById('orderDetailModal')
            );
            modal.show();
        }

    } catch (err) {
        console.error(err);
    }
}
function renderOrderDetailModal(order) {
    const container = document.getElementById("orderDetailContent");

    let html = `
        <div class="order-detail-header">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Mã đơn hàng:</span>
                <strong style="font-size: 1.6rem; color: var(--primary-color);">#${order.id}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">Trạng thái hiện tại:</span>
                <span class="badge" style="background-color: ${getStatusBg(order.status)}; font-size: 1.2rem; padding: 0.6rem 1.2rem;">
                    ${translateStatus(order.status)}
                </span>
            </div>
        </div>
        
        <div class="mb-4">
            <label class="form-label fw-bold" style="font-size: 1.4rem;">Cập nhật trạng thái (Dành cho STAFF)</label>
            <div class="row g-2">
                <div class="col-md-8">
                    <select id="updateStatus" class="form-select">
                        <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                        <option value="PENDING_DELIVERY">Chờ giao</option>
                        <option value="DELIVERING">Đang giao</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELED">Đã hủy</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <button class="btn btn-update-status" onclick="updateOrderStatus('${order.id}')">
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>

        <h6 class="fw-bold mb-3" style="font-size: 1.6rem; border-left: 4px solid var(--primary-color); padding-left: 1rem;">
            Danh sách sản phẩm
        </h6>
    `;

    order.items.forEach(item => {
        html += `
        <div class="d-flex align-items-center mb-3 border-bottom pb-3 product-item">
            <div class="product-avatar me-3">
                ${item.productName.charAt(0)}
            </div>

            <div class="flex-grow-1">
                <div class="fw-bold" style="font-size: 1.5rem;">${item.productName}</div>
                <small class="text-muted" style="font-size: 1.2rem;">
                    Size: <span class="text-dark fw-bold">${item.size}</span> | Màu: <span class="text-dark fw-bold">${item.color}</span>
                </small><br>
                <div class="mt-1" style="font-size: 1.3rem;">Số lượng: <strong>x${item.quantity}</strong></div>
            </div>

            <div class="text-end">
                <strong style="font-size: 1.5rem; color: #333;">${formatPrice(item.price)}</strong>
            </div>
        </div>
        `;
    });

    html += `
        <div class="mt-4 p-3 rounded shadow-sm" style="background-color: #fff; border: 1px solid #eee;">
            <h6 class="fw-bold mb-3" style="font-size: 1.5rem;">Thông tin giao hàng</h6>
            <p class="mb-1"><strong>Người nhận:</strong> ${order.receiverName}</p>
            <p class="mb-1"><strong>Số điện thoại:</strong> ${order.receiverPhone}</p>
            <p class="mb-0 text-muted"><strong>Địa chỉ:</strong> ${order.shippingAddress}</p>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <span style="font-size: 1.6rem;">Tổng thanh toán:</span>
            <strong style="font-size: 2.2rem; color: #ff5252;">${formatPrice(order.totalAmount)}</strong>
        </div>
    `;

    container.innerHTML = html;

    // Set giá trị mặc định cho dropdown cập nhật trạng thái [cite: 330, 334]
    document.getElementById("updateStatus").value = order.status;
}

async function updateOrderStatus(orderId){
    const token = checkAuth();
    if(!token) return;

    const newStatus = document.getElementById("updateStatus").value;

    showMessage({
        title: "Xác nhận",
        message: "Bạn có chắc muốn cập nhật trạng thái?",
        type: "warning",
        showCancel: true,
        onOk: async () => {
            try {
                const res = await fetch(
                    `https://kid-clothes-store.onrender.com/api/v1/orders/${orderId}/status?status=${newStatus}`,
                    {
                        method: "PUT",
                        headers: { "Authorization": `Bearer ${token}` }
                    }
                );

                const data = await res.json();

                if(data.code === 1000){
                    showMessage({
                        title: "Thành công",
                        message: "Đã cập nhật trạng thái",
                        type: "success",
                        onOk: () => {
                            if(localStorage.getItem("role") === "STAFF"){
                                loadOrdersByStatus();
                            } else {
                                getMyOrders();
                            }
                        }
                    });
                } else {
                    showMessage({
                        title: "Thất bại",
                        message: data.message || "Không thể cập nhật",
                        type: "error"
                    });
                }

            } catch (err){
                console.error(err);
                showMessage({
                    title: "Server lỗi",
                    message: "Không thể kết nối",
                    type: "error"
                });
            }
        }
    });
}
async function cancelOrderStaff(orderId){
    const token = checkAuth();
    if(!token) return;

    showMessage({
        title: "Xác nhận",
        message: "Bạn có chắc muốn HỦY đơn này?",
        type: "warning",
        showCancel: true,
        onOk: async () => {
            try {
                const res = await fetch(
                    `https://kid-clothes-store.onrender.com/api/v1/orders/${orderId}`,
                    {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    }
                );

                const data = await res.json();

                if(data.code === 1000){
                    showMessage({
                        title: "Thành công",
                        message: "Đã hủy đơn",
                        type: "success",
                        onOk: loadOrdersByStatus
                    });
                } else {
                    showMessage({
                        title: "Thất bại",
                        message: "Không thể hủy đơn",
                        type: "error"
                    });
                }

            } catch (err){
                console.error(err);
                showMessage({
                    title: "Server lỗi",
                    message: "Không thể kết nối",
                    type: "error"
                });
            }
        }
    });
}

window.searchOrder = async function() {
    const orderId = document.getElementById("orderSearchInput").value.trim();
    const token = localStorage.getItem("token");
    const container = document.getElementById("orderContainer");
    if(!container) return;

    if (!orderId) {
        loadOrdersByStatus();
        return;
    }

    try {
        const res = await fetch(`https://kid-clothes-store.onrender.com/api/v1/orders/${orderId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();

        if (data.code === 1000 && data.result) {
            container.innerHTML = `
                <div class="table-responsive-custom">
                    <table class="table table-bordered table-staff">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User ID</th>
                                <!--<th>Người nhận</th>-->
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td data-label="Order ID">
                                <span class="order-id-text">#${data.result.id}</span>
                            </td>
                            <td data-label="User ID">
                                <small class="text-muted">${data.result.userId}</small>
                            </td>
                            <td data-label="Tổng tiền">
                                <strong style="color: #333;">${formatPrice(data.result.totalAmount)}</strong>
                            </td>
                            <td data-label="Trạng thái">
                                <span class="badge" style="background-color: ${getStatusBg(data.result.status)};padding: 0.6rem 1rem; border-radius: 2rem;">
                                    ${translateStatus(data.result.status)}
                                </span>
                            </td>
                            <td data-label="Action">
                                <div class="d-flex gap-2 justify-content-end">
                                    <button class="btn btn-staff-edit" onclick="viewOrderDetail('${data.result.id}')">
                                        <i class="bi bi-pencil-square"></i> Chi tiết
                                    </button>
                                    <button class="btn btn-staff-cancel" 
                                        ${data.result.status === 'CANCELED' || data.result.status === 'COMPLETED' ? 'disabled' : ''} 
                                        onclick="cancelOrderStaff('${data.result.id}')">
                                        Hủy đơn
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody></table></div>
            `;
        } else if (data.code === 101) {
            alert("Bạn không có quyền xem đơn hàng này.");
        } else {
            container.innerHTML = `<div class="alert alert-warning text-center">Không tìm thấy đơn hàng mã: ${orderId}</div>`;
        }
    } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
        container.innerHTML = `<div class="alert alert-danger text-center">Đã xảy ra lỗi khi tìm kiếm.</div>`;
    }
}

