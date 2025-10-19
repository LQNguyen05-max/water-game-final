// Game settings (mutable so difficulty can change them)
let dropInterval = 1200; // ms between drops
let dropSpeed = 2; // px per frame
let bucketSpeed = 40; // px per key press
let maxWater = 20; // how many drops to fill the bar
let gameDuration = 60; // seconds per game (depends on difficulty)

// DOM elements
const dropsArea = document.getElementById("drops-area");
const bucket = document.getElementById("bucket");
const scoreSpan = document.getElementById("score");
const waterBarFill = document.getElementById("water-bar-fill");
const modalOverlay = document.getElementById("modal-overlay");
const modalStartBtn = document.getElementById("modal-start-btn");
const gameUI = document.getElementById("game-ui");

// Camel explode SFX element (optional) - loaded from index.html
const camelExplodeSfxEl = document.getElementById("camel-explode-sfx");

function playCamelExplosionSfx() {
  const s = camelExplodeSfxEl || (typeof Audio !== 'undefined' && new Audio('sounds/camel-explode.mp4'));
  if (!s) return;
  try {
    s.currentTime = 0;
    const p = s.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

let drops = [];
let score = 0;
let waterCollected = 0;
let gameActive = false;
let timer = 10;
let timeInterval = null;

// Update score display and water bar
function updateScoreAndBar() {
  scoreSpan.textContent = score;
  waterBarFill.style.width = (waterCollected / maxWater) * 100 + "%";
  const footerFill = document.getElementById("water-footer-fill");
  const footerText = document.getElementById("water-footer-text");
  if (footerFill) {
    footerFill.style.height = (waterCollected / maxWater) * 100 + "%";
  }
  if (footerText) {
    footerText.textContent = `${waterCollected} / ${maxWater}`;
  }
}

// Update timer display
function updateTimer() {
  document.getElementById("timer").textContent = timer;
}

// Set up bucket movement
let bucketX = window.innerWidth / 2;
function setBucketPosition(x) {
  const bucketEl = document.getElementById("bucket");
  if (!bucketEl) return;
  const areaWidth = dropsArea.offsetWidth;
  const bucketWidth = bucketEl.offsetWidth;
  const minX = 10;
  const maxX = areaWidth - bucketWidth - 10;
  x = Math.max(minX, Math.min(x, maxX));
  bucketEl.style.position = "absolute";
  bucketEl.style.left = x + "px";
  bucketEl.style.bottom = "10px";
  bucketX = x;
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (!gameActive) return;
  if (e.key === "ArrowLeft") setBucketPosition(bucketX - bucketSpeed);
  if (e.key === "ArrowRight") setBucketPosition(bucketX + bucketSpeed);
});

// Touch controls (for mobile)
function attachBucketTouchListener() {
  const bucketEl = document.getElementById("bucket");
  if (!bucketEl) return;
  bucketEl.ontouchmove = function (e) {
    if (!gameActive) return;
    const touch = e.touches[0];
    setBucketPosition(touch.clientX);
  };
}

// Touch controls (for mobile)
bucket.addEventListener("touchmove", (e) => {
  if (!gameActive) return;
  const touch = e.touches[0];
  setBucketPosition(touch.clientX);
});

// Create a new drop at a random x position
function createDrop() {
  const drop = document.createElement("div");
  drop.style.position = "absolute";
  // Spawn drops inside the drops area (not the full window)
  const areaWidth = dropsArea.offsetWidth || window.innerWidth;
  drop.style.left = Math.random() * Math.max(0, areaWidth - 65) + "px";
  drop.style.top = "0px";
  // 25% chance to spawn a bad (brown) drop
  const isBad = Math.random() < 0.25;
  if (isBad) {
    drop.className = "water-drop bad-drop";
    drop.innerHTML = '<img src="img/brown-water-drop.png" alt="bad drop">';
    drop.dataset.bad = "1";
  } else {
    drop.className = "water-drop";
    drop.innerHTML =
      '<img src="https://em-content.zobj.net/source/apple/354/droplet_1f4a7.png" alt="drop">';
    drop.dataset.bad = "0";
  }
  dropsArea.appendChild(drop);
  drops.push(drop);
}

// Animate drops
function animateDrops() {
  if (!gameActive) return;
  const bucketEl = document.getElementById("bucket");
  if (!bucketEl) return;
  const bucketRect = bucketEl.getBoundingClientRect();
  for (let i = drops.length - 1; i >= 0; i--) {
    const drop = drops[i];
    // Swept collision detection to avoid tunneling at high speeds
    const beforeRect = drop.getBoundingClientRect();
    const prevTop = parseFloat(drop.style.top) || 0;
    const newTop = prevTop + dropSpeed;
    drop.style.top = newTop + "px";
    const afterRect = drop.getBoundingClientRect();

    // Build a sweep rectangle that covers the drop's movement this frame
    const sweepRect = {
      left: Math.min(beforeRect.left, afterRect.left),
      right: Math.max(beforeRect.right, afterRect.right),
      top: Math.min(beforeRect.top, afterRect.top),
      bottom: Math.max(beforeRect.bottom, afterRect.bottom),
    };

    // Check overlap between sweep rect and bucket rect
    const overlap =
      sweepRect.right > bucketRect.left &&
      sweepRect.left < bucketRect.right &&
      sweepRect.bottom > bucketRect.top &&
      sweepRect.top < bucketRect.bottom;

    if (overlap) {
      if (drop.parentElement === dropsArea) dropsArea.removeChild(drop);
      drops.splice(i, 1);
      if (drop.dataset.bad === "1") {
        score = Math.max(0, score - 1);
        waterCollected = Math.max(0, waterCollected - 1);
      } else {
        score++;
        waterCollected = Math.min(maxWater, waterCollected + 1);
      }
      updateScoreAndBar();
      continue;
    }

    // Remove drops that fall past the visible dropsArea (use viewport coords)
    const areaRect = dropsArea.getBoundingClientRect();
    if (afterRect.top > areaRect.bottom + 50) {
      if (drop.parentElement === dropsArea) dropsArea.removeChild(drop);
      drops.splice(i, 1);
    }
  }
  requestAnimationFrame(animateDrops);
}

// Drop spawner
function dropSpawner() {
  if (!gameActive) return;
  createDrop();
  setTimeout(dropSpawner, dropInterval);
}

// Difficulty presets (tweak numbers to tune gameplay)
const difficultySettings = {
  easy: {
    dropInterval: 1500,
    dropSpeed: 1.5,
    bucketSpeed: 48,
    maxWater: 15,
    gameDuration: 70,
  },
  medium: {
    dropInterval: 1200,
    dropSpeed: 2.0,
    bucketSpeed: 40,
    maxWater: 20,
    gameDuration: 60,
  },
  hard: {
    dropInterval: 800,
    dropSpeed: 3.0,
    bucketSpeed: 32,
    maxWater: 25,
    gameDuration: 50,
  },
};

let currentDifficulty = "medium";

function applyDifficulty(level) {
  const s = difficultySettings[level] || difficultySettings.medium;
  dropInterval = s.dropInterval;
  dropSpeed = s.dropSpeed;
  bucketSpeed = s.bucketSpeed;
  maxWater = s.maxWater;
  gameDuration = s.gameDuration;
  currentDifficulty = level;
}

// Start game
function startGame() {
  // Read difficulty from UI (if present) and apply
  const sel = document.getElementById("difficulty-select");
  if (sel) applyDifficulty(sel.value);

  // Hide modal, show game UI
  modalOverlay.style.display = "none";
  gameUI.style.display = "";
  // Reset game state
  dropsArea.innerHTML = "";
  // Re-add the bucket image after clearing dropsArea
  const bucketImg = document.createElement("img");
  bucketImg.src = "img/water-can.png";
  bucketImg.alt = "Bucket";
  bucketImg.id = "bucket";
  dropsArea.appendChild(bucketImg);
  // Re-select the bucket element and attach touch listener
  window.bucket = document.getElementById("bucket");
  attachBucketTouchListener();
  setBucketPosition(dropsArea.offsetWidth / 2);
  score = 0;
  waterCollected = 0;
  updateScoreAndBar();
  // Initialize timer from difficulty
  timer = gameDuration;
  updateTimer();

  if (timeInterval) {
    clearInterval(timeInterval);
  }
  timeInterval = setInterval(() => {
    timer--;
    updateTimer();
    // If the timer runs out and user fails to fill the water bar, display a fail screen
    if (timer <= 0 && score < maxWater) {
      // Make a screen to show failure
      clearInterval(timeInterval);
      failedGame();
    } else if (timer <= 0 && score >= maxWater) {
      clearInterval(timeInterval);
      goodGame();
    }
  }, 1000);

  drops = [];
  gameActive = true;

  dropSpawner();
  animateDrops();
}

// End game
function failedGame() {
  gameActive = false;
  const failModal = document.getElementById("fail-screen");
  if (failModal) {
    const finalScoreFail = document.getElementById("final-score-fail");
    if (finalScoreFail) finalScoreFail.textContent = score;
    failModal.style.display = "flex";
  }
  modalOverlay.style.display = "none";
  gameUI.style.display = "none";
  // Add restart button handler
  const failRestartBtn = document.getElementById("fail-restart-btn");
  if (failRestartBtn) {
    failRestartBtn.onclick = function () {
      if (failModal) failModal.style.display = "none";
      modalOverlay.style.display = "flex";
    };
  }
}

function goodGame() {
  gameActive = false;
  gameUI.style.display = "none";

  modalOverlay.style.display = "none";

  const gameContainer = document.getElementById("game-container");
  gameContainer.style.background = "transparent";

  // Show camel end scene
  const scene = document.getElementById("camel-scene");
  scene.style.display = "flex";
  scene.style.background =
    "url('img/village.jpg') center center / cover no-repeat";

  const villageImg = scene.querySelector(".village");
  if (villageImg) villageImg.style.display = "none";

  const canvas = document.getElementById("waterCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  let animationActive = true;

  // After camel walks to the village (5s), hide camel and start water burst
  setTimeout(() => {
    const camelImg = scene.querySelector(".camel img");
    if (camelImg) {
      camelImg.style.display = "none";
      // play explosion SFX when camel pops
      playCamelExplosionSfx();
    }
    for (let i = 0; i < 500; i++) {
      particles.push({
        x: canvas.width * 0.65,
        y: canvas.height * 0.75,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 18 - 4,
        size: Math.random() * 7 + 3,
        alpha: 1,
      });
    }
    animateWater();
    setTimeout(() => {
      animationActive = false;
      scene.style.display = "none";
      scene.style.background = "";
      gameContainer.style.background = "";
      const scoreModal = document.getElementById("score-modal");
      const finalScoreSuccess = document.getElementById("final-score-success");
      if (scoreModal && finalScoreSuccess) {
        finalScoreSuccess.textContent = score;
        scoreModal.style.display = "flex";
      }
      modalOverlay.style.display = "none";
      const returnBtn = document.getElementById("return-btn");
      if (returnBtn) {
        returnBtn.onclick = function () {
          scoreModal.style.display = "none";
          modalOverlay.style.display = "flex";
        };
      }
    }, 5000);
  }, 5000);

  function animateWater() {
    if (!animationActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.alpha -= 0.01;
      ctx.fillStyle = `rgba(47,169,255,${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.alpha <= 0) particles.splice(i, 1);
    }
    requestAnimationFrame(animateWater);
  }

  // (handled above with two chained setTimeouts)
}

// Only start game after clicking Start in modal
window.onload = function () {
  modalOverlay.style.display = "flex";
  gameUI.style.display = "block";
  modalStartBtn.onclick = function () {
    startGame();
  };

  updateScoreAndBar();
  // Show/hide instructions modal
  const instructionsBtn = document.getElementById("modal-instructions-btn");
  const instructionsModal = document.getElementById("instruction-overlay");
  const closeInstructionsBtn = document.getElementById(
    "close-instructions-btn"
  );
  if (instructionsBtn && instructionsModal && closeInstructionsBtn) {
    instructionsBtn.onclick = function () {
      instructionsModal.style.display = "flex";
    };
    closeInstructionsBtn.onclick = function () {
      instructionsModal.style.display = "none";
    };
  }
};

// Adjust bucket position on window resize and put it on the ground
window.onresize = function () {
  if (!gameActive) return;
  setBucketPosition(dropsArea.offsetWidth / 2);
};
