$(document).ready(function () {
  /** Define a class for users */
  class Person {
    constructor(username, email, password, usertype) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.usertype = usertype;
    }
  }

  // Sample users for demonstration
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

  // Current user logged in
  let curUser = null;

  // Register functionality
  $(".register-submit").on("click", function (event) {
    event.preventDefault(); // Prevent default form submission
    const username = $("#reg-username").val();
    const email = $("#reg-email").val();
    const password = $("#reg-password").val();
    const usertype = $("#user-type").val();

    // Check for duplicate username or email
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

    // Create a new user and add to users array
    const newUser = new Person(username, email, password, usertype);
    users.push(newUser);
    alert("User successfully registered");
    console.log(users);
  });

  // Login functionality
  $(".login-submit").on("click", function (event) {
    event.preventDefault(); // Prevent default form submission
    const email = $("#login-email").val();
    const password = $("#login-password").val();
    const rememberMe = $("#remember-me").is(":checked");
    let userFound = false;

    // Check for correct login info
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
        $("#welcome-message, header").fadeIn("slow");

        setTimeout(() => {
          $("#welcome-message, header").hide();
          window.location.href = "/reserveSlot";
        }, 2500);
        console.log(curUser); // Log the current user
        break;
      }
    }

    // If user not found
    if (!userFound) {
      curUser = null;
      alert("Invalid username or password");
    }
  });

  // Toggle between login and register forms
  $(".reg-link").on("click", function (event) {
    event.preventDefault();
    $(".wrapper").addClass("action");
  });

  $(".login-link").on("click", function (event) {
    event.preventDefault();
    $(".wrapper").removeClass("action");
  });

  $(".btnLogin-popup").on("click", function () {
    if ($(".wrapper").hasClass("action-popup")) {
      $(".wrapper").removeClass("action-popup");
      console.log("Removed action-popup");
    } else {
      $(".wrapper").addClass("action-popup");
      console.log("Added action-popup");
    }
  });
});
