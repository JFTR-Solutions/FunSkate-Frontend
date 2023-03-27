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
import {initLogin} from "./pages/login/login.js";
import { checkIfLoggedIn } from "./auth.js";


window.addEventListener("load", async () => {
  const templateClubs = await loadHtml("./pages/clubs/clubs.html");
  const templateAthletes = await loadHtml("./pages/athletes/athletes.html");
  const templateNotFound = await loadHtml("./pages/notFound/notFound.html");
  const templateAddAthlete = await loadHtml("./pages/addAthlete/addAthlete.html");
  const templateCompetition = await loadHtml("./pages/competitions/competition.html");
  const templateLogin = await loadHtml("./pages/login/login.html")

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
      
    })
    
    .notFound(() => {
      renderTemplate(templateNotFound, "content");
    })
    .resolve();
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