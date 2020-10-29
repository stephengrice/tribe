var maxEntityID = -1;
class Entity {
  constructor(x, y, width, height) {
    maxEntityID++;
    this.id = maxEntityID;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = 'Entity';
  }
  draw() {

  }
  act() {

  }
  click(x, y) {

  }
}
class Building extends Entity {
  constructor(x,y) {
    super(x,y,100,100);
    this.type = 'Building';
    this.ready = false;
  }
  draw() {
    if (this.ready) {
      ctx.fillStyle = "yellow";
    } else {
      ctx.fillStyle = "brown";
    }
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
  click(x, y) {

  }
}
class Food extends Entity {
  constructor(x,y) {
    super(x, y, 5, 5);
    this.type = 'Food';
  }
  draw() {
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  act() {

  }
  click(x, y) {

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
    this.type = 'LivingEntity';
  }
  click(x, y) {

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
    this.type = 'Person';
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
    for (var i = 0; i < gameState.entities.length; i++) {
      if (!gameState.entities[i] instanceof Food) continue;
      if (collision(this, gameState.entities[i])) {
        gameState.entities.splice(i, 1);
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
    if (this.health > 50 || gameState.foods.length < 1) {
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
      for (var i = 0; i < gameState.foods.length; i++) {
        if (!foodChoice || distanceBetween(this, gameState.foods[i]) < distanceBetween(this, foodChoice)) {
          foodChoice = gameState.foods[i];
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
    for (var i = 0; i < gameState.entities.length; i++) {
      if (gameState.entities[i].id == this.id) {
        gameState.entities.splice(i, 1); // remove 1 element at i
      }
    }
  }
  click(x, y) {

  }
}
