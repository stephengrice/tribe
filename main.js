var people = []
var canvas = document.getElementById('canvas');


const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const FPS = 30;
const LOOP_INTERVAL = 1000 / FPS;
const STATE = {};
STATE.WAIT = 0;
STATE.WALK = 1;
const MAX_ACTION_TIME = 5;
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
    this.width = 10;
    this.height = 10;

    this.state = STATE.WAIT;
    this.nextChange = this.chooseNextChange();
  }
  act() {

    if (this.state == STATE.WALK) {
      this.x ++;
    }

    if (this.nextChange <= new Date().getTime()) {
      this.nextChange = this.chooseNextChange();
      if (this.state == STATE.WAIT) {
        this.state = STATE.WALK;
      } else {
        this.state = STATE.WAIT;
      }
    }
  }
  draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y - this.height / 2, this.width, this.height);
  }
  chooseNextChange() {
    console.log("choosing next time");
    let now = new Date().getTime();
    return now + Math.random() * MAX_ACTION_TIME * 1000;
  }
}
