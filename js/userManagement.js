const API_BASE_URL = "https://kid-clothes-store.onrender.com/api/v1";
// Lấy token từ localStorage (phải có để dùng quyền STAFF) [cite: 293]
const token = localStorage.getItem('token'); 

// Hàm bổ sung Header để tránh lỗi 401/403 
const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
});

// 1. Lấy toàn bộ danh sách người dùng [cite: 289]
async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: getHeaders()
        });
        const data = await response.json();
        if (data.code === 1000) {
            renderTable(data.result);
        } else {
            alert("Lỗi: " + data.message);
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
    }
}

// 2. Render dữ liệu vào bảng [cite: 298, 301]
function renderTable(users) {
    const tableBody = document.getElementById('userTable');
    tableBody.innerHTML = ''; 

    users.forEach(user => {
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.address || 'N/A'}</td>
                <td><span class="badge ${user.role === 'STAFF' ? 'bg-danger' : 'bg-info'}">${user.role}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="openEditModal('${user.email}')">Sửa</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.email}')">Xóa</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// 3. Tìm kiếm theo tên (Sử dụng Query Parameter: keyword) [cite: 249, 259]
async function searchUsers() {
    const keyword = document.getElementById('searchKeyword').value;
    if (!keyword) return fetchUsers();
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/search?keyword=${encodeURIComponent(keyword)}`, {
            method: 'GET',
            headers: getHeaders()
        });
        const data = await response.json();
        if (data.code === 1000) renderTable(data.result);
    } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
    }
}

// 4. Lọc theo vai trò (Path Parameter) [cite: 312, 321]
async function filterByRole() {
    const role = document.getElementById('roleFilter').value;
    if (!role) return fetchUsers();

    try {
        const response = await fetch(`${API_BASE_URL}/users/role/${role}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        // Xử lý lỗi 500 nếu server không trả về JSON hợp lệ
        if (!response.ok) throw new Error("Server trả về lỗi " + response.status);
        
        const data = await response.json();
        if (data.code === 1000) renderTable(data.result);
    } catch (error) {
        console.error("Lỗi lọc vai trò:", error);
        alert("Hiện không thể lọc theo vai trò này. Vui lòng thử lại sau.");
    }
}

// 5. Mở Modal và đổ dữ liệu cũ vào để sửa [cite: 81, 198]
async function openEditModal(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${email}`, {
            method: 'GET',
            headers: getHeaders()
        });
        const data = await response.json();
        if (data.code === 1000) {
            const user = data.result;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editFullName').value = user.fullName;
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editAddress').value = user.address || '';
            
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        }
    } catch (error) {
        alert("Không thể lấy thông tin người dùng.");
    }
}

// 6. Lưu thay đổi (PUT) [cite: 198, 208]
async function saveUser() {
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
            headers: getHeaders(),
            body: JSON.stringify(updateData)
        });
        const data = await response.json();
        if (data.code === 1000) {
            alert("Cập nhật thành công!");
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            fetchUsers();
        }
    } catch (error) {
        alert("Lỗi khi cập nhật.");
    }
}

// 7. Xóa người dùng [cite: 231, 240]
async function deleteUser(email) {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${email}?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${email}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const data = await response.json();
        if (data.code === 1000) {
            alert("Đã xóa người dùng!");
            fetchUsers();
        }
    } catch (error) {
        alert("Lỗi khi xóa người dùng.");
    }
}

// Khởi tạo danh sách khi trang tải xong
document.addEventListener('DOMContentLoaded', fetchUsers);

async function openEditModal(email) {
    const token = localStorage.getItem('token');
    try {
        // Gọi API lấy thông tin theo email [cite: 81]
        const response = await fetch(`https://kid-clothes-store.onrender.com/api/v1/users/${email}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Yêu cầu quyền STAFF [cite: 89]
            }
        });

        const data = await response.json();

        if (data.code === 1000) {
            const user = data.result;
            // Đổ dữ liệu từ API vào các input của Modal [cite: 95]
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editFullName').value = user.fullName;
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editAddress').value = user.address || '';
            
            // Hiển thị Modal
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        } else if (data.code === 777) {
            alert("Người dùng không tồn tại!");
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin chi tiết:", error);
    }
}