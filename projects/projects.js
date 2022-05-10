let windowXOffset = 17, windowYOffset = 21;

function setup() {
    createCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);

    colorMode(HSB);

    textAlign(CENTER);

    frameRate(70);

    pixelDensity(2);
}

function draw() {
    background(0);

    textSize(32);
    fill(0, 0, 255);
    noStroke();
    text("Under Construction :)", width / 2, 190);
}

function windowResized() {
    resizeCanvas(windowWidth - windowXOffset, windowHeight - windowYOffset);
}