function showPage(pageName, clickedEvent) {
  if (clickedEvent) {
    clickedEvent.preventDefault();
  }

  const pages = document.querySelectorAll(".page");
  pages.forEach(function (page) {
    page.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageName);
  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(function (link) {
    link.classList.remove("active");
  });

  if (clickedEvent && clickedEvent.target && clickedEvent.target.classList.contains("nav-link")) {
    clickedEvent.target.classList.add("active");
  }

  window.scrollTo(0, 0);
}

document.addEventListener("DOMContentLoaded", function () {
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", function () {
      showPage("home");
    });
  }
});

let gameState = {
  glucose: 5.0,
  score: 0,
  level: 1,
  carbs: 0,
  insulinUsed: 0,
  gameActive: true,
  gameRunning: false,
  playerX: 50,
  maxGlucose: 15.0,
  minGlucose: 2.0
};

let gameIntervals = [];

const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");

const glucoseDisplays = [
  document.getElementById("glucoseTop"),
  document.getElementById("glucoseBottom")
];

const glucoseBar = document.getElementById("glucoseBar");
const levelTitle = document.getElementById("levelTitle");
const levelDesc = document.getElementById("levelDesc");

const sidebarLevel = document.getElementById("sidebarLevel");
const sidebarScore = document.getElementById("sidebarScore");
const sidebarGlucose = document.getElementById("sidebarGlucose");
const sidebarCarbs = document.getElementById("sidebarCarbs");
const glucoseStatusBox = document.getElementById("glucoseStatusBox");
const sidebarInsulin = document.getElementById("sidebarInsulin");

function updateGlucoseBar() {
  if (!glucoseBar) return;

  const segments = glucoseBar.querySelectorAll(".segment");

  segments.forEach(function (seg) {
    seg.className = "segment";

    if (gameState.glucose < 4.0 || gameState.glucose > 10.0) {
      seg.classList.add("danger");
    } else if (gameState.glucose < 5.0 || gameState.glucose > 8.0) {
      seg.classList.add("warning");
    }
  });
}

function updateDisplays() {
  if (gameState.glucose < gameState.minGlucose) {
    gameState.glucose = gameState.minGlucose;
  }

  if (gameState.glucose > gameState.maxGlucose) {
    gameState.glucose = gameState.maxGlucose;
  }

  const gluc = Math.round(gameState.glucose * 10) / 10;

  glucoseDisplays.forEach(function (el) {
    if (el) {
      el.textContent = gluc.toFixed(1);
    }
  });

  if (scoreDisplay) scoreDisplay.textContent = gameState.score;
  if (sidebarScore) sidebarScore.textContent = gameState.score;
  if (sidebarGlucose) sidebarGlucose.textContent = gluc.toFixed(1);
  if (sidebarCarbs) sidebarCarbs.textContent = gameState.carbs + "g";
  if (sidebarLevel) sidebarLevel.textContent = gameState.level;
  if (sidebarInsulin) sidebarInsulin.textContent = gameState.insulinUsed;

  updateGlucoseBar();
  updateGlucoseStatus();
}

function updateGlucoseStatus() {
  if (!glucoseStatusBox) return;

  if (gameState.glucose < 4.0) {
    glucoseStatusBox.className = "glucose-status status-danger";
    glucoseStatusBox.textContent = "⚠️ Hypoglycemia (Too Low)";
  } else if (gameState.glucose > 10.0) {
    glucoseStatusBox.className = "glucose-status status-danger";
    glucoseStatusBox.textContent = "⚠️ Hyperglycemia (Too High)";
  } else if (gameState.glucose < 5.0 || gameState.glucose > 8.0) {
    glucoseStatusBox.className = "glucose-status status-warning";
    glucoseStatusBox.textContent = "⚡ Warning Zone";
  } else {
    glucoseStatusBox.className = "glucose-status status-safe";
    glucoseStatusBox.textContent = "✅ Normal Range";
  }
}

