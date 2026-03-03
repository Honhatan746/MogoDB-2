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
// End Menu