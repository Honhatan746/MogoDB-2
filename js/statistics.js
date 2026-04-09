const API = "https://kid-clothes-store.onrender.com/api/v1/orders";
// Revenue
async function renderRevenueTable(result){
    console.log(result);
    
    const totalRevenueEle = document.getElementById("totalRevenue");
    const totalOrdersEle = document.getElementById("totalOrders");
    let totalRevenue = 0;
    let totalOrders = 0;

    const table = document.getElementById("revenueTable");
    table.innerHTML = "";
    result.forEach(r => {
        totalRevenue += r.totalRevenue;
        totalOrders += r.totalOrders;

        table.innerHTML += `
            <tr>
                <td class="ps-4 fw-bold">Tháng ${r.month}</td>
                <td style="color: #333; font-weight: 600;">
                    ${r.totalRevenue.toLocaleString("vi-VN")} <small>VND</small>
                </td>
                <td class="pe-4 text-end text-muted">${r.totalOrders} đơn</td>
            </tr>
        `
    });
    totalRevenueEle.innerText = totalRevenue.toLocaleString("vi-VN")  + " VND";
    totalOrdersEle.innerText = totalOrders;

}
// Top user
let userChartInstance = null;

async function loadTopUsers() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API}/statistics/top-users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const users = data.result; // Giả định mảng đã được API sắp xếp giảm dần theo chi tiêu

        // 1. Vẽ bảng dữ liệu
        renderUserTable(users);

        // 2. Vẽ biểu đồ Doughnut tỉ trọng
        renderUserDoughnut(users);

    } catch (err) {
        console.error("Lỗi khi tải dữ liệu khách hàng:", err);
    }
}

function renderUserTable(users) {
    const table = document.getElementById("topUsersTable");
    table.innerHTML = "";
    // Chỉ hiển thị tối đa 10 người trong bảng để tránh quá dài
    users.slice(0, 10).forEach((u, index) => {
        const rankClass = index === 0 ? 'bg-danger' : (index < 3 ? 'bg-warning text-dark' : 'bg-secondary');
        table.innerHTML += `
            <tr>
                <td><span class="badge ${rankClass} rounded-pill">${index + 1}</span></td>
                <td class="fw-bold text-truncate-id">${u.userId}</td>
                <td class="text-end fw-bold heading-pink">${u.totalSpent.toLocaleString("vi-VN")} VND</td>
            </tr>`;
    });
}

function renderUserDoughnut(users) {
    const ctx = document.getElementById('userDoughnutChart').getContext('2d');
    
    // Tính tổng tất cả chi tiêu để làm mẫu số cho %
    const totalSales = users.reduce((sum, u) => sum + u.totalSpent, 0);

    // Lấy Top 5
    const top5 = users.slice(0, 5);
    const top5Sum = top5.reduce((sum, u) => sum + u.totalSpent, 0);
    
    // Nhóm còn lại
    const othersSum = totalSales - top5Sum;

    // Chuẩn bị nhãn và dữ liệu cho biểu đồ
    const labels = top5.map(u => `User: ${u.userId}`);
    const dataValues = top5.map(u => u.totalSpent);

    if (othersSum > 0) {
        labels.push("Nhóm khách hàng khác");
        dataValues.push(othersSum);
    }

    // Xóa chart cũ nếu tồn tại
    if (userChartInstance) userChartInstance.destroy();

    userChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#FF6384', // Top 1
                    '#36A2EB', // Top 2
                    '#FFCE56', // Top 3
                    '#4BC0C0', // Top 4
                    '#9966FF', // Top 5
                    '#C9CBCF'  // Others
                ],
                hoverOffset: 15,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%', // Tạo lỗ hổng ở giữa (Doughnut)
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / totalSales) * 100).toFixed(1);
                            return ` ${context.label}: ${value.toLocaleString()} VND (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
// Top products
let productChartInstance = null;
async function loadTopProducts() {
    const token = localStorage.getItem("token");
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const limit = document.getElementById("limit").value || 5;

    if (!startDate || !endDate) {
        alert("Vui lòng chọn khoảng thời gian!");
        return;
    }

    try {
        const res = await fetch(
            `${API}/statistics/top-products?startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        const data = await res.json();
        const products = data.result;

        // 1. Render Bảng
        const table = document.getElementById("topProductsTable");
        table.innerHTML = "";
        products.forEach(p => {
            table.innerHTML += `
                <tr>
                    <td class="text-muted small">#${p.productId.substring(0, 5)}...</td>
                    <td class="fw-bold">${p.productName}</td>
                    <td class="text-end text-success fw-bold">${p.totalQuantitySold.toLocaleString()}</td>
                </tr>`;
        });

        // 2. Vẽ Bar Chart
        renderProductBarChart(products);

    } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
    }
}
function renderProductBarChart(products) {
    const ctx = document.getElementById('productBarChart').getContext('2d');

    // Chuẩn bị dữ liệu: Lấy tên sản phẩm làm nhãn, số lượng làm giá trị
    const labels = products.map(p => p.productName);
    const values = products.map(p => p.totalQuantitySold);

    if (productChartInstance) productChartInstance.destroy();

    productChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng đã bán',
                data: values,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // Chuyển thành biểu đồ cột ngang
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Ẩn chú thích vì đã có nhãn trục Y
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { display: false }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        // Rút gọn tên sản phẩm nếu quá dài trên biểu đồ
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.substring(0, 15) + '...' : label;
                        }
                    }
                }
            }
        }
    });
}

