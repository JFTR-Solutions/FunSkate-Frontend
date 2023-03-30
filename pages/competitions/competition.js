import { API_URL } from "../../settings.js";
import { checkAndRedirectIfNotLoggedIn, updateRestrictedLinks } from "../../auth.js";
import {
  hideLoading,
  sanitizeStringWithTableRows,
  showLoading,
} from "../../utils.js";

const URL = API_URL + "/competitions";
let locationId = null;
const username = localStorage.getItem("username");
const token = localStorage.getItem("token");

export function initCompetitions() {
  if (checkAndRedirectIfNotLoggedIn()) {
    return;
  }
  updateRestrictedLinks()
  showTable();
  const createCompetitionButton = document.getElementById("create-competition-button");
  createCompetitionButton.removeEventListener("click", createCompetition);
  createCompetitionButton.addEventListener("click", createCompetition);
}

async function showTable() {
  showLoading();
  try {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const competitions = await fetch(URL, options).then((res) => res.json());
    createCompetitionGrid(competitions);
    addBoxListeners(competitions);
  } catch (err) {
    hideLoading();
    console.log(err.message);
  } finally {
    hideLoading();
  }
}

function fetchLocations() {
  try {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const URL = API_URL + "/locations";
    return fetch(URL, options).then((res) => res.json());
  } catch (error) {
    console.log(error.message);
  }
}

/*function checkDates() {
  const startDate = document.getElementById("start-date");
  const endDate = document.getElementById("end-date");
  const deadline = document.getElementById("deadline");

  // Set minimum and maximum dates for start date
  startDate.setAttribute("min", new Date().toISOString().split("T")[0]);
  endDate.setAttribute("min", startDate.value);

  // Set minimum and maximum dates for end date
  endDate.setAttribute("min", startDate.value);
  endDate.setAttribute(
    "max",
    new Date("2050-01-01").toISOString().split("T")[0]
  );

  // Set minimum and maximum dates for deadline
  deadline.setAttribute("min", new Date().toISOString().split("T")[0]);
  deadline.setAttribute("max", startDate.value);

  // Update min and max dates for end date whenever start date changes
  startDate.addEventListener("input", () => {
    endDate.setAttribute("min", startDate.value);
  });

  // Update max date for deadline whenever start date changes
  startDate.addEventListener("input", () => {
    deadline.setAttribute("max", startDate.value);
  });

  // Update min date for end date whenever end date changes
  endDate.addEventListener("input", () => {
    startDate.setAttribute("max", endDate.value);
  });

  // Update max date for deadline whenever deadline changes
  deadline.addEventListener("input", () => {
    startDate.setAttribute("min", deadline.value);
  });
}*/

function checkDates() {
  const startDate = document.getElementById("start-date");
  const endDate = document.getElementById("end-date");
  const deadline = document.getElementById("deadline");

  const today = new Date().toISOString().split("T")[0];

  startDate.setAttribute("min", today);
  endDate.setAttribute("min", today);
  endDate.setAttribute("max", "2050-01-01");

  startDate.addEventListener("input", () => {
    endDate.setAttribute("min", startDate.value);
    deadline.setAttribute("max", startDate.value);
  });

  endDate.addEventListener("input", () => {
    startDate.setAttribute("max", endDate.value);
  });

  deadline.addEventListener("input", () => {
    startDate.setAttribute("min", deadline.value);
  });
}


