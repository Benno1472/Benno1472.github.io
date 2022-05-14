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
        boids[i].methods(boids);
    }
}

function windowResized() {
    resizeCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);
}

class Boid {
    // Separation: steer to avoid crowding local flockmates
    // Cohesion: steer to move towards the average position of local flockmates

    constructor(position, colour) {
        this.position = position;

        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(1, 2));

        this.acceleration = createVector();

        this.colour = colour;

        this.perceptionRadius = 50;
        this.maxForce = 0.05;
        this.maxSpeed = 2;
    }

    methods(boids) {
        // alignment
        //let alignment = this.align(boids);
        //this.acceleration = alignment;

        this.update();
        this.display();
    }

    display() {
        fill(this.colour, 255, 255);
        ellipse(this.position.x, this.position.y, 5, 5);
    }

    update() {
        // physics engine

        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
    }

    align(boids) {
        // comptue steering vector towards the average heading of local flockmates

        let steeringForce = createVector();
        let localBoidCount = 0;

        for (let i = 0; i < boids.length; i++) {
            // calculate distance between current boid and other boid
            let distance = p5.Vector.dist(this.position, boids[i].getPosition());

            // if the current boid can perceive the other boid
            if (this != boids[i] && distance < this.perceptionRadius) {
                steeringForce.add(boids[i].getVelocity());
                localBoidCount += 1;
            }
        }

        // average velocity (steeringForce) vector of local boids
        if (localBoidCount > 0) {
            steeringForce.div(localBoidCount);
            steeringForce.setMag(this.maxSpeed);
            steeringForce.sub(this.velocity);
            steeringForce.limit(this.maxForce);
        }

        return (steeringForce);
    }

    getPosition() {
        return (this.position);
    }

    getVelocity() {
        return (this.velocity);
    }

} 