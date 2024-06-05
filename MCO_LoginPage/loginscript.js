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
const user1 = new Person("alice", "alice@example.com", "password1", "student");
const user2 = new Person("bob", "bob@example.com", "password2", "faculty");
const user3 = new Person("charlie", "charlie@example.com", "password3", "student");
const user4 = new Person("david", "david@example.com", "password4", "faculty");
const users = [user1, user2, user3, user4];

// Current User logged in
let curUser = null;

// Register functionality
const $registerSubmit = $('.register-submit');
$registerSubmit.on('click', function() {
    const username = $('#reg-username').val();
    const email = $('#reg-email').val();
    const password = $('#reg-password').val();
    const usertype = $('#user-type').val();

    // Checks for duplicate username or email
    for(let i = 0; i < users.length; i++) {
        if(users[i].username === username) {
            alert('Username already exists');
            return;
        }
        if(users[i].email === email) {
            alert('Email already in use');
            return;
        }
    }
    // Creates a new user
    const newUser = new Person(username, email, password, usertype);
    if(users.push(newUser)) {
        alert('User successfully registered');
    }
    
    // to check if the user is properly added to the array
    console.log(users);
});

// Login functionality
const $loginSubmit = $('.login-submit');
$loginSubmit.on('click', function() {
    const email = $('#login-email').val();
    const password = $('#login-password').val();
    let userFound = false;

    // Checks for correct login info
    for(let i = 0; i < users.length; i++) {
        if(users[i].email === email && users[i].password === password) {
            userFound = true;
            curUser = users[i];
            window.location.href = 'About.html'; // Redirect to slot availability page
            console.log(curUser);
            
            // Delays alert to allow redirection
            setTimeout(() => { 
                alert('Login successful');
            }, 100);
            break;
        }
    }
    // If user not found
    if(!userFound) {
        curUser = null;
        alert('Invalid username or password');
    }
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