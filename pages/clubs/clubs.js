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
          <h4 class="club-name">${club.name}</h4>
          <p><strong class="location-name">Skøjtehal:</strong> ${club.location.name}</p>
          <p><strong class="street-name">Vej:</strong> ${club.location.streetName}</p>
          <p><strong class="city">By:</strong> ${club.location.city}</p>
          <p><strong class="zip-code">Postnummer:</strong> ${club.location.zipCode}</p>
          <p><strong class="region">Region:</strong> ${club.eastWest === 'EAST' ? 'ØST' : 'VEST'}</p>
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
  const name = encodeURIComponent(infoBox.querySelector("h4").textContent);
  const locationName = encodeURIComponent(infoBox.querySelector("p:nth-child(2)").textContent.split(": ")[1]);
  const streetName = encodeURIComponent(infoBox.querySelector("p:nth-child(3)").textContent.split(": ")[1]);
  const city = encodeURIComponent(infoBox.querySelector("p:nth-child(4)").textContent.split(": ")[1]);
  const zipCode = encodeURIComponent(infoBox.querySelector("p:nth-child(5)").textContent.split(": ")[1]);
  const address = `${streetName}, ${zipCode} ${city}`;
  const logoImg = clubBox.querySelector(".club-logo");
  const logoSrc = logoImg.getAttribute("src");
  document.getElementById("modal-club-logo").src = logoSrc;


  const iframe = document.createElement("iframe");
  iframe.id = "club-info";
  iframe.src = `club-info.html?name=${name}&locationName=${locationName}&streetName=${streetName}&city=${city}&zipCode=${zipCode}&address=${encodeURIComponent(address)}`;
  document.getElementById("modal-iframe-container").appendChild(iframe);

  // Show the modal
  const modal = document.getElementById("modal");
  modal.style.display = "block";

  // Close the modal when the user clicks the close button or outside the modal
  const closeButton = document.querySelector(".close");
  closeButton.onclick = () => {
    modal.style.display = "none";
    document.getElementById("modal-iframe-container").removeChild(iframe);
  };
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      document.getElementById("modal-iframe-container").removeChild(iframe);
    }
  };
  const clubBoxes = document.getElementsByClassName("club-box");
  for (let i = 0; i < clubBoxes.length; i++) {
    const clubBox = clubBoxes[i];
    clubBox.removeEventListener("dblclick", handleDoubleClick);
    clubBox.addEventListener("dblclick", handleDoubleClick);
  }
}


function handleDoubleClick(event) {
  showInfo(event.currentTarget);
}






  
  
  