function createFood() {
  if (!gameArea) return;

  const food = document.createElement("div");
  food.className = "food";

  let types = ["apple", "bread", "candy"];

  if (gameState.level >= 3) {
    types.push("insulin");
  }

  const randomIndex = Math.floor(Math.random() * types.length);
  const type = types[randomIndex];

  food.classList.add(type);

  const x = Math.random() * 80 + 10;
  food.style.left = x + "%";

  gameArea.appendChild(food);

  setTimeout(function () {
    if (food.parentElement) {
      food.remove();
    }
  }, 2500);
}

function startLevel(level) {
  gameState.level = level;
  gameState.glucose = 5.5;
  gameState.carbs = 0;
  gameState.insulinUsed = 0;

  const levelInfo = {
    1: {
      title: "Level 1: Carbs raise BG",
      desc: "Collect food to see how carbohydrates raise blood glucose."
    },
    2: {
      title: "Level 2: Different foods",
      desc: "Different foods give different amounts of carbohydrate."
    },
    3: {
      title: "Level 3: Insulin effect",
      desc: "Insulin now appears and lowers blood glucose."
    },
    4: {
      title: "Level 4: Balance glucose",
      desc: "Keep glucose between 4.0 and 10.0 mmol/L."
    }
  };

  const info = levelInfo[level];

  if (info) {
    if (levelTitle) levelTitle.textContent = info.title;
    if (levelDesc) levelDesc.textContent = info.desc;
  }

  updateDisplays();
}

function clearGameIntervals() {
  for (let i = 0; i < gameIntervals.length; i++) {
    clearInterval(gameIntervals[i]);
  }
  gameIntervals = [];
}

function startGameRound() {
  if (gameState.gameRunning) return;

  clearGameIntervals();

  gameState.gameRunning = true;
  gameState.gameActive = true;
  gameState.score = 0;
  gameState.glucose = 5.0;
  gameState.carbs = 0;
  gameState.insulinUsed = 0;
  gameState.level = 1;
  gameState.playerX = 50;

  const player = document.querySelector(".player");
  if (player) {
    player.style.left = "50%";
  }

  document.querySelectorAll(".food").forEach(function (food) {
    food.remove();
  });

  startLevel(1);

  const physicsInterval = setInterval(function () {
    if (!gameState.gameActive || !gameState.gameRunning) {
      return;
    }

    if (gameState.level === 1) {
      gameState.glucose -= 0.05;
    } else if (gameState.level === 2) {
      gameState.glucose += 0.08;
    } else if (gameState.level === 3) {
      gameState.glucose += 0.10;
    } else if (gameState.level === 4) {
      gameState.glucose += 0.15;
    }

    updateDisplays();
  }, 1200);

  gameIntervals.push(physicsInterval);

  const spawnInterval = setInterval(function () {
    if (!gameState.gameActive || !gameState.gameRunning) {
      return;
    }
    createFood();
  }, 1800);

  gameIntervals.push(spawnInterval);

  const scoreInterval = setInterval(function () {
    if (!gameState.gameActive || !gameState.gameRunning) {
      return;
    }

    gameState.score = gameState.score + 1;
    updateDisplays();

    if (gameState.level === 1 && gameState.score > 10) {
      alert("Level 2!");
      startLevel(2);
    } else if (gameState.level === 2 && gameState.score > 20) {
      alert("Level 3! Insulin is now available.");
      startLevel(3);
    } else if (gameState.level === 3 && gameState.score > 30) {
      alert("Level 4! Keep glucose in the safe range.");
      startLevel(4);
    }
  }, 1000);

  gameIntervals.push(scoreInterval);

  const failureInterval = setInterval(function () {
    if (!gameState.gameRunning) return;

    if (gameState.level === 4) {
      if (gameState.glucose < 4.0 || gameState.glucose > 10.0) {
        gameState.gameActive = false;
        gameState.gameRunning = false;

        const finalGlucose = (Math.round(gameState.glucose * 10) / 10).toFixed(1);

        let msg = "";
        if (gameState.glucose < 4.0) {
          msg = "⚠️ Hypoglycemia! BG too low: " + finalGlucose + " mmol/L";
        } else {
          msg = "⚠️ Hyperglycemia! BG too high: " + finalGlucose + " mmol/L";
        }

        alert("Game Over!\n" + msg + "\nFinal Score: " + gameState.score);
        resetGame();
      }
    }
  }, 500);

  gameIntervals.push(failureInterval);

  const collisionInterval = setInterval(function () {
    if (!gameState.gameRunning) return;

    const player = document.querySelector(".player");
    const foods = document.querySelectorAll(".food");

    if (!player) return;

    foods.forEach(function (food) {
      const playerRect = player.getBoundingClientRect();
      const foodRect = food.getBoundingClientRect();

      if (
        playerRect.left < foodRect.right &&
        playerRect.right > foodRect.left &&
        playerRect.top < foodRect.bottom &&
        playerRect.bottom > foodRect.top
      ) {
        if (food.classList.contains("apple")) {
          gameState.glucose = gameState.glucose + 1.5;
          gameState.carbs = gameState.carbs + 15;
        } else if (food.classList.contains("bread")) {
          const carbs = Math.floor(Math.random() * 21) + 10;
          gameState.glucose = gameState.glucose + carbs / 10;
          gameState.carbs = gameState.carbs + carbs;
        } else if (food.classList.contains("candy")) {
          gameState.glucose = gameState.glucose + 2.0;
          gameState.carbs = gameState.carbs + 25;
        } else if (food.classList.contains("insulin")) {
          gameState.glucose = gameState.glucose - 2.0;
          gameState.insulinUsed = gameState.insulinUsed + 1;
        }

        food.remove();
        updateDisplays();
      }
    });
  }, 100);

  gameIntervals.push(collisionInterval);
}

