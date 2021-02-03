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
    if (!timer.is_over) {
        timer.second--;
        if (timer.second < 0) {
            timer.minute--;
            timer.second = 59;
            if (timer.minute < 0) {
                timer.hour--;
                timer.minute = 59;
                if (timer.hour < 0) {
                    // end of cound down
                    timer.hour = timer.minute = 0;
                    timer.second = 1;
                    //return false;
                    timer.is_over = true;

                    var sound_file = document.getElementById('sound').value;
                    if (sound_file != 'No sound') {
                        sounds[sound_file].play();
                    }
                    return true;
                }
            }
        }
    }
    else {
        timer.second++;
        if (timer.second > 59) {
            timer.minute++;
            timer.second = 0;
            if (timer.minute > 59) {
                timer.hour++;
                timer.minute = 0;
                if (timer.hour > 99) {
                    // end of cound down
                    //timer.hour = timer.minute = timer.second = 0;
                    //return false;
                    timer.is_over = false;
                    return false; // end of timer
                }
            }
        }
    }
    return true;
}



// スクロール禁止
function disable_scroll() {
    // PCでのスクロール禁止
    document.addEventListener("mousewheel", scroll_control, { passive: false });
    // スマホでのタッチ操作でのスクロール禁止
    document.addEventListener("touchmove", scroll_control, { passive: false });
}
// スクロール禁止解除
function enable_scroll() {
    // PCでのスクロール禁止解除
    document.removeEventListener("mousewheel", scroll_control, { passive: false });
    // スマホでのタッチ操作でのスクロール禁止解除
    document.removeEventListener('touchmove', scroll_control, { passive: false });
}

// スクロール関連メソッド
function scroll_control(event) {
    event.preventDefault();
}