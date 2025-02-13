console.log("script.js loaded!");

// Get the canvas element and its drawing context.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ================================
// Spider & Movement Configuration
// ================================
const spider = {
  x: canvas.width / 2,      // Always centered horizontally.
  y: canvas.height - 200,   // Base vertical position (ground level).
  radius: 30,
  legLengthUpper: 35,
  legLengthLower: 40
};

let offsetX = 0; // Camera offset for background (x-axis)
let offsetY = 0; // Camera offset for background (y-axis)
const speed = 5;

// -----------------------
// Jump Variables
// -----------------------
let jumpOffset = 0;  // Vertical offset during a jump.
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.5;    // Controls jump fall speed.
const jumpForce = 15;   // Initial jump strength.

// -----------------------
// Input Tracking for Leg Animation
// -----------------------
const keysPressed = {};
let moving = false;
function updateMovingFlag() {
  moving = keysPressed["ArrowUp"] ||
           keysPressed["ArrowDown"] ||
           keysPressed["ArrowLeft"] ||
           keysPressed["ArrowRight"];
}

// Prevent arrow keys from scrolling the page.
window.addEventListener("keydown", function(event) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }
});

// ================================
// Score & Bugs
// ================================
let score = 0;
const bugs = Array.from({ length: 5 }, () => ({
  // Place bugs in world coordinates.
  x: Math.random() * canvas.width,
  y: Math.random() * (canvas.height - 300) + 200,
  eaten: false
}));

// ================================
// Drawing Functions
// ================================

function drawSpider(effectiveSpiderX, effectiveSpiderY) {
  // Spider's Body.
  ctx.beginPath();
  ctx.arc(effectiveSpiderX, effectiveSpiderY, spider.radius, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // Spider's Head.
  ctx.beginPath();
  ctx.arc(effectiveSpiderX, effectiveSpiderY - spider.radius * 0.6, spider.radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // Legs: Animate only when movement keys are pressed.
  const time = moving ? Date.now() * 0.005 : 0;
  const legOffsets = [-0.6, -0.2, 0.2, 0.6];

  // Left legs.
  for (let i = 0; i < legOffsets.length; i++) {
    let offsetYLeg = legOffsets[i] * spider.radius;
    let baseX = effectiveSpiderX - spider.radius + 5;
    let baseY = effectiveSpiderY + offsetYLeg;
    let angle = moving ? Math.sin(time + i) * 0.5 : 0;
    let depthScale = 1 + i * 0.1;
    let kneeX = baseX - Math.cos(angle) * spider.legLengthUpper * depthScale;
    let kneeY = baseY + Math.sin(angle) * spider.legLengthUpper * depthScale;
    let footX = kneeX - Math.cos(angle + 0.5) * spider.legLengthLower * depthScale;
    let footY = kneeY + Math.sin(angle + 0.5) * spider.legLengthLower * depthScale;
    
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(kneeX, kneeY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  }

  // Right legs.
  for (let i = 0; i < legOffsets.length; i++) {
    let offsetYLeg = legOffsets[i] * spider.radius;
    let baseX = effectiveSpiderX + spider.radius - 5;
    let baseY = effectiveSpiderY + offsetYLeg;
    let angle = moving ? Math.sin(time + i) * 0.5 : 0;
    let depthScale = 1 + i * 0.1;
    let kneeX = baseX + Math.cos(angle) * spider.legLengthUpper * depthScale;
    let kneeY = baseY + Math.sin(angle) * spider.legLengthUpper * depthScale;
    let footX = kneeX + Math.cos(angle + 0.5) * spider.legLengthLower * depthScale;
    let footY = kneeY + Math.sin(angle + 0.5) * spider.legLengthLower * depthScale;
    
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(kneeX, kneeY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  }
}

function drawBugs() {
  bugs.forEach(bug => {
    if (!bug.eaten) {
      ctx.fillStyle = "green";
      // Calculate screen position of bug.
      const screenX = bug.x - offsetX;
      const screenY = bug.y - offsetY;
      // Draw bug as 4 segmented circles.
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(screenX, screenY - i * 5, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

function checkCollisions() {
  bugs.forEach(bug => {
    if (!bug.eaten) {
      const bugScreenX = bug.x - offsetX;
      const bugScreenY = bug.y - offsetY;
      const dist = Math.hypot(spider.x - bugScreenX, (spider.y + jumpOffset) - bugScreenY);
      if (dist < spider.radius) {
        bug.eaten = true;
        score++;
        console.log("Bug eaten! New score:", score);
      }
    }
  });
}

function drawEnvironment() {
  const horizonY = canvas.height / 3;
  // Environment objects in world coordinates.
  const objects = [
    { x: 300, y: horizonY + 50, width: 80, height: 30, color: 'brown' }, // Log
    { x: 600, y: horizonY + 70, width: 50, height: 50, color: 'gray' },   // Rock
    { x: 900, y: horizonY + 60, width: 100, height: 40, color: 'brown' }  // Log
  ];
  objects.forEach(obj => {
    const objX = obj.x - offsetX;
    const objY = obj.y - offsetY;
    ctx.fillStyle = obj.color;
    ctx.fillRect(objX, objY, obj.width, obj.height);
  });
}

// ================================
// Main Game Loop & Physics
// ================================
function gameLoop() {
  // Update jump physics.
  if (isJumping) {
    jumpVelocity += gravity;
    jumpOffset += jumpVelocity;
    if (jumpOffset > 0) {
      jumpOffset = 0;
      isJumping = false;
      jumpVelocity = 0;
    }
  }

  const effectiveSpiderY = spider.y + jumpOffset;
  const horizonY = canvas.height / 3;

  // Clear the canvas.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background: sky and ground.
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, canvas.width, horizonY);
  ctx.fillStyle = "lightgreen";
  ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

  // Draw environment objects relative to camera offset.
  drawEnvironment();
  drawBugs();
  drawSpider(spider.x, effectiveSpiderY);
  drawScore();
  checkCollisions();

  requestAnimationFrame(gameLoop);
}

// ================================
// Input Event Listeners
// ================================
document.addEventListener("keydown", function (event) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    keysPressed[event.key] = true;
    updateMovingFlag();
  }

  // Update the camera (background) offset.
  if (event.key === "ArrowUp") offsetY -= speed;
  if (event.key === "ArrowDown") offsetY += speed;
  if (event.key === "ArrowLeft") offsetX -= speed;
  if (event.key === "ArrowRight") offsetX += speed;

  // Jump control via Spacebar.
  if (event.code === "Space" && !isJumping) {
    isJumping = true;
    jumpVelocity = -jumpForce;
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    keysPressed[event.key] = false;
    updateMovingFlag();
  }
});

// Update canvas dimensions (and spider center) on window resize.
window.addEventListener("resize", function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  spider.x = canvas.width / 2;
  spider.y = canvas.height - 200;
});

gameLoop();

