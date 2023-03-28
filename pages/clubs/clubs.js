import { API_URL } from "../../settings.js"
import { checkAndRedirectIfNotLoggedIn } from "../../auth.js";
import { hideLoading, showLoading } from "../../utils.js";
const URL = API_URL + "/clubs"

export async function initClubs() {
  if (checkAndRedirectIfNotLoggedIn()) {
    return;
  }
    clearBoxes();
    showLoading();
    try {
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("token");
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
      const clubs = await fetch(URL,options).then((res) => res.json());
      showBoxes(clubs);
    } catch (err) {
      hideLoading();
      showError(err.message);
    } finally {
      hideLoading();
    }
  }


  
  function showBoxes(clubs) {
    const boxes = clubs.map((club) => `
      <div class="club-box">
        <div class="club-logo-container">
          <img src="/images/clubLogos/${club.id}.png" alt="${club.name}" class="club-logo">
        </div>
        <div class="club-info" style="visibility:hidden">
          <h4>${club.name}</h4>
          <p><strong>Skøjtehal:</strong> ${club.location.name}</p>
          <p><strong>Vej:</strong> ${club.location.streetName}</p>
          <p><strong>By:</strong> ${club.location.city}</p>
          <p><strong>Postnummer:</strong> ${club.location.zipCode}</p>
          <p><strong>Region:</strong> ${club.eastWest === 'EAST' ? 'ØST' : 'VEST'}</p>
        </div>
      </div>`
    ).join("");
    document.getElementById("club-boxes").innerHTML = boxes;
  
    // attach onclick event to each club-box element
    const clubBoxes = document.getElementsByClassName("club-box");
    for (let i = 0; i < clubBoxes.length; i++) {
      clubBoxes[i].addEventListener("dblclick", function() {
        showInfo(this);
      });
    }
  }
  
  function clearBoxes() {
    document.getElementById("club-boxes").innerHTML = "";
  }
  
  function showError(message) {
    document.getElementById("error").textContent = message;
  }
  
  function showInfo(box) {
    const clubBox = box.closest(".club-box");
    const infoBox = clubBox.querySelector(".club-info");
    const logoImg = clubBox.querySelector(".club-logo");
    clubBox.classList.toggle("expanded");
    if (clubBox.classList.contains("expanded")) {
      infoBox.style.visibility = "visible";
      logoImg.classList.add("blur");
      clubBox.style.height = clubBox.offsetHeight + infoBox.offsetHeight + "px";
    } else {
      infoBox.style.visibility = "hidden";
      logoImg.classList.remove("blur");
      clubBox.style.height = ""; // reset the height to its original value
    }
  }
  
  
  