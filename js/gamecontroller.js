const MODE = {
  SPAWN: 0,
  SELECT: 1,
  COMMAND: 2,
  BUY: 3,
  PLACE_BUILDING: 4,
};

class GameController {
  constructor(canvas) {
    var that = this;
    canvas.onmousedown = function(e) {
      that.handleMouseDown(e);
    };
    canvas.onmouseup = function(e) {
      that.handleMouseUp(e);
      for (var i = 0; i < gameState.entities.length; i++) {
        let ent = gameState.entities[i];
        if (collision(ent, {x: e.clientX, y: e.clientY, width:1, height:1})) {
          gameState.entities[i].click(e.clientX, e.clientY);
        }
      }
    };
    canvas.onmousemove = function(e) {
      that.handleMouseMove(e);
    };
    this.mode = MODE.SELECT;
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
      gameState.entities.push(new Person(e.clientX, e.clientY));
      this.mode = MODE.SELECT;
    } else if (this.mode == MODE.SELECT) {
      this.endDrag(e);
    } else if (this.mode == MODE.COMMAND) {
      // Set all people to "target" MODE
      for (var i = 0; i < gameState.entities.length; i++ ) {
        if (!gameState.entities[i] instanceof Person) continue; // People only
        if (gameState.entities[i].selected) {
          gameState.entities[i].commandTarget = {x: e.clientX, y: e.clientY};
          gameState.entities[i].state = 'target';
          gameState.entities[i].ambulating = false; // Disable random state switching
        }
        this.mode = MODE.SELECT;
      }
    } else if (this.mode == MODE.BUY) {
      gameState.entities.push(new Food(e.clientX, e.clientY));
      this.mode = MODE.SELECT;
    } else if (this.mode == MODE.PLACE_BUILDING) {
      gameState.entities.push(new Building(e.clientX, e.clientY));
      this.mode = MODE.SELECT;
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
    for (var i = 0; i < gameState.entities.length; i++) {
      if (!gameState.entities[i] instanceof Person) continue; // people only
      if (isPointInBox(this.boundBegin, this.boundEnd, gameState.entities[i])) {
        gameState.entities[i].selected = true;
      } else {
        gameState.entities[i].selected = false;
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
