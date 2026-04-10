const API_BASE_URL = "https://kid-clothes-store.onrender.com/api/v1";
function getTokenOrWarn() {
    const token = localStorage.getItem("token");
    if (!token) {
        showMessage({
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để sử dụng chức năng này!",
            type: "warning",
            onOk: () => window.location.href = "../login.html"
        });
        return null;
    }
    return token;
}

async function fetchUsers() {
    const token = getTokenOrWarn();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.code === 1000) {
            renderTable(data.result);
        } else {
            showMessage({
                title: "Lỗi",
                message: data.message || "Không thể tải danh sách",
                type: "error"
            });
        }

    } catch (error) {
        showMessage({
            title: "Lỗi server",
            message: "Không thể kết nối server",
            type: "error"
        });
    }
}

function renderTable(users) {
    const tableBody = document.getElementById('userTable');
    tableBody.innerHTML = ''; 

    users.forEach(user => {
        const row = `<tr>
    <td><span class="fw-bold text-muted">${user.id}</span></td>
    <td >${user.fullName}</td>
    <td class="">${user.email}</td>
    <td>${user.phone || 'N/A'}</td>
    <td>${user.address || 'N/A'}</td>
    <td>
        <span class="badge" style="background-color: ${user.role === 'STAFF' ? '#B999FD' : '#6c757d'}; font-size: 1.2rem; padding: 0.5rem 1rem;">
            ${user.role}
        </span>
    </td>
    <td>
        <div class="d-flex gap-2">
            <button class="btn btn-sm btn-action-edit" style="font-size: 1.6rem" onclick="openEditModal('${user.email}')">
                <i class="fas fa-edit"></i> Sửa
            </button>
            <button class="btn btn-sm btn-action-remove" style="font-size: 1.6rem" onclick="deleteUser('${user.email}')">
                <i class="fas fa-trash"></i> Xóa
            </button>
        </div>
    </td>
</tr>`;
        tableBody.innerHTML += row;
    });
}

async function searchUsers() {
    const token = getTokenOrWarn();
    if (!token) return;

    const keyword = document.getElementById('searchKeyword').value;
    if (!keyword) return fetchUsers();

    try {
        const response = await fetch(`${API_BASE_URL}/users/search?keyword=${encodeURIComponent(keyword)}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.code === 1000) {
            renderTable(data.result);
        }

    } catch (error) {
        showMessage({
            title: "Lỗi",
            message: "Không thể tìm kiếm",
            type: "error"
        });
    }
}

async function filterByRole() {
    const token = getTokenOrWarn();
    if (!token) return;

    const role = document.getElementById('roleFilter').value;
    if (!role) return fetchUsers();

    try {
        const response = await fetch(`${API_BASE_URL}/users/role/${role}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.code === 1000) {
            renderTable(data.result);
        }

    } catch (error) {
        showMessage({
            title: "Lỗi",
            message: "Không thể lọc theo vai trò",
            type: "error"
        });
    }
}

async function saveUser() {
    const token = getTokenOrWarn();
    if (!token) return;

    const email = document.getElementById('editEmail').value;

    const updateData = {
        fullName: document.getElementById('editFullName').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value
    };

    const password = document.getElementById('editPassword').value;
    if (password) updateData.password = password;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${email}`, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (data.code === 1000) {
            showMessage({
                title: "Thành công",
                message: "Cập nhật người dùng thành công!",
                type: "success",
                onOk: () => {
                    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
                    fetchUsers();
                }
            });
        }

    } catch (error) {
        showMessage({
            title: "Lỗi",
            message: "Không thể cập nhật người dùng",
            type: "error"
        });
    }
}
// 7. Xóa người dùng [cite: 231, 240]
async function deleteUser(email) {
    const token = getTokenOrWarn();
    if (!token) return;

    showMessage({
        title: "Xác nhận xóa",
        message: `Bạn có chắc muốn xóa ${email}?`,
        type: "warning",
        showCancel: true,
        onOk: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/${email}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const data = await response.json();

               if (data.code === 1000) {
                showMessage({
                    title: "Thành công",
                    message: "Đã xóa người dùng!",
                    type: "success",
                    onOk: fetchUsers
                });
            } else {
                showMessage({
                    title: "Xóa thất bại",
                    message: data.message || "Không thể xóa",
                    type: "error"
                });
            }

            } catch (error) {
                showMessage({
                    title: "Lỗi",
                    message: "Không thể xóa người dùng",
                    type: "error"
                });
            }
        }
    });
}

// Khởi tạo danh sách khi trang tải xong
let userModal = null;
let isLoading = false;

async function openEditModal(email) {
    if (isLoading) return;
    
    const token = getTokenOrWarn();
    if (!token) return;
    
    isLoading = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${email}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.code === 1000) {
            const user = data.result;
            
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editFullName').value = user.fullName;
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editAddress').value = user.address || '';
            
            const modalElement = document.getElementById('userModal');
            
            if (!userModal) {
                userModal = new bootstrap.Modal(modalElement);
            }
            
            userModal.show();
        }
        
    } catch (error) {
        showMessage({
            title: "Lỗi",
            message: "Không thể lấy thông tin người dùng",
            type: "error"
        });
    } finally {
        isLoading = false;
    }
}
// Init
document.addEventListener('DOMContentLoaded', fetchUsers);