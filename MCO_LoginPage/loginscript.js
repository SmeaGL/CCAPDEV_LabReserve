$(document).ready(function() {
/** Create class person and funtions for web app functionality */
class Person {
    constructor(username, email, password, usertype) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.usertype = usertype;
    }
}
const $registerSubmit = $('.register-submit');

$registerSubmit.on('click', function() {
    const username = $('#reg-username').val();
    const email = $('#reg-email').val();
    const password = $('#reg-password').val();
    const usertype = $('#user-type').val();

    const person = new Person(username, email, password, usertype);
    
    console.log(person);
});

/**for css html functions*/

const $wrapper = $('.wrapper');
const $loginlink = $('.login-link');
const $registerlink = $('.reg-link');
const $btnLoginpopup = $('.btnLogin-popup');

$registerlink.on('click', function() {
    $wrapper.addClass('action');
});

$loginlink.on('click', function() {
    $wrapper.removeClass('action');
});

$btnLoginpopup.on('click', function() {
    if ($wrapper.hasClass('action-popup')) {
        $wrapper.removeClass('action-popup');
        console.log('removed action-popup');
    } else {
        $wrapper.addClass('action-popup');
        console.log('added action-popup');
    }
});

});