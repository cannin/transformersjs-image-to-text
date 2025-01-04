import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4';

document.ontouchstart = function(e){ e.preventDefault(); }

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearButton');
const generateButton = document.getElementById('generateButton');
//const spinner = document.getElementById('spinner');
const output = document.getElementById('outputDiv');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let original_countdown = 20.0;
let countdown = original_countdown;
let countdown_decrement = 100;

// Set initial drawing properties
ctx.strokeStyle = '#000';
ctx.lineWidth = 2;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
  if (!isDrawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
  isDrawing = false;
  ctx.beginPath();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Re-add background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  countdown = original_countdown;
  outputDiv.innerHTML = 'Text: ...';
}

// Create image-to-text pipeline
//const captioner = await pipeline('image-to-text', 'Xenova/trocr-small-handwritten', {device: 'webgpu'});
const captioner = await pipeline('image-to-text', 'Xenova/trocr-small-handwritten');
//const captioner = await pipeline('image-to-text', 'Xenova/trocr-base-handwritten');

async function generateDescription() {
  //spinner.classList.add('show');
  generateButton.setAttribute("disabled", true);

  // NOTE: await not needed, but the image (canvas specifically) does need a background color with ctx.fillRect
  const image = canvas.toDataURL('image/png'); //console.log("Base64 Image:", image);
  //const image = canvas.toDataURL("image/jpeg", 1.0); //console.log("Base64 Image:", image);
  //const image = 'handwriting.png'; console.log("PNG");
  const result = await captioner(image);

  console.log("LLM Text:", result[0].generated_text);
  output.innerHTML = "Text: " + result[0].generated_text;

  //spinner.classList.remove('show');
  generateButton.removeAttribute("disabled");
  //output.style.display = 'block';
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

clearButton.addEventListener('click', clearCanvas);

function debugMessage() {
  console.log("hello world");
}

generateButton.removeAttribute('disabled');
//generateButton.addEventListener('click', debugMessage);
generateButton.addEventListener('click', generateDescription);

// Automatically call generateDescription at a given interval
//setInterval(generateDescription, 10000);

// Countdown logic
function updateCountdown() {
  countdown -= countdown_decrement / 1000;
  if (countdown <= 0) {
    countdown = original_countdown; // Reset countdown
    generateDescription();
  }
  countdownDiv.innerHTML = `Time Left: ${countdown.toFixed(1)} seconds`;
}

// Update countdown every X seconds
setInterval(updateCountdown, countdown_decrement);

