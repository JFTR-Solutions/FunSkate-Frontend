import "./navigo.js"; //Will create the global Navigo, with a few changes, object used below
import {
  setActiveLink,
  adjustForMissingHash,
  renderTemplate,
  loadHtml,
} from "./utils.js";

import { initClubs } from "./pages/clubs/clubs.js";
import { initAthletes } from "./pages/athletes/athletes.js";
import { initAddAthlete } from "./pages/addAthlete/addAthlete.js";
import { initCompetitions } from "./pages/competitions/competition.js";
import {initLogin, logout} from "./pages/login/login.js";
import { checkIfLoggedIn, updateRestrictedLinks } from "./auth.js";
import { initAddParticipant } from "./pages/addParticipant/addParticipant.js";

const login = localStorage.getItem("token")
if ((login)) {
  document.getElementById("login-id").style.display = "none";
  document.getElementById("logout-id").style.display = "block";
}

window.addEventListener("load", async () => {
  const templateClubs = await loadHtml("./pages/clubs/clubs.html");
  const templateAthletes = await loadHtml("./pages/athletes/athletes.html");
  const templateNotFound = await loadHtml("./pages/notFound/notFound.html");
  const templateAddAthlete = await loadHtml("./pages/addAthlete/addAthlete.html");
  const templateCompetition = await loadHtml("./pages/competitions/competition.html");
  const templateLogin = await loadHtml("./pages/login/login.html")
  const templateAddParticipant = await loadHtml("./pages/addParticipant/addParticipant.html")

  adjustForMissingHash();

  const router = new Navigo("/", { hash: true });
  //Not especially nice, BUT MEANT to simplify things. Make the router global so it can be accessed from all js-files
  window.router = router;

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": () => {
        if (checkIfLoggedIn() === "anonymous") {
          window.router.navigate("/login");
          return;
        }
        document.getElementById("content").innerHTML = `
          <img style="width:50%;max-width:600px;margin-top:1em;" src="./images/funskate.png">
        `;
      },
      "/clubs": () => {
        renderTemplate(templateClubs, "content");
        initClubs();
      },
     "/athletes": () => {
        renderTemplate(templateAthletes, "content");
        initAthletes();
      },
      "/add-athlete": () => {
        renderTemplate(templateAddAthlete, "content");
        initAddAthlete();
      },
      "/competitions": () => {
        renderTemplate(templateCompetition, "content")
        initCompetitions();
      },
      "/login": ()=> {
        renderTemplate(templateLogin, "content")
        initLogin();
      },
      "/logout": () => {
        logout();
      },
      
      "/add-participant/:competitionId": (match) => {
        renderTemplate(templateAddParticipant, "content")
        initAddParticipant(match);
      },
    })
    
    .notFound(() => {
      renderTemplate(templateNotFound, "content");
    })
    .resolve();
  router.hooks({
    after: (params) => {
      updateRestrictedLinks();
    },
  });
  
  const token = localStorage.getItem("token");
  const roles = localStorage.getItem("roles");
  
  if (token && roles) {
    updateRestrictedLinks();
  }
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};