function resetGame() {
  gameState.gameRunning = false;
  gameState.gameActive = false;

  clearGameIntervals();

  document.querySelectorAll(".food").forEach(function (food) {
    food.remove();
  });

  const player = document.querySelector(".player");
  if (player) {
    player.style.left = "50%";
  }

  gameState.glucose = 5.0;
  gameState.score = 0;
  gameState.level = 1;
  gameState.carbs = 0;
  gameState.insulinUsed = 0;
  gameState.playerX = 50;

  startLevel(1);
  updateDisplays();
}

document.addEventListener("keydown", function (e) {
  if (!gameState.gameRunning) return;

  const player = document.querySelector(".player");
  if (!player) return;

  const moveAmount = 5;

  if (e.key === "ArrowLeft") {
    gameState.playerX = Math.max(10, gameState.playerX - moveAmount);
    player.style.left = gameState.playerX + "%";
    e.preventDefault();
  } else if (e.key === "ArrowRight") {
    gameState.playerX = Math.min(90, gameState.playerX + moveAmount);
    player.style.left = gameState.playerX + "%";
    e.preventDefault();
  }
});

document.addEventListener("touchstart", function (e) {
  if (!gameState.gameRunning) return;

  const player = document.querySelector(".player");
  if (!player) return;

  const screenWidth = window.innerWidth;
  const touchX = e.touches[0].clientX;
  const moveAmount = 5;

  if (touchX < screenWidth / 2) {
    gameState.playerX = Math.max(10, gameState.playerX - moveAmount);
  } else {
    gameState.playerX = Math.min(90, gameState.playerX + moveAmount);
  }

  player.style.left = gameState.playerX + "%";
});

document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (startBtn) {
    startBtn.addEventListener("click", startGameRound);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetGame);
  }

  updateDisplays();
});

function formatGlucose(value) {
  return Math.round(value * 10) / 10;
}

function getGlucoseStatus(glucose) {
  if (glucose < 4.0) return "Hypoglycemia";
  if (glucose > 10.0) return "Hyperglycemia";
  if (glucose < 5.0 || glucose > 8.0) return "Warning";
  return "Normal";
}

function getGameState() {
  return {
    level: gameState.level,
    score: gameState.score,
    glucose: formatGlucose(gameState.glucose),
    carbs: gameState.carbs,
    insulinUsed: gameState.insulinUsed,
    status: getGlucoseStatus(gameState.glucose),
    gameRunning: gameState.gameRunning
  };
}

window.debugGame = function () {
  console.table(getGameState());
};

console.log("Glucose Quest loaded. Type debugGame() in console for stats.");
