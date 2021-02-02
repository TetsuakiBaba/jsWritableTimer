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
