/* ================= LOGIN ================= */

function login(){

  const username = document
    .getElementById("loginUsername")
    .value
    .trim();

  const password = document
    .getElementById("loginPassword")
    .value
    .trim();


  // Demo Login
  if(username === "admin" && password === "1234"){

    localStorage.setItem("lk_logged_in", "true");

    showApp();

  }else{

    alert("Username or Password မှားနေပါတယ်!\n\nDemo: admin / 1234");

  }

}


function logout(){

  localStorage.removeItem("lk_logged_in");

  showLogin();

}


function showApp(){

  const loginPage =
    document.getElementById("loginPage");

  const app =
    document.getElementById("app");


  if(loginPage){

    loginPage.classList.add("hidden");

  }


  if(app){

    app.classList.remove("hidden");

  }


  initApp();

  showPage("sale");

}


function showLogin(){

  const loginPage =
    document.getElementById("loginPage");

  const app =
    document.getElementById("app");


  if(loginPage){

    loginPage.classList.remove("hidden");

  }


  if(app){

    app.classList.add("hidden");

  }

}


/* ================= START APP ================= */

document.addEventListener("DOMContentLoaded", function(){

  const loggedIn =
    localStorage.getItem("lk_logged_in");


  if(loggedIn === "true"){

    showApp();

  }else{

    showLogin();

  }

});
