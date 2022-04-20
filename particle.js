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