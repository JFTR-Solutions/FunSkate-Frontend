import { checkIfLoggedIn } from "../../auth.js";
import { API_URL } from "../../settings.js";
import { sanitizeStringWithTableRows } from "../../utils.js";
import { updateRestrictedLinks } from "../../auth.js";
import { handleHttpErrors, encode } from "../../utils.js";
import {hideLoading,showLoading} from "../../utils.js";

const URL = API_URL + "/login";

export function initLogin() {
  document.getElementById("error").innerText = localStorage.getItem("error");
  const token = localStorage.getItem("token");

  document.getElementById("loginBtn").onclick = login;

  if (checkIfLoggedIn() !== "anonymous") {
    window.router.navigate("");
  }
  


  document.getElementById("password").addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("loginBtn").click();
    }
  });
  document.getElementById("username").addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("loginBtn").click();
    }
  });

}

async function login(evt) {
  
  document.getElementById("error").innerText = "";

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const dtoBody = { username, password };
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dtoBody),
  };

  try {
    showLoading();
    // Make a POST request to the login endpoint
    const response = await fetch(API_URL + "/auth/login", options).then((res) =>
      handleHttpErrors(res)
    );
    localStorage.setItem("username", response.username);
    const token = localStorage.setItem("token", response.token);
    localStorage.setItem("roles", JSON.stringify(response.roles));
    updateRestrictedLinks();
    document.getElementById("login-id").style.display = "none";
    document.getElementById("logout-id").style.display = "block";
    
    window.router.navigate("");
    location.reload();
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.textContent = "Logout";
    loginBtn.onclick = logout;
    localStorage.removeItem("error");
  } catch (err) {
    
    console.log(err.message);
    localStorage.setItem("error", err.message);
    document.getElementById("error").innerText = localStorage.getItem("error");
  }
}

export function logout() {
  localStorage.clear();
  updateRestrictedLinks();
  document.getElementById("login-id").style.display = "block";
  document.getElementById("logout-id").style.display = "none";
  window.location.href = "/";
}
