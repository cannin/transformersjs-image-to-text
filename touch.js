const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables to keep track of drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Event constants
const START_DRAW_EVENTS = ['mousedown', 'touchstart'];
const DRAW_EVENTS = ['mousemove', 'touchmove'];
const STOP_DRAW_EVENTS = ['mouseup', 'mouseout', 'touchend'];

// Function to add multiple event listeners
const addEventListeners = (item, events, fn) => {
  for (let event of events) {
    item.addEventListener(event, fn);
    console.log("event: " + event);
  }
};

// Function to start drawing
function startDrawing(event) {
  event.preventDefault();
  event.stopPropagation();
  isDrawing = true;
  const { x, y } = getPosition(event);
  lastX = x;
  lastY = y;
}

// Function to stop drawing
function stopDrawing(event) {
  event.preventDefault();
  event.stopPropagation();
  isDrawing = false;
  ctx.beginPath(); // Reset the path
}

// Function to draw on the canvas
function draw(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!isDrawing) return;

  const { x, y } = getPosition(event);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  lastX = x;
  lastY = y;
}

// Helper function to get position from mouse or touch event
function getPosition(event) {
  const rect = canvas.getBoundingClientRect();
  if (event.touches) {
    // Touch event
    const touch = event.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  } else {
    // Mouse event
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
}

// Add event listeners for start, draw, and stop events
addEventListeners(canvas, START_DRAW_EVENTS, startDrawing);
addEventListeners(canvas, DRAW_EVENTS, draw);
addEventListeners(canvas, STOP_DRAW_EVENTS, stopDrawing);

// Disable context menu on right-click
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

// Resize canvas when the window size changes
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Add click event to the button
const alertButton = document.getElementById('alertButton');
alertButton.addEventListener('click', () => {
  alert('Hello, World!');
});
