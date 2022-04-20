// reduce canvas size so no scrollbar appears
let windowXOffset = 17, windowYOffset = 21;

// configure tile rows and columns
let columns = 4, rows = 4;

// boolean for controlling the sequence of simulation
let sequence = true;

let fireworks = [], particles = [], tiles = [], tilesAvailable = [], curves = [], facts = [];

function preload() {
    // load facts into array (only works in server environment, otherise cors error)
    facts = loadStrings("facts.txt");
}

function setup() {
    createCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);

    colorMode(HSB);

    frameRate(70);

    rectMode(CENTER);

    // calculate where each tile should be on screen
    calculateTiles(rows, columns);
}

function draw() {
    background(0);

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