async function createCompetition() {
  const modal = new bootstrap.Modal(document.getElementById("competition-modal"), {
    focus: true,
    backdrop: false,
  });
  modal.show();
  // Get the form element
  const form = document.getElementById("create-competition-form");

  checkDates();

  const startDateField = document.getElementById("start-date");
  const endDateField = document.getElementById("end-date");
  const deadlineField = document.getElementById("deadline");
  const locationField = document.getElementById("location");
  const competitionTypeField = document.getElementById("competition-type");

  // Fetch the locations and populate the locationField
  locationField.innerHTML =
    '<option value="" disabled selected>Vælg on lokation</option>';
  const locations = await fetchLocations();
  locations.forEach((location) => {
    locationField.insertAdjacentHTML(
      "beforeend",
      `<option value="${location.id}">${location.name}</option>`
    );
  });

  locationField.addEventListener("change", async () => {
    const location = await getLocationById(locationField.value);
    const postalCode = location.zipCode;
    const defaultCompetitionType = postalCode.charAt(0) >= 5 ? "Vest" : "Øst";
    const compType = defaultCompetitionType === "Vest" ? "WEST" : "EAST";
    competitionTypeField.innerHTML = `
      <option value="${compType}" selected>${
      defaultCompetitionType.charAt(0).toUpperCase() +
      defaultCompetitionType.slice(1)
    }</option>
      <option value="FINALS">Finals</option>
    `;
  });

  // Remove any existing "submit" event listeners as without it it will keep running and do doublicate requests
  form.removeEventListener("submit", formSubmitHandler);

  // Add a "submit" event listener
  form.addEventListener("submit", formSubmitHandler);
}

async function formSubmitHandler(event) {
  await saveCompetitions() 
}

async function saveCompetitions(){
  const competition = {
    startDate: document.getElementById("start-date").value,
    endDate: document.getElementById("end-date").value,
    deadline: document.getElementById("deadline").value,
    location: await getLocationById(document.getElementById("location").value),
    competitionType: document.getElementById("competition-type").value,
};
const response = await fetch(API_URL + "/competitions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(competition),
});
if (!response.ok) {
  return;
}
initCompetitions();
clearModalContent();
const modal = bootstrap.Modal.getInstance(document.getElementById("competition-modal"));
modal.hide();
}



function clearModalContent() {
  const form = document.getElementById("create-competition-form");
  if (form) {
    form.reset();
  }
}

async function getLocationById(id) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const location = await fetch(API_URL + "/locations/" + id,options).then((res) =>
    res.json()
  );
  return location;
}


function addBoxListeners(competitions) {
  const boxes = document.querySelectorAll(".competition-box");
  boxes.forEach((box, index) => {
    box.addEventListener("dblclick", () => {
      router.navigate(`/add-participant/${competitions[index].id}`);
    });
  });
}

function createCompetitionBox(competition) {
  const competitionTypeTranslations = {
    WEST: "Vest",
    EAST: "Øst",
    FINALS: "Finale",
  };
  const box = document.createElement("div");
  box.className = `competition-box competition-box--${competition.competitionType.toLowerCase()}`;
  const content = document.createElement("div");
  content.className = "competition-box__content";
  const type = document.createElement("div");
  type.className = "competition-box__type";
  type.textContent = competitionTypeTranslations[competition.competitionType];
  const location = document.createElement("div");
  location.className = "competition-box__location";
  location.textContent = competition.location.name;
  const startDate = document.createElement("div");
  startDate.className = "competition-box__date";
  startDate.textContent = "Start Dato: " + competition.startDate;
  const endDate = document.createElement("div");
  endDate.className = "competition-box__date";
  endDate.textContent = "Slut Dato: " +competition.endDate;
  const deadline = document.createElement("div");
  deadline.className = "competition-box__deadline";
  deadline.textContent = "Tilmeldingsfrist: " +competition.deadline;
  content.appendChild(type);
  content.appendChild(location);
  content.appendChild(startDate);
  content.appendChild(endDate);
  content.appendChild(deadline);
  box.appendChild(content);
  return box;
}

function createCompetitionGrid(competitions) {
  const competitionGrid = document.querySelector(".competition-grid");

  // Remove all child nodes
  while (competitionGrid.firstChild) {
    competitionGrid.removeChild(competitionGrid.firstChild);
  }

  competitions.forEach((competition) => {
    const box = createCompetitionBox(competition);
    competitionGrid.appendChild(box);
  });
}