const role = localStorage.getItem("role");
console.log(role);

const API_ORDER = "https://kid-clothes-store.onrender.com/api/v1/orders/my-orders"; 
document.addEventListener("DOMContentLoaded", () => {
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
        <div class="card order-card shadow-sm">
            <div class="card-body">

                <!-- HEADER -->
                <div class="d-flex justify-content-between mb-3">
                    <div>
                        <strong>Mã đơn:</strong> #${order.id}
                    </div>
                    <span class="badge bg-warning text-dark status-badge">
                        ${translateStatus(order.status)}
                    </span>
                </div>

                <!-- ITEMS -->
                ${order.items.map(item => `
                    <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                        
                        <img src="https://via.placeholder.com/80" class="product-img me-3">

                        <div class="flex-grow-1">
                            <div>${item.productName}</div>
                            <small class="text-muted">
                                Size: ${item.size} | Màu: ${item.color}
                            </small><br>
                            <small>x${item.quantity}</small>
                        </div>

                        <div class="text-end">
                            <strong>${formatPrice(item.price)}</strong>
                        </div>

                    </div>
                `).join("")}

                <!-- SHIPPING -->
                <div class="mb-3">
                    <small><strong>Người nhận:</strong> ${order.receiverName}</small><br>
                    <small><strong>SĐT:</strong> ${order.receiverPhone}</small><br>
                    <small><strong>Địa chỉ:</strong> ${order.shippingAddress}</small>
                </div>

                <!-- TOTAL -->
                <div class="border-top pt-2">
                    <div class="d-flex justify-content-between">
                        <span>Tạm tính:</span>
                        <span>${formatPrice(order.totalAmount - order.shippingFee)}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Phí ship:</span>
                        <span>${formatPrice(order.shippingFee)}</span>
                    </div>
                    <div class="d-flex justify-content-between fw-bold text-danger">
                        <span>Tổng:</span>
                        <span>${formatPrice(order.totalAmount)}</span>
                    </div>
                </div>

                <!-- ACTION -->
                        <div class="mt-3 text-end">
                        <button class="btn btn-outline-danger btn-sm"${order.status !== "PENDING_DELIVERY" ? "disabled" : ""}onclick="cancelOrder('${order.id}')">
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
    const token = localStorage.getItem("token");

    if(!token){
        alert("Vui lòng đăng nhập");
        return;
    }

    try {
        const res = await fetch(API_ORDER, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if(data.code === 1000){
            renderOrders(data.result);
        } else {
            alert("Không lấy được đơn hàng");
        }

    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server");
    }
}
async function cancelOrder(orderId){
    const token = localStorage.getItem("token");

    if(!confirm("Bạn có chắc muốn hủy đơn hàng này không?")){
        return;
    }

    try {
        const res = await fetch(`https://kid-clothes-store.onrender.com/api/v1/orders/${orderId}`, {
            method: "DELETE", // hoặc "PUT" nếu backend bạn dùng cancel
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if(data.code === 1000){
            alert("Hủy đơn thành công!");
            getMyOrders(); // reload lại list
        } else {
            alert("Hủy đơn thất bại!");
        }

    } catch (error) {
        console.error(error);
        alert("Lỗi server!");
    }
}
async function loadOrdersByStatus(){
    const token = localStorage.getItem("token");
    if(!token) return;
    const status = document.getElementById("statusFilter").value;
    try {
        const res = await fetch(`https://kid-clothes-store.onrender.com/api/v1/orders/status/${status}`,{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        if(data.code === 1000) {
            renderStaffOrders(data.result);
        }
    } catch (error) {
        console.error("Lỗi sever: ", error);
    }
}
document.getElementById("statusFilter").addEventListener("change", loadOrdersByStatus);

function renderStaffOrders(data){
    const container = document.getElementById("orderContainer");

    let html = `
    <table class="table table-bordered">
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
        html += `
        <tr>
            <td>${order.id}</td>
            <td>${order.userId}</td>
            <!--<td>${order.userId}</td>-->
            <td>${formatPrice(order.totalAmount)}</td>
            <td>${translateStatus(order.status)}</td>
            <td>
                <button class="btn btn-sm btn-primary"
                    onclick="viewOrderDetail('${order.id}')">
                    Edit
                </button>
                <button class="btn btn-danger btn-sm "
                    onclick="cancelOrderStaff('${order.id}')">
                    Hủy đơn
                </button>
            </td>
        </tr>
        `;
    });

    html += "</tbody></table>";

    container.innerHTML = html;
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
function renderOrderDetailModal(order){
    const container = document.getElementById("orderDetailContent");

    let html = `
        <p><strong>Mã đơn:</strong> ${order.id}</p>
        
        <div class="mb-3">
            <strong>Trạng thái:</strong> 
            <span class="badge bg-warning text-dark">
                ${translateStatus(order.status)}
            </span>
        </div>

        <div class="mb-3">
            <label class="form-label">Cập nhật trạng thái</label>
            <select id="updateStatus" class="form-select">
                <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                <option value="PENDING_DELIVERY">Chờ giao</option>
                <option value="DELIVERING">Đang giao</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELED">Đã hủy</option>
            </select>
        </div>

        <button class="btn btn-success mb-3"
            onclick="updateOrderStatus('${order.id}')">
            Cập nhật
        </button>

        <hr>

        <h6>Sản phẩm:</h6>
    `;

    order.items.forEach(item => {
        html += `
        <div class="d-flex align-items-center mb-3 border-bottom pb-2">
            <div class="product-avatar me-3">
                ${item.productName.charAt(0)}
            </div>

            <div class="flex-grow-1">
                <div>${item.productName}</div>
                <small class="text-muted">
                    Size: ${item.size} | Màu: ${item.color}
                </small><br>
                <small>x${item.quantity}</small>
            </div>

            <div>
                <strong>${formatPrice(item.price)}</strong>
            </div>
        </div>
        `;
    });

    html += `
        <hr>
        <p><strong>Người nhận:</strong> ${order.receiverName}</p>
        <p><strong>SĐT:</strong> ${order.receiverPhone}</p>
        <p><strong>Địa chỉ:</strong> ${order.shippingAddress}</p>

        <hr>

        <div class="d-flex justify-content-between">
            <span>Tổng tiền:</span>
            <strong class="text-danger">${formatPrice(order.totalAmount)}</strong>
        </div>
    `;

    container.innerHTML = html;

    // set selected status hiện tại
    document.getElementById("updateStatus").value = order.status;
}

async function updateOrderStatus(orderId){
    const token = localStorage.getItem("token");
    const newStatus = document.getElementById("updateStatus").value;

    if(!confirm("Bạn có chắc muốn cập nhật trạng thái?")){
        return;
    }

    try {
        const res = await fetch(
            `https://kid-clothes-store.onrender.com/api/v1/orders/${orderId}/status?status=${newStatus}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if(data.code === 1000){
            alert("Cập nhật thành công!");

            // reload lại list
            if(localStorage.getItem("role") === "STAFF"){
                loadOrdersByStatus();
            } else {
                getMyOrders();
            }

        } else {
            alert("Cập nhật thất bại!");
        }

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
}
async function cancelOrderStaff(orderId){
    const token = localStorage.getItem("token");

    if(!confirm("Bạn có chắc muốn HỦY đơn hàng này?")){
        return;
    }

    try {
        const res = await fetch(
            `https://kid-clothes-store.onrender.com/api/v1/orders/${orderId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if(data.code === 1000){
            alert("Đã hủy đơn thành công!");

            loadOrdersByStatus();

        } else {
            alert("Hủy đơn thất bại!");
        }

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
}
