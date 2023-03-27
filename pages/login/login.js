import { checkIfLoggedIn } from "../../auth.js";
import { API_URL } from "../../settings.js";
import {
  hideLoading,
  sanitizeStringWithTableRows,
  showLoading,
} from "../../utils.js";
import { updateRestrictedLinks } from "../../auth.js";
import { handleHttpErrors, encode } from "../../utils.js";

const URL = API_URL + "/login";

export function initLogin() {
  document.getElementById("error").innerText = localStorage.getItem("error");
  const token = localStorage.getItem("token");

  document.getElementById("loginBtn").onclick = login;

  if (checkIfLoggedIn() !== "anonymous") {
    window.router.navigate("");
  }
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
    // Make a POST request to the login endpoint
    const response = await fetch(API_URL + "/auth/login", options).then((res) =>
      handleHttpErrors(res)
    );
    localStorage.setItem("username", response.username);
    const token = localStorage.setItem("token", response.token);
    localStorage.setItem("roles", JSON.stringify(response.roles));

    document.getElementById("login-id").style.display = "none";
    document.getElementById("logout-id").style.display = "block";
    window.router.navigate("");
    updateRestrictedLinks(true); // <-- Pass true to updateRestrictedLinks
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.textContent = "Logout";
    loginBtn.onclick = logout;
    localStorage.setItem("error", "");
  } catch (err) {
    console.log(err.message);
  }
}

export function logout() {
  localStorage.clear();
  updateRestrictedLinks(false); // <-- Pass false to updateRestrictedLinks
  document.getElementById("login-id").style.display = "block";
  document.getElementById("logout-id").style.display = "none";
  window.router.navigate("");
}
