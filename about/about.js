// reduce canvas size so no scrollbar appears
let windowXOffset = 17, windowYOffset = 21;

// configure tile rows and columns
let columns = 4, rows = 4;

// boolean for controlling the sequence of simulation
let sequence = true;

let fireworks = [], particles = [], tiles = [], rawFacts = [], facts = []

function preload() {
    // load facts into array (only works in server environment, otherwise CORS error)
    rawFacts = loadStrings("facts.txt");
}

function setup() {
    createCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);

    colorMode(HSB);

    textAlign(CENTER);

    frameRate(70);

    rectMode(CENTER);

    // setting pixel density to 2 optimizes performance on mobile devices
    pixelDensity(2);

    // remove blank lines / entries from facts array
    for (let i = 0; i < rawFacts.length; i++) {
        if (rawFacts[i].length != 0) {
            facts.push(rawFacts[i]);
        }
    }

    // calculate the tile positions depending on screen size
    calculateTiles(rows, columns);
}

function draw() {
    background(0);

    // under construction stuff
    textSize(32);
    fill(0, 0, 255);
    noStroke();
    text("Under Construction :)", width / 2, 190);

    if (sequence == true) {
        if (frameCount % 60 == 0) {
            // pick an available tile 
            tile = pickTile();
            // set the tile status to unavailable
            tile.setUnavailable();

            // pick a random position for the firework to spawn (below window)
            let pos = createVector(random(width), height);

            // compute bezier curve between firework and tile
            let curvePoints = computeCurve(pos, tile.getCenter());
            // create firework object 
            fireworks.push(new Firework(random(windowWidth), curvePoints));

            // check if another sequence can occur
            if (getTilesAvailable().length <= 0) {
                sequence = false;
            }
        }
    }

    // fireworks methods
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].methods();

        if (fireworks[i].checkExploded() == true) {
            let tempCoords = fireworks[i].getCoords();
            let tempcolour = fireworks[i].getColour();

            for (let j = 0; j < 100; j++) {
                particles.push(new Particle(tempCoords.x, tempCoords.y, random(3, 9), random(1, 5), tempcolour));
            }

            // remove the firework
            fireworks.splice(i, 1);

            // find the closest tile
            closestTile = findClosestTile(tempCoords);
            // create dom element for the tile
            closestTile.createDOM(tempcolour);
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
    // calculate tile dimensions
    let tileWidth = Math.round(width / columns);
    let tileHeight = Math.round(height / rows);

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            // pick random factData
            let factData = pickFactData();
            // compute the center position of each tile
            tileCenter = createVector((i * tileWidth) + tileWidth / 2, (j * tileHeight) + tileHeight / 2);
            // add tile object to tiles array
            tiles.push(new Tile(tileCenter, tileWidth, tileHeight, factData));
        }
    }
}

function pickTile() {
    // get available tiles
    let availableTiles = getTilesAvailable();

    // select a random available tile
    let selected = random(availableTiles);

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


function pickFactData() {
    // select random fact data
    let selected = random(facts);

    // remove it from the array
    let index = facts.indexOf(selected);
    facts.splice(index, 1);

    // return the fact data
    return (selected);
}

function getTilesAvailable() {
    // returns an array of available tiles
    let availableTiles = []

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].getAvailable() == true) {
            availableTiles.push(tiles[i]);
        }
    }

    return (availableTiles);
}

function findClosestTile(fireworkPosition) {
    // finds the closest tile to a given position

    // set closest tile to some intial value (in this case first free tile)
    let closestTile = tiles[0];

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].getShown() == false) {
            // calculate distance between firework and closest tile 
            let d1 = p5.Vector.dist(fireworkPosition, closestTile.getCenter());

            // calculate distance between firework and current freeTile
            let d2 = p5.Vector.dist(fireworkPosition, tiles[i].getCenter());

            if (d2 < d1) {
                closestTile = tiles[i];
            }
        }
    }

    return (closestTile);
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

    constructor(tileCenter, tileWidth, tileHeight, factData) {
        this.tileCenter = tileCenter;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.factData = factData;

        this.available = true;
        this.shown = false;
    }

    methods() {
        //this.display();
    }

    display() {
        stroke(80, 255, 255);
        noFill();
        strokeWeight(1);
        rect(this.tileCenter.x, this.tileCenter.y, this.tileWidth, this.tileHeight);
        strokeWeight(5);
        point(this.tileCenter.x, this.tileCenter.y);
    }

    getCenter() {
        return (this.tileCenter);
    }

    getAvailable() {
        return (this.available);
    }

    getShown() {
        return (this.shown);
    }

    setUnavailable() {
        this.available = false;
    }

    createDOM(colour) {
        let tileElement = createElement('p', this.factData);

        // html
        tileElement.style('color', `hsl(${colour}, 100%, 50%)`);
        tileElement.size(this.tileWidth - 4, this.tileHeight - 4);
        tileElement.position(this.tileCenter.x - (this.tileWidth / 2) + 10, this.tileCenter.y - (this.tileHeight / 2) - 6);

        //css
        tileElement.style('text-align', 'center');
        tileElement.style('font-size', '140%');
        //tileElement.style('background-color', 'brown');

        this.shown = true;
    }
}
