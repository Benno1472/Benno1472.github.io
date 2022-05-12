let windowXOffset = 17, windowYOffset = 21;

// array of boids
let boids = [];

function setup() {
    createCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);

    colorMode(HSB);

    textAlign(CENTER);

    frameRate(70);

    pixelDensity(2);

    // spawn boids
    for (let i = 0; i < 100; i++) {
        // compute random position vector
        let pos = createVector(random(width), random(height));
        // compute colour
        let colour = random(255);

        // create boid object
        let boid = new Boid(pos, colour);
        // add boid to array
        boids.push(boid);
    }
}

function draw() {
    background(0);

    textSize(32);
    fill(0, 0, 255);
    noStroke();
    text("Under Construction :)", width / 2, 190);

    // boids methods
    for (let i = 0; i < boids.length; i++) {
        boids[i].methods();
    }
}

function windowResized() {
    resizeCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);
}

class Boid {
    /* Separation: steer to avoid crowding local flockmates
       Alignment: steer towards the average heading of local flockmates
       Cohesion: steer to move towards the average position of local flockmates */

    constructor(position, colour) {
        this.position = position;
        this.velocity = null;
        this.acceleration = null;

        this.colour = colour
    }

    methods() {
        this.update();
        this.display();
    }

    display() {
        fill(this.colour, 255, 255);
        ellipse(this.position.x, this.position.y, 10, 10);
    }

    update() {
        // physics engine

        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
    }

} 