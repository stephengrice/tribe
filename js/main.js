var gameState = {
  cash: 0,
  entities: [],
};
var canvas = document.getElementById('canvas');
var peopleIDs = 0;


var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var controller;
const FPS = 30;
const LOOP_INTERVAL = 1000 / FPS;
const SAVE_INTERVAL = 5000;
const MAX_ACTION_TIME = 2;
const TARGET_REACHED_CRITERIA = 5; // Close enough to target to move on to something else
ctx = canvas.getContext('2d');

window.onload = function() {
  // Setup controller
  controller = new GameController(canvas);

  // Labels
  lblCash = document.getElementById('lblCash');
  // Setup GUI buttons
  btnSpawn = document.getElementById('btnSpawn');
  btnSelect = document.getElementById('btnSelect');
  btnCommand = document.getElementById('btnCommand');
  btnBuy = document.getElementById('btnBuy');
  btnPlaceBuilding = document.getElementById('btnPlaceBuilding');
  btnHelp = document.getElementById('btnHelp');
  btnSpawn.onclick = function() {
    controller.setMode(MODE.SPAWN);
  };
  btnSelect.onclick = function() {
    controller.setMode(MODE.SELECT);
  };
  btnCommand.onclick = function() {
    controller.setMode(MODE.COMMAND);
  };
  btnBuy.onclick = function() {
    controller.setMode(MODE.BUY);
  };
  btnPlaceBuilding.onclick = function() {
    controller.setMode(MODE.PLACE_BUILDING);
  };
  btnHelp.onclick = function() {
    alert('Welcome to Tribe!\nIn this game, you\'re making a little tribe of people and giving them everything they need to thrive!\nStart by clicking anywhere to create your first person. Make sure you feed them too - click the Buy Food button and click anywhere to place some grub.');
  };

  fixCanvasSize();
  setInterval(loop, LOOP_INTERVAL);
  // savedGame = localStorage.getItem('savedgame')
  // if (savedGame) {
  //   parsedState = JSON.parse(savedGame);
  //   console.log(savedGame);
  // } else {
  //   console.log('No saved game found.');
  // }
  // setInterval(save_game, SAVE_INTERVAL);
}

// Fix canvas on window resize
window.onresize = fixCanvasSize;
function fixCanvasSize() {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  canvas.width = windowWidth;
  canvas.height = windowHeight;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < gameState.entities.length; i++) {
    gameState.entities[i].draw();
    gameState.entities[i].act();
  }
  // Draw controller - bounding box
  controller.draw();
  // Update cash in GUI
  lblCash.innerHTML = "$" + gameState.cash.toFixed(2);
  // Update button disable state
  btnSpawn.disabled = controller.mode == MODE.SPAWN;
  btnSelect.disabled = controller.mode == MODE.SELECT;
  btnCommand.disabled = controller.mode == MODE.COMMAND;
  btnBuy.disabled = controller.mode == MODE.BUY;
  btnPlaceBuilding.disabled = controller.mode == MODE.PLACE_BUILDING;
}

function save_game() {
  localStorage.setItem('savedgame', JSON.stringify(gameState));
  console.log('saved game')
}

// HELPER FUNCTIONS
function isPointInBox(b1, b2, p) {
  let withinX = (b1.x < b2.x && b1.x < p.x && p.x < b2.x)
                  || (b2.x < b1.x && b2.x < p.x && p.x < b1.x);
  let withinY = (b1.y < b2.y && b1.y < p.y && p.y < b2.y)
                  || (b2.y < b1.y && b2.y < p.y && p.y < b1.y);
  return withinX && withinY;
}
function collision(a,b) {
  if (!a || !b) return false;
  var not_cond = a.x + a.width < b.x
  	|| a.y + a.height < b.y
  	|| b.x + b.width < a.x
  	|| b.y + b.height < a.y;
  return !not_cond;
}
function distanceBetween(pointA, pointB) {
  var x = pointB.x - pointA.x;
  var y = pointB.y - pointA.y;
  return Math.sqrt(x*x + y*y);
}
