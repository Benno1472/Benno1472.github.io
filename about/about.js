// reduce canvas size so no scrollbar appears
let windowXOffset = 17, windowYOffset = 21;

// configure tile rows and columns
let columns = 4, rows = 4;

// boolean for controlling the sequence of simulation
let sequence = true;

let fireworks = [], particles = [], tiles = [], tilesAvailable = [], curves = [], facts = [];

function preload() {
    // load facts into array (only works in server environment, otherwise CORS error)
    facts = loadStrings("facts.txt");
}

function setup() {
    createCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);

    colorMode(HSB);

    textAlign(CENTER);

    frameRate(70);

    rectMode(CENTER);

    // calculate where each tile should be on screen
    calculateTiles(rows, columns);

    // setting pixel density to 2 optimizes mobile views
    pixelDensity(2);

    // truncate facts array (remove empty lines)
    for (let i = facts.length - 1; i >= 0; i--) {
        if (facts[i].length == 0) {
            facts.splice(i, 1);
        }
    }

    console.log(facts);
}

function draw() {
    background(0);

    // under construction stuff
    textSize(32);
    fill(0, 0, 255);
    noStroke();
    text("Under Construction :)", width / 2, 200);

    if (sequence == true) {
        if (frameCount % 60 == 0) {
            // pick a an empty tile 
            tile = pickTile();
            // pick a random position for the firework to spawn (below window)
            let pos = createVector(random(width), height);

            // compute bezier curve between firework and tile
            let curvePoints = computeCurve(pos, tile.getCenter());
            // create firework object 
            fireworks.push(new Firework(random(windowWidth), curvePoints));

            // add the curve to the array of curves (temp)
            curves.push(curvePoints);

            // check if another sequence can occur
            if (tilesAvailable.length <= 0) {
                sequence = false;
            }
        }
    }

    // fireworks methods
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].methods();

        if (fireworks[i].checkExploded() == true) {
            let coords = fireworks[i].getCoords();
            for (let j = 0; j < 100; j++) {
                particles.push(new Particle(coords.x, coords.y, random(3, 9), random(1, 5), fireworks[i].getColour()));
            }
            fireworks.splice(i, 1);
        }
    }

    // particles methods
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].methods();

        if (particles[i].checkDead() == true) {
            particles.splice(i, 1);
        }
    }

    // tiles methods
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].methods();
    }
}

function windowResized() {
    // resizes the canvas when the window size is changed
    resizeCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);
}

function calculateTiles(rows, columns) {

    let tileWidth = Math.round(width / columns);
    let tileHeight = Math.round(height / rows);

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            // compute the center position of each tile
            tileCenter = createVector((i * tileWidth) + tileWidth / 2, (j * tileHeight) + tileHeight / 2);
            // add tile object to the tiles array and tilesAvailable array
            tiles.push(new Tile(tileCenter, tileWidth, tileHeight));
            tilesAvailable.push(new Tile(tileCenter, tileWidth, tileHeight));
        }
    }
}

function pickTile() {
    // select a random tile
    let selected = random(tilesAvailable);

    // remove it from the array
    let index = tilesAvailable.indexOf(selected);
    tilesAvailable.splice(index, 1);

    // return the tile
    return (selected);
}

function computeCurve(p1, p2) {
    let bezier = createVector(width / 2, height / 2);
    let bezierPoints = [];

    for (let t = 0; t < 1; t += 0.01) {
        // compute bezier points (quadratic bezier because single control point)
        let x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * bezier.x + t * t * p2.x;
        let y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * bezier.y + t * t * p2.y;

        let bezierPoint = createVector(x, y);

        bezierPoints.push(bezierPoint);
    }

    return (bezierPoints);
}

class Firework {

    constructor(pos, curvePoints) {
        this.position = createVector(pos.x, pos.y);
        this.velocity = createVector(0, 0);

        this.curvePoints = curvePoints
        this.index = 0;

        this.colour = random(255)

        this.rotation = 0;
        this.rotationAngle = 0;

        this.computeRotation();
    }

    methods() {
        this.update();
        this.changeRotation()
        this.display();
    }

    update() {
        // physics engine

        // compute acceleration vector between the firework and the current curvepoint
        this.acceleration = p5.Vector.sub(this.curvePoints[this.index], this.position);

        // normalize the velocity vector length to 1
        this.velocity = p5.Vector.normalize(this.velocity);

        // add the acceleration vector to the velocity vector
        this.velocity.add(this.acceleration);
        // add the velocity vector to the position vector
        this.position.add(this.velocity);

        // compute the distance between the firework and the current curvepoint
        let distance = p5.Vector.dist(this.position, this.curvePoints[this.index]);

        // if the distance is close enough, then change the 'target' to the next curve point
        if (distance <= 10) {
            this.index += 1;
        }
    }

    createStar(x, y, radius1, radius2, npoints) {
        let angle = TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = x + cos(a) * radius2;
            let sy = y + sin(a) * radius2;
            vertex(sx, sy);
            sx = x + cos(a + halfAngle) * radius1;
            sy = y + sin(a + halfAngle) * radius1;
            vertex(sx, sy);
        }
        endShape(CLOSE);
    }

    display() {
        fill(this.colour, 255, 255);
        noStroke();

        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotationAngle);
        this.createStar(0, 0, 5, 13, 5);
        pop();
    }

    checkExploded() {
        if (this.index >= this.curvePoints.length) {
            return (true);
        } else if (this.index < this.curvePoints.length) {
            return (false);
        }
    }

    computeRotation() {
        this.lastPoint = this.curvePoints[this.curvePoints.length - 1];

        if (this.lastPoint.x > width / 2) {
            this.rotation = 0.1;
        } else {
            this.rotation = -0.1;
        }
    }
    changeRotation() {
        this.rotationAngle += this.rotation
    }

    getCoords() {
        return (this.position);
    }

    getColour() {
        return (this.colour);
    }
}

class Particle {

    constructor(xPos, yPos, rate, force, colour) {
        this.position = createVector(xPos, yPos);
        this.acceleration = createVector(0, 0);

        this.velocity = p5.Vector.random2D();
        this.velocity.mult(force);

        this.life = 255;
        this.rate = rate;
        this.colour = colour;
    }

    methods() {
        this.update();
        this.lifespan();
        this.display();
    }

    update() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    lifespan() {
        this.life -= this.rate;
    }

    display() {
        stroke(this.colour, this.life, this.life);
        strokeWeight(5);
        point(this.position.x, this.position.y);
    }

    checkDead() {
        if (this.life <= 0) {
            return (true);
        } else if (this.life > 0) {
            return (false);
        }
    }
}

class Tile {

    constructor(tileCenter, tileWidth, tileHeight) {
        this.tileCenter = tileCenter;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    methods() {
        //this.display();
    }

    display() {
        stroke(80, 255, 255);
        noFill();
        strokeWeight(2);
        rect(this.tileCenter.x, this.tileCenter.y, this.tileWidth - 5, this.tileHeight - 5);
        strokeWeight(10);
        point(this.tileCenter.x, this.tileCenter.y);
    }

    getCenter() {
        return (this.tileCenter);
    }
}