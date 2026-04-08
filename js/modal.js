// Tag quản lý của nhân viên
function getHeader(){
const headerMenu = document.querySelector(".header_menu");
const headerTool = document.querySelector(".header_tool");
const searchTool = document.querySelector(".searchTool");
if(!headerMenu || !headerTool || !searchTool) return;
let role = localStorage.getItem("role");
if(role === "STAFF"){
    headerMenu.innerHTML = `
        <ul class="menu-tools menu-tools-md">
                    <li class="link-hover pad-1rem"><a title="Home" href="index.html">Trang chủ</a></li>
                    <li class="link-hover pad-1rem"><a title="Infomation about us" href="./about.html">Về nhóm</a></li>
                    <li class="link-hover pad-1rem"><a title="Quản lý sản phẩm" href="productList.html">Quản lý sản phẩm</a></li>
                    <li class="link-hover pad-1rem"><a title="Quản lý người dùng" href="./userList.html">Người dùng</a></li>
                    <li class="link-hover pad-1rem"><a title="Thống kê" href="./statistics.html">Thống kê</a></li>
        </ul>
    `;
    headerTool.innerHTML = `
        <ul class="menu-tools">
                    <li class="link-hover pad-1rem"><a class="userIcon" onclick="locationAuth()" ><i class="ti-user"></i></a></li>
                    <li class="link-hover pad-1rem"><a title="CheckOut" href="./checkout(remake).html"><i class="ti-bag"></i></a></li>
                    <li class="link-hover js-search-icon pad-1rem" ><a title="Search" ><i class="ti-search"></i></a></li>
        </ul>
    `;
    searchTool.innerHTML = `
        <ul class="menu-tools">
                    <li class="link-hover pad-1rem"><a class="userIcon" onclick="locationAuth()" ><i class="ti-user"></i></a></li>
                    <li class="link-hover pad-1rem"><a title="CheckOut" href="./checkout(remake).html"><i class="ti-bag"></i></a></li>
        </ul>
    `;
}else{
    headerMenu.innerHTML = `
        <ul class="menu-tools menu-tools-md">
                    <li class="link-hover pad-1rem"><a title="Home" href="index.html">Trang chủ</a></li>
                    <li class="link-hover pad-1rem"><a title="Infomation about us" href="./about.html">Về nhóm</a></li>
        </ul>
    `;
    headerTool.innerHTML = `
        <ul class="menu-tools">
                    <li class="link-hover pad-1rem"><a title="Shopping cart" href="./cart.html"><i class="ti-shopping-cart"></i></a></li>
                    <li class="link-hover pad-1rem"><a class="userIcon" onclick="locationAuth()" ><i class="ti-user"></i></a></li>
                    <li class="link-hover pad-1rem"><a title="CheckOut" href="./checkout(remake).html"><i class="ti-bag"></i></a></li>
                    <li class="link-hover js-search-icon pad-1rem" ><a title="Search" ><i class="ti-search"></i></a></li>
                </ul>
    `;
    searchTool.innerHTML = `
        <ul class="menu-tools">
                    <li class="link-hover pad-1rem"><a title="Shopping cart" href="./cart.html"><i class="ti-shopping-cart"></i></a></li>
                    <li class="link-hover pad-1rem"><a class="userIcon" onclick="locationAuth()" ><i class="ti-user"></i></a></li>
                    <li class="link-hover pad-1rem"><a title="CheckOut" href="./checkout(remake).html"><i class="ti-bag"></i></a></li>
        </ul>
    `;
}
}
document.addEventListener("DOMContentLoaded", () => {
    getHeader();
});
// Search
const btnsSearch = document.querySelectorAll('.js-search-icon');
const searchModal = document.querySelector('.js_search');
const searchContent = document.querySelector('.js-search_body');

function showModal(){
    
    searchModal.classList.add('open');
    searchContent.classList.add('open');
}
function hideModal() {
    searchModal.classList.remove('open');
    searchContent.classList.remove('open');
  }

btnsSearch.forEach(btnSearch => {
    btnSearch.addEventListener('click', (event)=>{
        event.stopPropagation();
        showModal();
    })
});
searchModal.addEventListener('click', hideModal);

searchContent.addEventListener('click', (event)=>{ // ngăn chặn sự kiện nổi bọt, vì khi nhấn vào các phần tử con thì phần search cũng đóng lại nên phải ngăn chặn nó
    event.stopPropagation();
})
window.addEventListener('scroll', hideModal);
// End Search
// Menu 
const btnsMenuMobile = document.querySelectorAll('.menu-ti-js');
const menuMobile = document.querySelector('.menu-mobile-js');
const menuMobileBody = document.querySelector('.menu-mobile_body');

function showMenuMobile(){
    menuMobile.classList.add('open');
    menuMobileBody.classList.add('open');
}
function hideMenuMobile(){
    menuMobile.classList.remove('open');
    menuMobileBody.classList.remove('open');
}

btnsMenuMobile.forEach(btnMenuMobile => {
    btnMenuMobile.addEventListener('click', showMenuMobile)
});
menuMobile.addEventListener('click', hideMenuMobile);
menuMobileBody.addEventListener('click', (event)=>{
    event.stopPropagation();
});

// Search Prodcut
let timer = null;
const serachInput = document.getElementById("serach_input");
const listProductSearch = document.getElementById("listProductSearch");
serachInput.addEventListener("input", (e) => {
    const keyWord = e.target.value.trim();
    clearTimeout(timer);

    if (keyWord.length === 0) {
        listProductSearch.classList.remove("open");
        setTimeout(() => { listProductSearch.innerHTML = ""; }, 300); // Đợi mờ hết rồi mới xóa chữ
        return;
    }   

    timer = setTimeout(() => {
        searchProduct(keyWord);
    }, 500);
});

async function searchProduct(keyWord) {
    try {
        const res = await fetch(`https://kid-clothes-store.onrender.com/api/v1/products/search?keyword=${encodeURIComponent(keyWord)}`);
        const data = await res.json();
        
        if (data.code === 1000) {
            renderProductSearch(data.result);
            listProductSearch.classList.add("open"); 
        }
    } catch (error) {
        console.error("Lỗi: ", error);
    }
}
function renderProductSearch(products){
    let cart = "";
    console.log(products);
    if(products.length === 0){
        listProductSearch.innerHTML = `<p>Không có sản phẩm nào hết á</p>`;
        return;
    }
    products.forEach(p => {
            cart += `
                <div class="ItemsSearch di-flex">
                                <a href="#" class="frame_img imgSearch"><img class="img-cls" src="${p.images[0]}" alt=""></a>
                                <div class="itemSearchContent">
                                    <a href="#">${p.name}</a>
                                    <p class="heading-pink">${p.price}</p>
                                </div>
                </div>
            `;
    });
    listProductSearch.innerHTML = cart;
}
// End Menu
// Login and Account
const userIcons = document.querySelectorAll("userIcon");
const token = localStorage.getItem("token");
    console.log(token);
    userIcons.forEach(userIcon => {
        if(!token){
            userIcon.title = "Login";
        }else{
            userIcon.title = "My Account";
        }
    })
function locationAuth(){
        if(!token){
            window.location.href = "../login.html";
        }else{
            window.location.href = "../account(remake).html";
        }
}
