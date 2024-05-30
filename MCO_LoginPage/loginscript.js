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
    if (wrapper.classList.contains('action-popup')) {
        wrapper.classList.remove('action-popup');
        console.log('removed action-popup');
    } else {
        wrapper.classList.add('action-popup'); 
        console.log('added action-popup');
    }
})
