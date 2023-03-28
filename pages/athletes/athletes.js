import { API_URL } from "../../settings.js"
import { hideLoading, sanitizeStringWithTableRows, showLoading } from "../../utils.js";
import { checkAndRedirectIfNotLoggedIn } from "../../auth.js";
const URL = API_URL + "/athletes"
const CLUB_URL = API_URL + "/clubs"

let clubById = null;
const token = localStorage.getItem("token");

export async function initAthletes() {
  if (checkAndRedirectIfNotLoggedIn()) {
    return;
  }
    clearTable();
    showLoading();
    try {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const athletes = await fetch(URL,options).then((res) => res.json());
      showTable(athletes);
      addSearchListener(athletes);
      addRowListeners(athletes);
    } catch (err) {
      hideLoading();
      console.log(err.message)
    } finally {
      hideLoading();
    }
  }
  function showTable(athletes) {
    const tableRows = athletes
      .map(
        (athlete) => `
        <tr>
          <td>${athlete.lastName}</td>
          <td>${athlete.firstName}</td>
          <td>${athlete.birthdate}</td>
          <td>${athlete.clubMark}</td>
          <td>${athlete.competitionNumber}</td>
          <td>${athlete.clubResponse.abbreviation}</td>
          <td><img src="/images/clubLogos/${athlete.clubResponse.id}.png" width=60"></td>
        </tr>`
      )
      .join("");
    const tableRowsSan = sanitizeStringWithTableRows(tableRows);
    document.getElementById("table-rows").innerHTML = tableRowsSan;
  }

  function clearTable(){
    document.getElementById("table-rows").innerHTML = "";
  }

  function addSearchListener(athletes) {
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredAthletes = athletes.filter(athlete =>
        Object.values(athlete).some(value =>
          value.toString().toLowerCase().includes(searchTerm)
        ) || athlete.clubResponse.abbreviation.toLowerCase().includes(searchTerm)
          || athlete.clubResponse.name.toLowerCase().includes(searchTerm)
      );
      showTable(filteredAthletes);
    });
  }

  function addRowListeners(athletes) {
    const rows = document.querySelectorAll("#table-rows tr");
    rows.forEach((row, index) => {
      row.addEventListener("dblclick", () => {
        showEditModal(athletes[index]);
      });
    });
  }

  function showEditModal(athlete) {
    document.getElementById("edit-lastName").value = athlete.lastName;
    document.getElementById("edit-firstName").value = athlete.firstName;
    document.getElementById("edit-birthdate").value = athlete.birthdate;
    document.getElementById("edit-clubMark").value = athlete.clubMark;
    document.getElementById("edit-competitionNumber").value = athlete.competitionNumber;
    document.getElementById("edit-club-id").value = athlete.clubResponse.id;
    document.getElementById("edit-save-btn").onclick = () => saveEditAthlete(athlete);


    const modal = new bootstrap.Modal(document.getElementById("edit-modal"), {
      focus: true,
      backdrop: false,
    });
    modal.show();
  }

  async function saveEditAthlete(athlete) {
    const updatedAthlete = {
      id: athlete.id,
      lastName: document.getElementById("edit-lastName").value,
      firstName: document.getElementById("edit-firstName").value,
      birthdate: document.getElementById("edit-birthdate").value,
      clubMark: document.getElementById("edit-clubMark").value,
      competitionNumber: document.getElementById("edit-competitionNumber").value,
      club: await fetchClub(document.getElementById("edit-club-id").value)
  };

  try {
    const response = await fetch(URL + `/${athlete.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedAthlete),
    });

    if (!response.ok) {
      throw new Error("Error updating athlete");
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById("edit-modal"));
    modal.hide();
    initAthletes();
    document.getElementById("edit-status").innerHTML = "";

  } catch (error) {
    document.getElementById("edit-status").innerHTML = `<span style="color:red;">${error.message}</span>`;
  }
}


async function fetchClub(id){
  try {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(CLUB_URL+"/"+id, options);

    if (!response.ok) {
      throw new Error("Error fetching club");
    }

    const club = await response.json();
    return club;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

 