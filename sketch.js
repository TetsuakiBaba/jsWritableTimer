var canvas;
let color_scheme = []; // 0: input, 1: target, 2: text, 3: background
var scribble = new Scribble(); // global mode
var one_dollar = new DollarRecognizer();
var rectangle_timer = [];
scribble.bowing = 1.0;
scribble.roughness = 1.5;
var id;
var is_counting_down;
var points = [];
var timer = {
    hour: 0,
    minute: 5,
    second: 0,
    set: {
        hour: 0,
        minute: 5,
        second: 0
    }
};

// 左上を0,0座標とする四角クラス
class p5Rectangle {
    constructor(_x, _y, _w, _h) {
        this.x = _x;
        this.y = _y;
        this.w = _w;
        this.h = _h;
    }
    set(_x, _y, _w, _h) {
        this.x = _x;
        this.y = _y;
        this.w = _w;
        this.h = _h;
    }
    draw() {
        rect(this.x, this.y, this.w, this.h);
    }
    // 渡した座標が四角内にあるかどうかの判定
    inside(_x, _y) {
        if (_x >= this.x && _x <= this.x + this.w &&
            _y >= this.y && _y <= this.x + this.h) {
            return true;
        }
    }
    getCenter() {
        var data = {
            x: this.x + this.w / 2,
            y: this.y + this.h / 2
        };
        return data;
    }

};

function countdown() {
    timer.second--;
    if (timer.second < 0) {
        timer.minute--;
        timer.second = 59;
        if (timer.minute < 0) {
            timer.hour--;
            timer.minute = 59;
            if (timer.hour < 0) {
                // end of cound down
                timer.hour = timer.minute = timer.second = 0;
                return false;
            }
        }
    }
    return true;
}

class Sprite {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.r = 10;
        this.life = 0;
        this.v_x = 0.0;
        this.v_y = 0.0;
    }
    set(_x, _y, _r, _color) {
        this.x = _x;
        this.y = _y;
        this.v_x = random(-3.0, 3.0);
        this.v_y = random(-3.0, 3.0);
        this.life = random(5);
        this.color = _color;
        this.r = _r;

    }
    draw() {
        if (this.life > 0) {
            this.x += this.v_x;
            this.y += this.v_y;

            strokeWeight(1);
            stroke(this.color);
            vertex(this.x, this.y);
            this.life--;
        }
    }
}

class ClickAnimation {
    constructor() {
        this.sprites = [];
        for (let i = 0; i < 50; i++) {
            this.sprites[i] = new Sprite();
        }

    }
    setReady(_x, _y, _r, _color) {
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].set(_x, _y, _r, _color);
        }
    }
    draw() {
        beginShape();
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].draw();
        }
        endShape(CLOSE);
    }
}

var click_animation = new ClickAnimation();

function setup() {
    is_counting_down = false;
    let canvas_width = parseInt(document.getElementById('canvas').clientWidth);
    let canvas_height = canvas_width * (9 / 16);
    canvas = createCanvas(canvas_width, canvas_height);
    canvas.mousePressed(cmousePressed);
    canvas.mouseReleased(cmouseReleased);
    //canvas.mouseDragged(cmouseDragged);
    canvas.doubleClicked(cdoubleClicked);
    canvas.parent('#canvas');

    select('#color_scheme').changed(changedColorScheme);
    select('#font').changed(changedFont);

    textAlign(CENTER, CENTER);
    textFont('Share Tech Mono');
    //textFont('Roboto Mono');
    textSize(height / 2);
    frameRate(30);

    var str = document.getElementById('color_scheme').value;
    str = str.replace(/ /g, ''); // 空白の除去
    color_scheme = str.split(',');



    for (let i = 0; i < 4; i++) {
        rectangle_timer[3 - i] = new p5Rectangle(
            i * canvas_width / 4, 0,
            canvas_width / 4, canvas_height);
    }
    console.log(rectangle_timer);
}

function windowResized() {
    let w = document.getElementById('canvas').clientWidth;
    let h = w * (9 / 16);
    resizeCanvas(w, w * (9 / 16));
    for (let i = 0; i < 4; i++) {
        rectangle_timer[3 - i].set(i * w / 4, 0, w / 4, h);
    }
}


function draw() {
    background(color_scheme[0]);

    // rectangle_timer.forEach(rect => {
    //     stroke(255, 0, 0);
    //     rect.draw();
    //     circle(rect.getCenter().x, rect.getCenter().y, 10, 10);
    // });
    // タイマー部分の描画
    noStroke();
    fill(color_scheme[1]);
    textSize(height / 1.7);
    textAlign(CENTER, CENTER);
    let str = nf(timer.minute, 2, 0) + ':' + nf(timer.second, 2, 0);
    text(str, width / 2, height / 2);

    // 入力ストロークの表示
    strokeWeight(height * width / 30000);
    strokeCap(PROJECT);
    stroke(color_scheme[2]);
    noFill();
    beginShape();
    points.forEach(point => {
        vertex(point.X, point.Y);
    });
    endShape();

    click_animation.draw();
    // if (mouseIsPressed) {
    //     points[points.length] = new Point(mouseX, mouseY);
    // }
}

