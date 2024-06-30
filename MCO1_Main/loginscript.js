$(document).ready(function () {
  /** Create class person and funtions for web app functionality */
  class Person {
    constructor(username, email, password, usertype) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.usertype = usertype;
    }
  }
  const user1 = new Person(
    "Shawn",
    "shawn@example.com",
    "password1",
    "student"
  );
  const user2 = new Person(
    "Aljirah",
    "aljirah@example.com",
    "password2",
    "faculty"
  );
  const user3 = new Person("Mark", "mark@example.com", "password3", "student");
  const user4 = new Person(
    "Andrei",
    "andrei@example.com",
    "password4",
    "faculty"
  );
  const user5 = new Person("admin", "admin", "admin", "faculty");
  const users = [user1, user2, user3, user4, user5];

  // Current User logged in
  let curUser = null;

  // Register functionality
  const $registerSubmit = $(".register-submit");
  $registerSubmit.on("click", function () {
    const username = $("#reg-username").val();
    const email = $("#reg-email").val();
    const password = $("#reg-password").val();
    const usertype = $("#user-type").val();

    // Checks for duplicate username or email
    const isDuplicateName = users.some((user) => user.username === username);
    if (isDuplicateName) {
      alert("Username already exists");
      return;
    }
    const isDuplicateEmail = users.some((user) => user.email === email);
    if (isDuplicateEmail) {
      alert("Email already in use");
      return;
    }

    // Creates a new user
    const newUser = new Person(username, email, password, usertype);
    if (users.push(newUser)) {
      alert("User successfully registered");
    }

    // to check if the user is properly added to the array
    console.log(users);
  });

  // Login functionality
  const $loginSubmit = $(".login-submit");
  $loginSubmit.on("click", function () {
    const email = $("#login-email").val();
    const password = $("#login-password").val();
    const rememberMe = $("#remember-me").is(":checked");
    let userFound = false;

    // Checks for correct login info
    for (let i = 0; i < users.length; i++) {
      if (users[i].email === email && users[i].password === password) {
        userFound = true;
        curUser = users[i];

        // Save login info if remember me is checked
        if (rememberMe) {
          localStorage.setItem("login-email", email);
          localStorage.setItem("login-password", password);
        } else {
          localStorage.removeItem("login-email");
          localStorage.removeItem("login-password");
        }

        $(".wrapper.action-popup").hide();
        $("#welcome-message, header").show();

        setTimeout(() => {
          $("#welcome-message, header").hide();
          window.location.href = "reserveSlot.html";
        }, 2500);
        // to check if the user is properly logged in
        console.log(curUser);
        break;
      }
    }
    // If user not found
    if (!userFound) {
      curUser = null;
      alert("Invalid username or password");
    }
  });

  /**for css html functions*/
  const $wrapper = $(".wrapper");
  const $loginlink = $(".login-link");
  const $registerlink = $(".reg-link");
  const $btnLoginpopup = $(".btnLogin-popup");

  $registerlink.on("click", function () {
    $wrapper.addClass("action");
  });

  $loginlink.on("click", function () {
    $wrapper.removeClass("action");
  });

  $btnLoginpopup.on("click", function () {
    if ($wrapper.hasClass("action-popup")) {
      $wrapper.removeClass("action-popup");
      console.log("removed action-popup");
    } else {
      $wrapper.addClass("action-popup");
      console.log("added action-popup");
    }
  });
});
