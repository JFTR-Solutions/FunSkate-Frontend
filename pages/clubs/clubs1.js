import { API_URL } from "../../settings.js"
import { hideLoading, sanitizeStringWithTableRows, showLoading } from "../../utils.js";
const URL = API_URL + "/clubs"

export async function initClubs() {
    clearTable();
    showLoading();
    try {
      const clubs = await fetch(URL).then((res) => res.json());
      showClubs(clubs);
    } catch (err) {
      hideLoading();
      alert(err.message)
    } finally {
      hideLoading();
    }
  }

  function showClubs(clubs){
    const tableRows = clubs.map((club) => `
      <tr>
        <td>${club.id}</td>
        <td>${club.name}</td>
        <td>${club.location.name}</td>
        <td>${club.location.streetName}</td>
        <td>${club.location.city}</td>
        <td>${club.location.zipCode}</td>
        <td>${club.eastWest === 'EAST' ? 'ØST' : 'VEST'}</td>
      </tr>`
      ).join("");
    const tableRowsSan = sanitizeStringWithTableRows(tableRows);
    document.getElementById("table-rows").innerHTML = tableRowsSan;
  }

  function clearTable(){
    document.getElementById("table-rows").innerHTML = "";
  }