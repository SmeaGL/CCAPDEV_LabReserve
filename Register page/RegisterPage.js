class userData {
    constructor(username, password, confirmPassword) {
        this.username = username;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }
}

let dbData = [];

function getFormData () {
    var form = document.getElementById("registerForm");

    var u1 = new userData;
    u1.username = form.querySelector('input[name="uname"]').value;
    u1.password = form.querySelector('input[name="pass"]').value;
    u1.confirmPassword = form.querySelector('input[name="confirmPass"]').value;

    if (!checkPassword(u1.password, u1.confirmPassword)) {
        alert("Passwords do not match!");
        return false;
    }

    dbData.push(u1);
    window.location.href = "../Login page/LoginPage.html";
    alert("User successfully registered!");
    return true;
}

function checkPassword (password, confirmPassword) {
    return password === confirmPassword;
}

