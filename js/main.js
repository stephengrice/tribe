var gameState = {
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
const STATE = ['wait', 'walk', 'turn left', 'turn right', 'target'];
const MAX_ACTION_TIME = 2;
const MODE = {
  SPAWN: 0,
  SELECT: 1,
  COMMAND: 2,
  BUY: 3,
  PLACE_BUILDING: 4,
};
const TARGET_REACHED_CRITERIA = 5; // Close enough to target to move on to something else
ctx = canvas.getContext('2d');

window.onload = function() {
  // Setup controller
  controller = new PeopleController(canvas);

  // Setup GUI buttons
  btnSpawn = document.getElementById('btnSpawn');
  btnSelect = document.getElementById('btnSelect');
  btnCommand = document.getElementById('btnCommand');
  btnBuy = document.getElementById('btnBuy');
  btnPlaceBuilding = document.getElementById('btnPlaceBuilding');
  btnHelp = document.getElementById('btnHelp');
  btnSpawn.onclick = function() {
    btnSpawn.disabled = true;
    btnSelect.disabled = false;
    btnCommand.disabled = false;
    btnPlaceBuilding.disabled = false;
    btnBuy.disabled = false;
    controller.setMode(MODE.SPAWN);
  };
  btnSelect.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = true;
    btnCommand.disabled = false;
    btnPlaceBuilding.disabled = false;
    btnBuy.disabled = false;
    controller.setMode(MODE.SELECT);
  };
  btnCommand.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = false;
    btnCommand.disabled = true;
    btnPlaceBuilding.disabled = false;
    btnBuy.disabled = false;
    controller.setMode(MODE.COMMAND);
  };
  btnBuy.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = false;
    btnCommand.disabled = false;
    btnPlaceBuilding.disabled = false;
    btnBuy.disabled = true;
    controller.setMode(MODE.BUY);
  };
  btnPlaceBuilding.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = false;
    btnCommand.disabled = false;
    btnPlaceBuilding.disabled = true;
    btnBuy.disabled = false;
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
