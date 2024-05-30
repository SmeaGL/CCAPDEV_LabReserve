const wrapper = document.querySelector('.wrapper');
const loginlink = document.querySelector('.login-link');
const registerlink = document.querySelector('.reg-link');
const btnLoginpopup = document.querySelector('.btnLogin-popup');

registerlink.addEventListener('click', () => {
    wrapper.classList.add('action');
});

loginlink.addEventListener('click', () => {
    wrapper.classList.remove('action');
});

btnLoginpopup.addEventListener('click', () => {
    wrapper.classList.add('action-popup');
})
