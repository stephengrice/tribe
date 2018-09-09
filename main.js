var people = []
var canvas = document.getElementById('canvas');


const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const FPS = 30;
const LOOP_INTERVAL = 1000 / FPS;
const STATE = ['wait', 'walk', 'turn'];
const MAX_ACTION_TIME = 2;
ctx = canvas.getContext('2d');

window.onload = function() {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  setInterval(loop, LOOP_INTERVAL);
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
    this.x = x;
    this.y = y;

    this.v = 0;
    this.rot = 0;

    this.width = 10;
    this.height = 10;

    this.state = STATE.WAIT;
    this.chooseNextChange();
  }
  act() {
    switch(this.state) {
      case 'wait':
        this.v = 0;
        break;
      case 'walk':
        this.v = 1;
        break;
      case 'turn':
        this.v = 0;
        this.rot += 1;
        break;
    }
    if (this.state == 'walk') {
      this.v = 1;
    } else if (this.state == 'turn') {
      this.rot += 1;
    }

    // Move according to vx, vy, and rot
    this.x += this.v * Math.sin(Math.PI * this.rot / 180);
    this.y += this.v * Math.cos(Math.PI * this.rot / 180);
    // Choose next change of behavior and when
    if (this.nextChange <= new Date().getTime()) {
      this.chooseNextChange();
      this.chooseNextState();
    }
  }
  draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y - this.height / 2, this.width, this.height);
  }
  chooseNextState() {
    let choice = Math.floor(Math.random() * STATE.length); // Choose a random next state
    this.state = STATE[choice];
    console.log('next state: ' + STATE[choice]);
  }
  chooseNextChange() {
    let now = new Date().getTime();
    this.nextChange = now + Math.random() * MAX_ACTION_TIME * 1000;
  }
}