// ===== LOAD =====
window.onload = () => {
    const now = new Date();
    const year = now.getFullYear();
    
    // Thiết lập giá trị mặc định cho các input ngày
    const firstDayOfYear = `${year}-01-01`;
    const todayStr = now.toISOString().split('T')[0];

    // Input cho Tab Doanh thu (Lọc theo ngày)
    document.getElementById("dateFrom").value = firstDayOfYear;
    document.getElementById("dateTo").value = todayStr;
    document.getElementById("yearInput").value = year;

    // Input cho Tab Sản phẩm (Lọc theo datetime-local)
    const startOfYearISO = new Date(year, 0, 1, 7, 0).toISOString().slice(0, 16);
    const nowISO = new Date().toISOString().slice(0, 16);
    document.getElementById("startDate").value = startOfYearISO;
    document.getElementById("endDate").value = nowISO;

    // Gọi load dữ liệu mặc định
    handleLoadAllStatistics();
    loadTopUsers();
    loadTopProducts();
};
// Vẽ biểu đồ
let monthChartInstance = null;
let dayChartInstance = null;

// ===== HÀM XỬ LÝ CHUNG =====
async function handleLoadAllStatistics() {
    await loadRevenue();     // Vẽ biểu đồ cột tháng & bảng
    await loadDailyChart();  // Vẽ biểu đồ đường ngày
}

async function loadRevenue() {
    const year = document.getElementById('yearInput').value;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API}/statistics/revenue?year=${year}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.code === 1000) {
            renderRevenueTable(data.result);
            renderMonthChart(data.result); 
        }
    } catch (error) {
        console.error("Lỗi loadRevenue:", error);
    }
}
function renderMonthChart(data) {
    const canvas = document.getElementById('monthChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const labels = Array.from({length: 12}, (_, i) => `T${i + 1}`);
    const values = new Array(12).fill(0);
    
    data.forEach(item => { values[item.month - 1] = item.totalRevenue; });

    if (monthChartInstance) monthChartInstance.destroy();

    monthChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}
// 2. BIỂU ĐỒ THEO NGÀY (Dữ liệu từ /orders?from=...&to=...)
async function loadDailyChart() {
    const from = document.getElementById('dateFrom').value;
    const to = document.getElementById('dateTo').value;
    if (!from || !to) return;

    const token = localStorage.getItem("token");
    const fromISO = formatLocalDateTime(from);
    const toISO = formatLocalDateTime(to, true);

    try {
        const res = await fetch(`${API}/statistics/orders?from=${fromISO}&to=${toISO}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        console.log(data);
        if (data.code === 1000) {
            processAndRenderDayChart(data.result);
        }
    } catch (err) { console.error("Lỗi loadDailyChart:", err); }
}

function processAndRenderDayChart(orders) {
    const dailyData = {};
    
    // Nhóm dữ liệu
    orders.forEach(order => {
        const date = order.createdAt.split('T')[0];
        dailyData[date] = (dailyData[date] || 0) + order.totalAmount;
    });

    const sortedDates = Object.keys(dailyData).sort();
    const values = sortedDates.map(date => dailyData[date]);

    const canvas = document.getElementById('dayChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (dayChartInstance) dayChartInstance.destroy();

    dayChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Doanh thu ngày (VND)',
                data: values,
                borderColor: '#ff6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}
function formatLocalDateTime(dateStr, isEnd = false) {
    return isEnd 
        ? `${dateStr}T23:59:59`
        : `${dateStr}T00:00:00`;
}