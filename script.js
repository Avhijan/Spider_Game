// script.js

// Confirm the JS file is loaded.
console.log("script.js loaded!");

// Get the canvas element and its drawing context.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set the canvas dimensions to match the window.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Spider configuration (seen from the back)
const spider = {
  x: canvas.width / 2,   // Center horizontally
  y: canvas.height / 2,  // Center vertically
  radius: 30,            // Radius of the spider's back (body)
  legLengthUpper: 35,    // Upper leg segment (Femur, thicker)
  legLengthLower: 40,    // Lower leg segment (Tibia)
  legAngle: 0            // Base angle for leg movement
};

// Function to draw the spider (body and legs)
function drawSpider() {
  // Draw the spider's body
  ctx.beginPath();
  ctx.arc(spider.x, spider.y, spider.radius, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // Draw the spider's head (small bulge on top)
  ctx.beginPath();
  ctx.arc(spider.x, spider.y - spider.radius * 0.6, spider.radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // Define vertical offsets for the legs (as fractions of the body radius)
  const legOffsets = [-0.6, -0.2, 0.2, 0.6];

  // Animate legs with forward-backward motion
  let time = Date.now() * 0.005;

  // Draw left-side legs (4 legs)
  for (let i = 0; i < legOffsets.length; i++) {
    let offsetY = legOffsets[i] * spider.radius;
    let baseX = spider.x - spider.radius + 5; // Adjusted to connect smoothly
    let baseY = spider.y + offsetY;
    
    let angle = Math.sin(time + i) * 0.5; // Oscillating angle for movement

    // Perspective scaling for 3D effect (reversed logic)
    let depthScale = 1 + (i * 0.1); // Closer legs are longer, further legs are shorter

    // Upper leg endpoint (femur)
    let kneeX = baseX - Math.cos(angle) * spider.legLengthUpper * depthScale;
    let kneeY = baseY + Math.sin(angle) * spider.legLengthUpper * depthScale;

    // Lower leg endpoint (tibia)
    let footX = kneeX - Math.cos(angle + 0.5) * spider.legLengthLower * depthScale;
    let footY = kneeY + Math.sin(angle + 0.5) * spider.legLengthLower * depthScale;

    // Draw femur
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(kneeX, kneeY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5; // Thicker femur
    ctx.stroke();
    ctx.closePath();

    // Draw tibia
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  }

  // Draw right-side legs (mirroring the left-side motion)
  for (let i = 0; i < legOffsets.length; i++) {
    let offsetY = legOffsets[i] * spider.radius;
    let baseX = spider.x + spider.radius - 5;
    let baseY = spider.y + offsetY;
    
    let angle = Math.sin(time + i) * 0.5;
    let depthScale = 1 + (i * 0.1); // Closer legs are longer, further legs are shorter

    // Upper leg endpoint (femur)
    let kneeX = baseX + Math.cos(angle) * spider.legLengthUpper * depthScale;
    let kneeY = baseY + Math.sin(angle) * spider.legLengthUpper * depthScale;

    // Lower leg endpoint (tibia)
    let footX = kneeX + Math.cos(angle + 0.5) * spider.legLengthLower * depthScale;
    let footY = kneeY + Math.sin(angle + 0.5) * spider.legLengthLower * depthScale;

    // Draw femur
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(kneeX, kneeY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();

    // Draw tibia
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  }
}

// The main game loop clears the canvas and redraws the spider every frame.
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSpider();
  requestAnimationFrame(gameLoop);
}

// Start the game loop.
gameLoop();
