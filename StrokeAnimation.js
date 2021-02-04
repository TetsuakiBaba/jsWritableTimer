class Sprite {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.r = 10;
        this.life = 0;
        this.v_x = 0.0;
        this.v_y = 0.0;
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.life_max = 50;
        this.birth_rate = 50; // 0 - 100
    }
    set(_x, _y, _r, _red, _green, _blue) {
        this.x = _x;
        this.y = _y;
        let speed = width * height / 1000000;
        this.v_x = random(-speed, speed);
        this.v_y = random(-speed, speed);
        this.life = 0;//random(this.life_max);
        this.red = _red;
        this.green = _green;
        this.blue = _blue;
        this.r = _r;
    }
    draw() {
        if (this.life > 0) {
            this.x += this.v_x;
            this.y += this.v_y;

            strokeWeight(this.r);
            stroke(this.red, this.green, this.blue, 255 * (this.life / this.life_max));
            vertex(this.x, this.y);
            this.life--;
        }
        else {
            if (mouseIsPressed) {
                if (random(0, 100) < this.birth_rate) {
                    this.life = random(this.life_max);
                    this.x = mouseX;
                    this.y = mouseY;
                }
            }
        }
    }
}

class StrokeAnimation {
    constructor() {
        this.sprites = [];
        for (let i = 0; i < 100; i++) {
            this.sprites[i] = new Sprite();
        }

    }
    setReady(_x, _y, _r, _color) {
        var code = _color;;
        var red = parseInt(code.substring(1, 3), 16);
        var green = parseInt(code.substring(3, 5), 16);
        var blue = parseInt(code.substring(5, 7), 16);
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].set(_x, _y, _r, red, green, blue);
        }
    }
    draw() {

        beginShape(POINTS);
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].draw();
        }
        endShape();
    }
}