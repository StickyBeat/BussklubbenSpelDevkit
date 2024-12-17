// Här skriver du koden för ditt spel! JavsScript eller TypeScript

const MODE_MENU = "menu";
const MODE_GAME = "game";
const MODE_GAME_OVER = "game-over";

let gameMode = MODE_MENU;

let gameRunning = false;

// Enklast är att göra canvasbaserade spel
let canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let textY;

// Det är bra att ha en reset-metod för att nollställa allt i sitt spel när man startar om det
let resetGame = () => {
  textY = 0;
};

// Här registrerar du en callback som Bussklubben-apiet kör när spelet startas - ClubHouseGame.registerRestart
window.ClubHouseGame.registerRestart(() => {
  gameMode = MODE_GAME;
  resetGame();

  // För att testa så sätter vi en timeout som avslutar spelet efter 3 sekunder - ClubHouseGame.gameDone
  setTimeout(() => {
    gameMode = MODE_GAME_OVER;
    // ClubHouseGame.setScore använder man för att sätta poängen i spelet
    window.ClubHouseGame.setScore(1337);
    window.ClubHouseGame.gameDone();
  }, 3000);
});

// Efter att spelet laddat in alla filer och är redo att startas så anropar vi ClubHouseGame.gameLoaded
// Här fejkar vi laddningstid med en timeout
setTimeout(() => {
  // Alternativet "hideInGame" kan man sätta till true om man vill sköta visningen av poäng själv
  window.ClubHouseGame.gameLoaded({
    hideInGame: false,
  });
}, 1000);

// Här är en enkel update-loop som körs varje frame
// Är spelet igång så skriver vi det på vår canvas
let update = () => {
  let canvas = document.getElementById("game");
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameMode === MODE_GAME) {
    textY += 2;
    ctx.fillStyle = "white";
    ctx.font = "48px serif";
    ctx.fillText("Spelet är igång", 10, 50 + textY);
  }

  if (gameMode === MODE_GAME_OVER) {
    ctx.fillStyle = "white";
    ctx.font = "48px serif";
    ctx.fillText("The end", 10, 50);
  }

  requestAnimationFrame(update);
};

update();
