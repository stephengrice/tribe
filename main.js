var people = []
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
};
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
  btnSpawn.onclick = function() {
    btnSpawn.disabled = true;
    btnSelect.disabled = false;
    btnCommand.disabled = false;
    controller.setMode(MODE.SPAWN);
  };
  btnSelect.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = true;
    btnCommand.disabled = false;
    controller.setMode(MODE.SELECT);
  };
  btnCommand.onclick = function() {
    btnSpawn.disabled = false;
    btnSelect.disabled = false;
    btnCommand.disabled = true;
    controller.setMode(MODE.COMMAND);
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
    if (!people[i]) continue;
    people[i].draw();
    people[i].act();
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
    this.commandTarget = {x:0, y:0};
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
      this.commandTarget = {x: e.clientX, y: e.clientY};
      // Set all people to "target" MODE
      for (var i = 0; i < people.length; i++ ) {
        if (people[i] && people[i].selected) {
          people[i].state = 'target';
        }
      }
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
      if (!people[i]) continue;
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

    this.selected = false;

    this.health = 100;

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
        let target = controller.commandTarget;
        this.rot = Math.atan2(this.y - target.y, this.x - target.x) * (180/Math.PI);
        console.log('calc\'d rot ' + this.rot);
        // Walk towards target
        this.walk();
        break;
    }

    // Deplete hunger
    this.health -= 0.1;

    // health check
    if (this.health <= 0) {
      this.die();
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
    // ONLY IF state is not target
    if (this.state != 'target'  && this.nextChange <= new Date().getTime()) {
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
    let choice = Math.floor(Math.random() * (STATE.length - 1)); // Choose a random next state
    // Exclude 'target' state. this needs to be fixed.
    // console.log('state chosen. ' + STATE[choice])
    this.state = STATE[choice];
  }
  chooseNextChange() {
    let now = new Date().getTime();
    this.nextChange = now + Math.random() * MAX_ACTION_TIME * 1000;
  }
  die() {
    for (var i = 0; i < people.length; i++) {
      if (people[i] && people[i].id == this.id) {
        delete people[i];
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
