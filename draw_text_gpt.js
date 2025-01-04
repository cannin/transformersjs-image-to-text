//document.ontouchstart = function(e){ e.preventDefault(); }
// const preventDefault = (e) => e.preventDefault();
// document.addEventListener('touchmove', preventDefault, { passive: false });

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

// Function to start drawing
function startDrawing(event) {
  event.preventDefault();
  event.stopPropagation();

  isDrawing = true;
  const { x, y } = getPosition(event);
  lastX = x;
  lastY = y;
}

function draw(event) {
  if (!isDrawing) return;

  const { x, y } = getPosition(event);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;
}

function stopDrawing(event) {
  event.preventDefault();
  event.stopPropagation();

  isDrawing = false;
  ctx.beginPath();
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

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Re-add background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  countdown = original_countdown;
  outputDiv.innerHTML = '...';
}

const addEventListeners = (item, events, fn) => {
  for (let event of events) {
    item.addEventListener(event, fn);
    console.log("event: " + event);
  }
}

function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);

    return urlParams.get(param);
}

// Function to get value from localStorage or query param
function getParamValue(param) {
    let value = getQueryParam(param);

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
let apiKey = getParamValue('apikey');
let apiUrl = "https://api.openai.com/v1/chat/completions";

let prompt = "what is written; no explanation";

async function generateDescription() {
  generateButton.setAttribute("disabled", true);
  console.log(`Prompt: ${prompt}`);

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
                        text: prompt
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
        output.innerHTML = result;

        generateButton.removeAttribute("disabled");
    })
    .catch(error => {
        console.error("Error fetching summary:", error);
    });
}

// Disable context menu on right-click
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

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

// Get the dropdown element
const dropdown = document.getElementById("dropdown");

// Add an event listener to handle changes
dropdown.addEventListener("change", () => {
  // Set `x` based on the selected value
  switch (dropdown.value) {
    case "describe":
      prompt = "the image is a simple line drawing of an object. what is the object in 1 to 5 words; no explanation";
      break;
    case "text":
      prompt = "what is written; no explanation";
      break;
    case "spelling_es":
      prompt = "what spanish words are on the image; also, say 'corecto' or 'mal escrito' if not spelled in spanish correctly; always include the letters written; no explanation";
      break;
    case "spelling_en":
      prompt = "what english words are on the image; also, say 'correct' or 'mispelled' if not spelled correctly in english; always include the letters written; no explanation";
      break;
      case "translate":
        prompt = "if the words written in the image are in english then translate to spanish and vice versa; no explanation";
        break;
    default:
      prompt = "what is written; no explanation";
      break;
  }

  console.log(`Prompt: ${prompt}`);
});