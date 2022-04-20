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

    display() {
        fill(this.colour, 255, 255);
        noStroke();

        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotationAngle);
        rect(0, 0, 5, 15);
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