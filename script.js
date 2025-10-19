// Game settings
const dropInterval = 1200; // ms between drops
const dropSpeed = 2; // px per frame
const bucketSpeed = 40; // px per key press
const maxWater = 20; // how many drops to fill the bar

// DOM elements
const dropsArea = document.getElementById("drops-area");
const bucket = document.getElementById("bucket");
const scoreSpan = document.getElementById("score");
const waterBarFill = document.getElementById("water-bar-fill");
const modalOverlay = document.getElementById("modal-overlay");
const modalStartBtn = document.getElementById("modal-start-btn");
const gameUI = document.getElementById("game-ui");

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
  drop.style.left = Math.random() * (window.innerWidth - 65) + "px";
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
    let top = parseFloat(drop.style.top);
    top += dropSpeed;
    drop.style.top = top + "px";
    const dropRect = drop.getBoundingClientRect();
    // Check collision with bucket
    if (
      dropRect.bottom > bucketRect.top &&
      dropRect.left < bucketRect.right &&
      dropRect.right > bucketRect.left &&
      dropRect.bottom < bucketRect.bottom + 40
    ) {
      dropsArea.removeChild(drop);
      drops.splice(i, 1);
      if (drop.dataset.bad === "1") {
        // Bad drop: lose points and water
        score = Math.max(0, score - 1);
        waterCollected = Math.max(0, waterCollected - 1);
      } else {
        score++;
        waterCollected = Math.min(maxWater, waterCollected + 1);
      }
      updateScoreAndBar();
      continue;
    }
    if (top > window.innerHeight) {
      dropsArea.removeChild(drop);
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

// Start game
function startGame() {
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
  timer = 60;
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
  // Hide modal overlay if shown
  modalOverlay.style.display = "none";

  // Hide the game container's background (remove semi-transparent overlay)
  const gameContainer = document.getElementById("game-container");
  gameContainer.style.background = "transparent";

  // Show camel end scene
  const scene = document.getElementById("camel-scene");
  scene.style.display = "flex";
  // Set the background to the village image
  scene.style.background =
    "url('img/village.jpg') center center / cover no-repeat";

  // Optionally remove the .village image if present
  const villageImg = scene.querySelector(".village");
  if (villageImg) villageImg.style.display = "none";

  const canvas = document.getElementById("waterCanvas");
  const ctx = canvas.getContext("2d");

  // Fit canvas to screen
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  let animationActive = true;

  // After camel walks to the village (5s), hide camel and start water burst
  setTimeout(() => {
    // Hide the camel image (simulate popping)
    const camelImg = scene.querySelector(".camel img");
    if (camelImg) camelImg.style.display = "none";
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
    // After water burst (5s), show score modal
    setTimeout(() => {
      animationActive = false;
      scene.style.display = "none";
      scene.style.background = "";
      gameContainer.style.background = "";
      // Show score modal only
      const scoreModal = document.getElementById("score-modal");
      const finalScoreSuccess = document.getElementById("final-score-success");
      if (scoreModal && finalScoreSuccess) {
        finalScoreSuccess.textContent = score;
        scoreModal.style.display = "flex";
      }
      modalOverlay.style.display = "none";
      // Add event listener for return button
      const returnBtn = document.getElementById("return-btn");
      if (returnBtn) {
        returnBtn.onclick = function () {
          scoreModal.style.display = "none";
          modalOverlay.style.display = "flex";
        };
      }
    }, 5000); // 5s water burst
  }, 5000); // after camel reaches village

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
