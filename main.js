var people = [];
var foods = [];
var canvas = document.getElementById('canvas');
var peopleIDs = 0;


var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var controller;
const FPS = 30;
const LOOP_INTERVAL = 1000 / FPS;
const STATE = ['wait', 'walk', 'turn left', 'turn right', 'target'];
const MAX_ACTION_TIME = 2;
const MODE = {
  SPAWN: 0,
  SELECT: 1,
  COMMAND: 2,
  BUY: 3,
};
const TARGET_REACHED_CRITERIA = 5; // Close enough to target to move on to something else
ctx = canvas.getContext('2d');

window.onload = function() {
  // Setup controller
  controller = new Controller();
  canvas.onmousedown = function(e) {
    controller.handleMouseDown(e);
  }
  canvas.onmouseup = function(e) {
    controller.handleMouseUp(e);
  }
  canvas.onmousemove = function(e) {
    controller.handleMouseMove(e);
  }

  // Setup GUI buttons
  btnSpawn = document.getElementById('btnSpawn');
  btnSelect = document.getElementById('btnSelect');
  btnCommand = document.getElementById('btnCommand');
  btnBuy = document.getElementById('btnBuy');
  btnSpawn.onclick = function() {
    btnSpawn.disabled = true;
    btnSelect.disabled = false;
    btnCommand.disabled = false;
    btnBuy.disabled = false;
    controller.setMode(MODE.SPAWN);
  };
  btnSelect.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = true;
    btnCommand.disabled = false;
    btnBuy.disabled = false;
    controller.setMode(MODE.SELECT);
  };
  btnCommand.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = false;
    btnCommand.disabled = true;
    btnBuy.disabled = false;
    controller.setMode(MODE.COMMAND);
  }
  btnBuy.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = false;
    btnCommand.disabled = false;
    btnBuy.disabled = true;
    controller.setMode(MODE.BUY);
  }

  fixCanvasSize();
  setInterval(loop, LOOP_INTERVAL);
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
  for (var i = 0; i < people.length; i++) {
    people[i].draw();
    people[i].act();
  }
  for (var i = 0; i < foods.length; i++) {
    foods[i].draw();
  }
  // Draw controller - bounding box
  controller.draw();
}

class Controller {
  constructor() {
    this.mode = MODE.SPAWN;
    this.bounding = false;
    this.boundBegin = {x: 0, y: 0};
    this.boundEnd = {x: 0, y: 0};
  }
  handleMouseDown(e) {
    if (this.mode == MODE.SELECT) {
      this.beginDrag(e);
    }
  }
  handleMouseUp(e) {
    if (this.mode == MODE.SPAWN) {
      people.push(new Person(e.clientX, e.clientY));
    } else if (this.mode == MODE.SELECT) {
      this.endDrag(e);
    } else if (this.mode == MODE.COMMAND) {
      // Set all people to "target" MODE
      for (var i = 0; i < people.length; i++ ) {
        if (people[i].selected) {
          people[i].commandTarget = {x: e.clientX, y: e.clientY};
          people[i].state = 'target';
          people[i].ambulating = false; // Disable random state switching
        }
      }
    } else if (this.mode == MODE.BUY) {
      foods.push(new Food(e.clientX, e.clientY));
    }
  }
  handleMouseMove(e) {
    if (this.mode == MODE.SELECT) {
      this.boundEnd = {x: e.clientX, y: e.clientY};
    }
  }
  setMode(mode) {
    this.mode = mode;
  }
  beginDrag(e) {
    this.bounding = true;
    this.boundBegin = {x: e.clientX, y: e.clientY}
    this.boundEnd = {x: e.clientX, y: e.clientY}
  }
  endDrag(e) {
    for (var i = 0; i < people.length; i++) {
      if (isPointInBox(this.boundBegin, this.boundEnd, people[i])) {
        people[i].selected = true;
      } else {
        people[i].selected = false;
      }
    }
    this.bounding = false;
  }
  draw() {
    if (this.bounding) {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(this.boundBegin.x, this.boundBegin.y, this.boundEnd.x - this.boundBegin.x, this.boundEnd.y - this.boundBegin.y)
    }
  }
}

