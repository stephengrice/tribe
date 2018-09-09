var people = []
var canvas = document.getElementById('canvas');


const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const FPS = 30;
const LOOP_INTERVAL = 1000 / FPS;
const STATE = ['wait', 'walk', 'turn left', 'turn right'];
const MAX_ACTION_TIME = 2;
ctx = canvas.getContext('2d');

window.onload = function() {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
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
    people[i].act();
    people[i].draw();
  }
}

class Person {
  constructor(x,y) {
    this.v = 0;
    this.rot = Math.random() * 360;

    this.width = 10;
    this.height = 10;

    this.speed = 1;

    this.x = x;
    this.y = y;

    this.state = STATE.WAIT;
    this.chooseNextChange();
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

    // Bounds check
    if (this.x > WIDTH) {
      this.x = WIDTH;
    } else if (this.x < 0) {
      this.x = 0;
    }
    if (this.y > HEIGHT) {
      this.y = HEIGHT;
    } else if (this.y < 0) {
      this.y = 0;
    }
    // Choose next change of behavior and when
    if (this.nextChange <= new Date().getTime()) {
      this.chooseNextChange();
      this.chooseNextState();
    }
  }
  draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  chooseNextState() {
    let choice = Math.floor(Math.random() * STATE.length); // Choose a random next state
    this.state = STATE[choice];
  }
  chooseNextChange() {
    let now = new Date().getTime();
    this.nextChange = now + Math.random() * MAX_ACTION_TIME * 1000;
  }
}