function keyPressed() {
    if (key == ' ') {
        var id = setInterval(function () {
            if (!countdown()) {
                clearInterval(id);
            }
        }, 1000);
    }
}

function changedColorScheme() {
    var str = document.getElementById('color_scheme').value;
    str = str.replace(/ /g, ''); // 空白の除去
    color_scheme = str.split(',');
}

function cmousePressed() {
    console.log("mousePressed", mouseX, mouseY);
    click_animation.setReady(mouseX, mouseY, 2, color_scheme[1]);
    points = [];
    points[0] = new Point(mouseX, mouseY);
}

function mouseDragged() {
    console.log("mouseDraggud");
    points[points.length] = new Point(mouseX, mouseY);
}

function centroid(_points) {
    let sum_x = 0;
    let sum_y = 0;
    _points.forEach(point => {
        sum_x += point.X;
        sum_y += point.Y;
    });
    var data_return = {
        x: sum_x / _points.length,
        y: sum_y / _points.length
    }
    return data_return;
}
function cmouseReleased() {
    console.log("mouseReleased", points.length);
    if (points.length >= 10) {
        let str;
        str = "new Unistroke(\"name\", new Array(";

        for (let i = 0; i < points.length; i++) {
            if (i == points.length - 1) {
                str += "new Point(" + String(parseInt(points[i].X)) + "," + String(parseInt(points[i].Y)) + ")";
            }
            else {
                str += "new Point(" + String(parseInt(points[i].X)) + "," + String(parseInt(points[i].Y)) + "),";
            }
        }
        str += '));';
        console.log(str)

        // 数字入力された位置を特定して，該当する数値を変更する
        // 入力ストロークの中心位置を計算する
        let position_center = centroid(points);

        let dists = [];
        for (let i = 0; i < rectangle_timer.length; i++) {
            let d = dist(position_center.x, position_center.y,
                rectangle_timer[i].getCenter().x, rectangle_timer[i].getCenter().y);
            dists[i] = {
                id: i,
                value: d
            };
        }

        // distsを値をキーにしてソート
        dists.sort(function (a, b) {
            if (a.value < b.value) return -1;
            if (a.value > b.value) return 1;
            return 0;
        });
        console.log(dists);

        var result = one_dollar.Recognize(points, true);
        console.log(result);

        console.log("length of points:", points.length);
        let number_recognized;
        if (result.Name == 'No match.') {
            number_recognized = 0;
        }
        else if (result.Name == 'c') {
            timer.hour = timer.minute = timer.second = 0;
            points = [];
            return;
        }
        else {
            number_recognized = parseInt(result.Name);
        }

        // 桁数に応じた箇所を認識した文字で更新する
        // 秒1桁目        
        let s = timer.second;
        let m = timer.minute;
        let s_10;
        let s_1;

        switch (dists[0].id) {
            case 0:
                s_10 = parseInt(s / 10);
                s_1 = parseInt(s % 10);
                timer.second = s_10 * 10 + number_recognized;
                break;
            case 1:
                s_10 = parseInt(s / 10);
                s_1 = parseInt(s % 10);
                timer.second = 10 * number_recognized + s_1;
                break;
            case 2:
                m_10 = parseInt(m / 10);
                m_1 = m % 10;
                timer.minute = m_10 * 10 + number_recognized;
                break;
            case 3:
                m_10 = parseInt(m / 10);
                m_1 = m % 10;
                timer.minute = 10 * number_recognized + m_1;
                break;
        }
        timer.set.hour = timer.hour;
        timer.set.minute = timer.minute;
        timer.set.second = timer.second;

        points = [];


    }
    else {
        // single click -> start timer or pause timer

        if (is_counting_down) {
            clearInterval(id);
        }
        else {
            id = setInterval(function () {
                if (!countdown()) {
                    clearInterval(id);
                }
            }, 1000);
        }


        is_counting_down = !is_counting_down;
        points = [];
    }


}

function cdoubleClicked() {
    console.log("double clicked");
    timer.hour = timer.set.hour;
    timer.minute = timer.set.minute;
    timer.second = timer.set.second;

    if (is_counting_down) {
        clearInterval(id);
    }
    else {
    }
    click_animation.setReady(mouseX, mouseY, 2, color_scheme[1]);
    is_counting_down = false;
    points = [];
}

function changedFont() {
    console.log(this.value());
    textFont(this.value());
}