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
        return(this.tileCenter);
    }
}