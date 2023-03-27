import { API_URL } from "../../settings.js";
import {
  hideLoading,
  sanitizeStringWithTableRows,
  showLoading,
  convertToEuropeanDate,
} from "../../utils.js";

let compId = "";

const URL = API_URL + "/competitions/";
const athletesURL = API_URL + "/athletes";
const eventParticipantURL = API_URL + "/event-participant/";
let participatingAthleteIds;

export async function initAddParticipant(match) {
  clearTables();
  compId = match.data.competitionId;
  setupCompDetails();
  await fetchParticipatingAthletes();
  fetchAthletes(participatingAthleteIds);
  //doubleClickRow();
}

async function setupCompDetails() {
  const compDetails = await fetchCompDetails();
  const euDate = convertToEuropeanDate(compDetails.startDate);
  document.getElementById("comp-details").innerHTML = `
<h1>${compDetails.location.name}</h1>
<div>Start dato: ${convertToEuropeanDate(
    compDetails.startDate
  )}<br>Slut dato: ${convertToEuropeanDate(
    compDetails.endDate
  )}<br>Tilmeldingsfrist: ${convertToEuropeanDate(compDetails.deadline)}</div>
`;
}

async function fetchCompDetails() {
  const compURL = URL + compId;
  const res = await fetch(compURL);
  return await res.json();
}

async function fetchAthletes(participatingAthletes = []) {
  //showLoading();
  try {
    const athletes = await fetch(athletesURL).then((res) => res.json());
    const filteredAthletes = filterAthletes(athletes, participatingAthletes);
    showTable(filteredAthletes);
    doubleClickRow(filteredAthletes);
    //addSearchListener(athletes);
    //addRowListeners(athletes)
  } catch (err) {
    //hideLoading();
    console.log(err.message);
  } finally {
    //hideLoading();
  }
}

function filterAthletes(athletes, participatingAthleteIds) {
  return athletes.filter(athlete => !participatingAthleteIds.includes(athlete.id));
  }

async function fetchParticipatingAthletes() {
  //showLoading();
  try {
    const participatingAthletes = await fetch(eventParticipantURL + compId).then((res) => res.json());
    participatingAthleteIds = participatingAthletes.map(partAthlete => partAthlete.athlete.id);
    showParticipantTable(participatingAthletes);
    //addSearchListener(participatinAthletes);
    //addRowListeners(athletes)
  } catch (err) {
    //hideLoading();
    console.log(err.message);
  } finally {
    //hideLoading();
  }
}

function addSearchListener(athletes) {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredAthletes = athletes.filter(athlete =>
      Object.values(athlete).some(value =>
        value.toString().toLowerCase().includes(searchTerm)
      ) || athlete.club.name.toLowerCase().includes(searchTerm)
    );
    showTable(filteredAthletes);
    //addRowListeners(filteredAthletes);
  });
}

function doubleClickRow(filteredAthletes) {
  const tables = document.querySelectorAll(".table");
  tables.forEach(table => {
    table.addEventListener("dblclick", function (event) {
      const target = event.target.parentNode;
      if (
        target.tagName.toLowerCase() === "tr" &&
        target.parentNode.tagName.toLowerCase() === "tbody"
      ) {
        const tbodyId = target.parentNode.getAttribute('id');
        const dataId = target.getAttribute('data-id');
        if (tbodyId === 'table-rows-not-part') {
          // Handle double click on row in the 'table-rows-not-part' tbody
          console.log("Clicked on row in 'table-rows-not-part'" + dataId);
          showSignUpModal(dataId, filteredAthletes);

        } else if (tbodyId === 'table-rows-part') {
          // Handle double click on row in the 'table-rows-part' tbody
          console.log("Clicked on row in 'table-rows-part'" + dataId);
          //showEditModal(dataId, participatingAthletes);
        }
      }
    });
  });
}

function showTable(athletes) {
  const tableRows = athletes
    .map(
      (athlete) => `
      <tr data-id="${athlete.id}">
        <td>${athlete.lastName}</td>
        <td>${athlete.firstName}</td>
        <td>${convertToEuropeanDate(athlete.birthdate)}</td>
        <td>${athlete.clubMark}</td>
        <td>${athlete.competitionNumber}</td>
        <td>${athlete.clubResponse.abbreviation}</td>
        <td><img src="/images/clubLogos/${athlete.clubResponse.id}.png" width=60"></td>
      </tr>`
    )
    .join("");
  const tableRowsSan = sanitizeStringWithTableRows(tableRows);
  document.getElementById("table-rows-not-part").innerHTML = tableRowsSan;
  
}

function showParticipantTable(participatingAthletes) {
  const tableRows = participatingAthletes
    .map(
      (partAthlete) => `
      <tr data-id="${partAthlete.athlete.id}">
        <td>${partAthlete.athlete.lastName}</td>
        <td>${partAthlete.athlete.firstName}</td>
        <td>${convertToEuropeanDate(partAthlete.athlete.birthdate)}</td>
        <td>${partAthlete.athlete.clubMark}</td>
        <td>${partAthlete.athlete.competitionNumber}</td>
        <td>${partAthlete.athlete.clubResponse.abbreviation}</td>
        <td><img src="/images/clubLogos/${partAthlete.athlete.clubResponse.id}.png" width=60"></td>
        <td><button>Fjern fra konkurrencen</button></td>
      </tr>`
    )
    .join("");
  const tableRowsSan = sanitizeStringWithTableRows(tableRows);
  document.getElementById("table-rows-part").innerHTML = tableRowsSan;
}

function clearTables() {
  document.getElementById("table-rows-not-part").innerHTML = "";
  document.getElementById("table-rows-part").innerHTML = "";
}

function showSignUpModal(id, athletesList) {
  console.log(athletesList)
  const athlete = athletesList.find(a => a.id.toString() === id);
  console.log(athlete);
  if (!athlete) {
    console.log(`Athlete with ID ${id} not found in the list`);
    return;
  }

  console.log(athlete.clubResponse.name)

  document.getElementById("edit-lastName").value = athlete.lastName;
  document.getElementById("edit-firstName").value = athlete.firstName;
  document.getElementById("edit-birthdate").value = athlete.birthdate;
  document.getElementById("edit-clubMark").value = athlete.clubMark;
  document.getElementById("edit-competitionNumber").value = athlete.competitionNumber;
  document.getElementById("edit-club-name").value = athlete.clubResponse.name;
  /*document.getElementById("edit-save-btn").onclick = () => saveEditAthlete(athlete);*/

  const modal = new bootstrap.Modal(document.getElementById("edit-modal"), {
    focus: true,
    backdrop: false,
  });
  modal.show();
  
}
