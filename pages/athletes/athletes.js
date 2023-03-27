import { API_URL } from "../../settings.js"
import { hideLoading, sanitizeStringWithTableRows, showLoading } from "../../utils.js";
import { checkAndRedirectIfNotLoggedIn } from "../../auth.js";
const URL = API_URL + "/athletes"
const CLUB_URL = API_URL + "/clubs"

let clubById = null;

export async function initAthletes() {
  if (checkAndRedirectIfNotLoggedIn()) {
    return;
  }
    clearTable();
    showLoading();
    try {
      const athletes = await fetch(URL).then((res) => res.json());
      showTable(athletes);
      addSearchListener(athletes);
    } catch (err) {
      hideLoading();
      alert(err.message)
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
          <td>${athlete.club.name}</td>
          <td><img src="/images/clubLogos/${athlete.club.id}.png" width=60"></td>
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
        ) || athlete.club.name.toLowerCase().includes(searchTerm)
      );
      showTable(filteredAthletes);
    });
  }

 