var maxEntityID = -1;
class Entity {
  constructor(x, y, width, height) {
    maxEntityID++;
    this.id = maxEntityID;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
class Food extends Entity {
  constructor(x,y) {
    super(x, y, 5, 5);
  }
  draw() {
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
class LivingEntity extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.speed = 1;
    this.rot = Math.random() * 360;
    this.selected = false;
    this.health = 100;
    this.commandTarget = {x:0, y:0};
  }
}
class APerson extends LivingEntity {
  constructor(x,y) {
    super(x, y, 10, 10);
    this.ambulating = true;
    this.state = 'wait';
    this.chooseNextChange();
  }
}
class Person {
  constructor(x,y) {
    this.id = peopleIDs;
    peopleIDs++;

    this.v = 0;
    this.rot = Math.random() * 360;

    this.width = 10;
    this.height = 10;

    this.speed = 1;

    this.x = x;
    this.y = y;

    this.commandTarget = {x:0, y:0};

    this.selected = false;

    this.health = 100;

    this.ambulating = true;

    this.state = 'wait';
    this.chooseNextChange();
  }
  draw() {
    if (this.selected) {
      ctx.fillStyle = "yellow";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    // Draw health bar
    ctx.fillStyle = "red"
    ctx.fillRect(this.x - this.health / 4, this.y - this.height * 1.5, this.health / 2, 10)
  }
  act() {
    // Perform state-specific behavior
    switch(this.state) {
      case 'wait':
        this.v = 0;
        break;
      case 'walk':
        this.walk();
        break;
      case 'turn left':
        // console.log('turning left' + this.rot)
        this.v = 0;
        this.rot += 1;
        break;
      case 'turn right':
        // console.log('turning right' + this.rot)
        this.v = 0;
        this.rot -= 1;
        break;
      case 'target':
        // Turn towards commandTarget
        let target = this.commandTarget;
        this.rot = Math.atan2(target.y - this.y, target.x - this.x) * (180/Math.PI) - 90; // TODO fix this and direction of walk
        this.rot = -this.rot;
        // Walk towards target
        this.walk();
        // If we are close enough to the target, switch modes.
        if (Math.abs(this.x - target.x) <= TARGET_REACHED_CRITERIA && Math.abs(this.y - target.y) <= TARGET_REACHED_CRITERIA) {
          this.ambulating = true;
        }
        break;
    }

    // Deplete hunger
    this.health -= 0.1;

    // health check
    if (this.health <= 0) {
      this.die();
    }

    // Check for collisions with foods
    for (var i = 0; i < foods.length; i++) {
      if (collision(this, foods[i])) {
        foods.splice(i, 1);
        this.health += 50;
        if (this.health > 100) this.health = 100;
      }
    }

    // Bounds check
    if (this.x > windowWidth) {
      this.x = windowWidth;
    } else if (this.x < 0) {
      this.x = 0;
    }
    if (this.y > windowHeight) {
      this.y = windowHeight;
    } else if (this.y < 0) {
      this.y = 0;
    }
    // Choose next change of behavior and when
    // Only if player is "ambulating" and free to randomly change state
    if (this.ambulating  && this.nextChange <= new Date().getTime()) {
      this.chooseNextChange();
      this.chooseNextState();
    }
  }
  walk() {
    // Move according to speed and rot
    this.x += this.speed * Math.sin(Math.PI * this.rot / 180);
    this.y += this.speed * Math.cos(Math.PI * this.rot / 180);
  }
  chooseNextState() {
    if (this.health > 50 || foods.length < 1) {
      let choice = Math.floor(Math.random() * (STATE.length - 1)); // Choose a random next state
      // Exclude 'target' state. this needs to be fixed.
      // console.log('state chosen. ' + STATE[choice])
      this.state = STATE[choice];
    } else {
      // Hunt a random foods
      // TODO find nearest food instead of random
      this.state = 'target';
      let foodChoice = undefined;
      // Find nearest food
      for (var i = 0; i < foods.length; i++) {
        if (!foodChoice || distanceBetween(this, foods[i]) < distanceBetween(this, foodChoice)) {
          foodChoice = foods[i];
        }
      }
      this.commandTarget = {x: foodChoice.x, y: foodChoice.y};
    }

  }
  chooseNextChange() {
    let now = new Date().getTime();
    this.nextChange = now + Math.random() * MAX_ACTION_TIME * 1000;
  }
  die() {
    // Delete self from people array
    for (var i = 0; i < people.length; i++) {
      if (people[i].id == this.id) {
        people.splice(i, 1); // remove 1 element at i
      }
    }
  }
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
