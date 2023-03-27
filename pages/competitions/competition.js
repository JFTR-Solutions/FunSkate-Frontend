import { API_URL } from "../../settings.js";
import {
  hideLoading,
  sanitizeStringWithTableRows,
  showLoading,
} from "../../utils.js";

const URL = API_URL + "/competitions";
let locationId = null;

export async function initCompetitions() {
  document
    .getElementById("create-competition-button")
    .addEventListener("click", createCompetition);
  clearTable();
  showTable();
  doubleClickRow();
}

async function showTable() {
  showLoading();
  try {
    const competitions = await fetch(URL).then((res) => res.json());
    createTable(competitions);
    addSearchListener(competitions);
  } catch (err) {
    hideLoading();
    console.log(err.message);
  } finally {
    hideLoading();
  }
}

function fetchLocations() {
  const URL = API_URL + "/locations";
  return fetch(URL).then((res) => res.json());
}

function checkDates() {
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
}

async function createCompetition() {
  // Get the modal element
  const modal = document.getElementById("create-competition-modal");

  // Get the form element
  const form = document.getElementById("create-competition-form");

  checkDates();

  const startDateField = document.getElementById("start-date");
  const endDateField = document.getElementById("end-date");
  const deadlineField = document.getElementById("deadline");
  const locationField = document.getElementById("location");
  const competitionTypeField = document.getElementById("competition-type");

  // Fetch the locations and populate the locationField
  const locations = await fetchLocations();
  locationField.innerHTML =
    '<option value="" disabled selected>Vælg on lokation</option>';

  // Add the rest of the options
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
      <option value="finals">Finals</option>
    `;
  });
  // Show the modal when the "Create Competition" button is clicked
  modal.style.display = "block";

  // Hide the modal when the user clicks on the close button
  document
    .getElementById("close-modal-button")
    .addEventListener("click", () => {
      modal.style.display = "none";
    });

  // Handle form submission
  form.addEventListener("submit", async (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    const location = await getLocationById(locationField.value);

    // Create a new CompetitionRequest object
    const competition = {
      startDate: startDateField.value,
      endDate: endDateField.value,
      deadline: deadlineField.value,
      location: location,
      competitionType: competitionTypeField.value,
    };

    // Submit the competition request to the server
    const response = await fetch(API_URL + "/competitions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(competition),
    });

    if (response.ok) {
      clearTable();
      showTable();
      clearCreateForm();

      // The competition was created successfully
      modal.style.display = "none";
      // TODO: Show a success message to the user
    } else {
      // There was an error creating the competition
      // TODO: Show an error message to the user
    }
  });
}

function clearCreateForm() {
  const dateInputs = document.querySelectorAll(".dates");
  dateInputs.forEach((input) => {
    input.value = "";
  });

  document.getElementById("competition-type").innerHTML = `<option></option>`;
}

async function getLocationById(id) {
  const location = await fetch(API_URL + "/locations/" + id).then((res) =>
    res.json()
  );
  return location;
}

function createTable(competitions) {
  const competitionTypeTranslations = {
    WEST: "Vest",
    EAST: "Øst",
    FINALS: "Finale",
  };
  const tableRows = competitions
    .map(
      (competition) => `
      <tr>
        <td>${competition.id}</td>
        <td>${competition.startDate}</td>
        <td>${competition.endDate}</td>
        <td>${competition.deadline}</td>
        <td>${competitionTypeTranslations[competition.competitionType]}</td>
        <td>${competition.location.name}</td>
      </tr>`
    )
    .join("");
  const tableRowsSan = sanitizeStringWithTableRows(tableRows);
  document.getElementById("table-rows").innerHTML = tableRowsSan;
}

function clearTable() {
  document.getElementById("table-rows").innerHTML = "";
}

function addSearchListener(competitions) {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredCompetitions = competitions.filter(
      (competition) =>
        Object.values(competition).some((value) =>
          value.toString().toLowerCase().includes(searchTerm)
        ) || competition.location.name.toLowerCase().includes(searchTerm)
    );
    showTable(filteredCompetitions);
  });
}

function doubleClickRow() {
  const table = document.querySelector(".table");
  table.addEventListener("dblclick", function (event) {
    const target = event.target.parentNode;
    if (
      target.tagName.toLowerCase() === "tr" &&
      target.parentNode.tagName.toLowerCase() === "tbody"
    ) {
      // Handle double click on table row here
      const id = target.querySelector("td:first-child").textContent;
      router.navigate(`/add-participant/${id}`);
    }
  });
}
