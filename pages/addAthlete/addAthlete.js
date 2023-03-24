import { API_URL } from "../../settings.js"
import { encode} from "../../utils.js";
const ATHLETE_URL = API_URL + "/athletes"
const CLUB_URL = API_URL + "/clubs"

let clubById = null;


export async function initAddAthlete() {
  clearInput();
  clearMsg();
  document.getElementById("btn-submit-athlete").onclick = addAthlete;
}


function fetchClub(){
    const id = document.getElementById("club-id").value
    const options = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    return fetch(CLUB_URL+"/"+id, options)
    .then(res => {
        if(!res.ok){
            return Promise.reject("Klub ikke fundet") 
        }
        return res.json()
    })
    .then(data => {
        clubById = data;
        return data;
    });
}


function addAthlete(){
    fetchClub().then(clubData => { // Call fetchClub() and get the clubData
        const athlete = {
            firstName: encode(document.getElementById("first-name").value),
            lastName: encode(document.getElementById("last-name").value),
            birthdate: encode(document.getElementById("birthdate").value),
            clubMark: encode(document.getElementById("club-mark").value),
            competitionNumber: encode(document.getElementById("comp-number").value),
            club: clubData // Use the clubData
        };

        fetch(ATHLETE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(athlete),
        })
        .then((res) => res.json())
        .then((athlete) => {
            document.getElementById("success-msg").innerText = "Tilføjet følgende løber:"
            document.getElementById("added-athlete").innerHTML = 
            `Efternavn: ${athlete.lastName} - Fornavn: ${athlete.firstName} - 
            Fødselsdag: ${athlete.birthdate} - Klubmærke: ${athlete.clubMark} -
            Klubmærke: ${athlete.clubMark} - Konkurrencenummer: ${athlete.competitionNumber}`;
            clearInput()
        })
        .catch((error) => {
            document.getElementById("error-msg").innerText = error
            clearInput()
        });
    })
}

  function clearInput(){
    document.getElementById("first-name").value = ""
    document.getElementById("last-name").value = ""
    document.getElementById("club-mark").value = ""
    document.getElementById("comp-number").value = ""
    document.getElementById("club-id").value = ""
    document.getElementById("birthdate").value = ""
}

 function clearMsg(){
  document.getElementById("success-msg").innerText = ""
  document.getElementById("error-msg").innerText = ""
  document.getElementById("added-athlete").innerHTML = ""
}
