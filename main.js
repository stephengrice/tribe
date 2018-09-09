var people = []
var canvas = document.getElementById('canvas');
var peopleIDs = 0;


var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
const FPS = 30;
const LOOP_INTERVAL = 1000 / FPS;
const STATE = ['wait', 'walk', 'turn left', 'turn right'];
const MAX_ACTION_TIME = 2;
ctx = canvas.getContext('2d');

window.onload = function() {
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

canvas.onclick = function(e) {
  people.push(new Person(e.clientX, e.clientY));
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < people.length; i++) {
    if (!people[i]) continue;
    people[i].draw();
    people[i].act();
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

    this.health = 100;

    this.state = STATE.WAIT;
    this.chooseNextChange();
  }
  draw() {
    ctx.fillStyle = "black";
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
        // Move according to speed and rot
        this.x += this.speed * Math.sin(Math.PI * this.rot / 180);
        this.y += this.speed * Math.cos(Math.PI * this.rot / 180);
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
    }

    // Deplete hunger
    this.health -= 0.5;

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
    if (this.nextChange <= new Date().getTime()) {
      this.chooseNextChange();
      this.chooseNextState();
    }
  }
  chooseNextState() {
    let choice = Math.floor(Math.random() * STATE.length); // Choose a random next state
    this.state = STATE[choice];
  }
  chooseNextChange() {
    let now = new Date().getTime();
    this.nextChange = now + Math.random() * MAX_ACTION_TIME * 1000;
  }
  die() {
    for (var i = 0; i < people.length; i++) {
      if (people[i].id == this.id) {
        people[i] = false;
      }
    }
  }
}
