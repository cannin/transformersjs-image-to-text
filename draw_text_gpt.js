//document.ontouchstart = function(e){ e.preventDefault(); }
const preventDefault = (e) => e.preventDefault();
document.addEventListener('touchmove', preventDefault, { passive: false });

const START_DRAW_EVENTS = ['mousedown', 'touchstart'];
const DRAW_EVENTS = ['mousemove', 'touchmove'];
const STOP_DRAW_EVENTS = ['mouseup', 'mouseout', 'touchend'];

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
ctx.imageSmoothingEnabled = true;
ctx.strokeStyle = '#000';
ctx.lineWidth = 2;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.fillStyle = '#fff';
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

const addEventListeners = (item, events, fn) => {
  for (let event of events) {
    item.addEventListener(event, fn);
  }
}

function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);

    return urlParams.get(param);
}

// Function to get value from localStorage or query param
function getParamValue(param) {
    const value = getQueryParam(param);

    if (value) {
        localStorage.setItem(param, value);
    } else {
        value = localStorage.getItem(param);
    }

    if (!value) {
        console.error(`ERROR: ${param} is not provided and not found in localStorage`);
    }

    return value;
}

// Get values from query params or localStorage
const apiKey = getParamValue('apikey');
const apiUrl = "https://api.openai.com/v1/chat/completions";

async function generateDescription() {
  generateButton.setAttribute("disabled", true);

  // NOTE: await not needed, but the image (canvas specifically) does need a background color with ctx.fillRect
  const image = canvas.toDataURL('image/png'); console.log("Base64 Image:", image);
  //const image = canvas.toDataURL("image/jpeg", 1.0); //console.log("Base64 Image:", image);
  //const image = 'handwriting.png'; console.log("PNG");

    const data = {
        model: "gpt-4o-mini",
        messages: [
            {
                "role": "system",
                "content": "you understand images"
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "what is written; no explanation"
                    },
                    {
                        type: "image_url",
                        image_url: {
                          url: image
                        }
                    }
                ]
            }
        ],
        max_tokens: 200
    };

    // Send the request to OpenAI
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) throw new Error("API request failed");
        return response.json();
    })
    .then(apiData => {
        const result = apiData.choices[0].message.content;

        console.log("LLM Text:", result);
        output.innerHTML = "Text: " + result;

        generateButton.removeAttribute("disabled");
    })
    .catch(error => {
        console.error("Error fetching summary:", error);
    });
}

// Event listeners
addEventListeners(canvas, START_DRAW_EVENTS, startDrawing);
addEventListeners(canvas, DRAW_EVENTS, draw);
addEventListeners(canvas, STOP_DRAW_EVENTS, stopDrawing);

// canvas.addEventListener('mousedown', startDrawing);
// canvas.addEventListener('mousemove', draw);
// canvas.addEventListener('mouseup', stopDrawing);
// canvas.addEventListener('mouseout', stopDrawing);

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
//setInterval(updateCountdown, countdown_decrement);

