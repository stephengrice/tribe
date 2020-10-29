class PeopleController {
  constructor(canvas) {
    var that = this;
    canvas.onmousedown = function(e) {
      that.handleMouseDown(e);
    };
    canvas.onmouseup = function(e) {
      that.handleMouseUp(e);
    };
    canvas.onmousemove = function(e) {
      that.handleMouseMove(e);
    };
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
      gameState.people.push(new Person(e.clientX, e.clientY));
    } else if (this.mode == MODE.SELECT) {
      this.endDrag(e);
    } else if (this.mode == MODE.COMMAND) {
      // Set all people to "target" MODE
      for (var i = 0; i < gameState.people.length; i++ ) {
        if (gameState.people[i].selected) {
          gameState.people[i].commandTarget = {x: e.clientX, y: e.clientY};
          gameState.people[i].state = 'target';
          gameState.people[i].ambulating = false; // Disable random state switching
        }
      }
    } else if (this.mode == MODE.BUY) {
      gameState.foods.push(new Food(e.clientX, e.clientY));
    } else if (this.mode == MODE.PLACE_BUILDING) {
      gameState.buildings.push(new Building(e.clientX, e.clientY));
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
    for (var i = 0; i < gameState.people.length; i++) {
      if (isPointInBox(this.boundBegin, this.boundEnd, gameState.people[i])) {
        gameState.people[i].selected = true;
      } else {
        gameState.people[i].selected = false;
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
