import { API_URL } from "../../settings.js"
import { hideLoading, sanitizeStringWithTableRows, showLoading } from "../../utils.js";
const URL = API_URL + "/athletes"

export async function initAthletes() {
    clearTable();
    showLoading();
    try {
      const athletes = await fetch(URL).then((res) => res.json());
      showClubs(athletes);
    } catch (err) {
      hideLoading();
      alert(err.message)
    } finally {
      hideLoading();
    }
  }

  function showClubs(athletes){
    const tableRows = athletes.map((athlete) => `
      <tr>
      <td>${athlete.lastName}</td>
      <td>${athlete.firstName}</td>
      <td>${athlete.birthdate}</td>
      <td>${athlete.clubMark}</td>
      <td>${athlete.competitionNumber}</td>
      <td>${athlete.club.name}</td>
      <td><img src="/images/clubLogos/${athlete.club.id}.png" width=60"></td>
      </tr>`
      ).join("");
    const tableRowsSan = sanitizeStringWithTableRows(tableRows);
    document.getElementById("table-rows").innerHTML = tableRowsSan;
  }

  function clearTable(){
    document.getElementById("table-rows").innerHTML = "";
  }