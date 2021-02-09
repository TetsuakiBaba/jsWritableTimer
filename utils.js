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
    let value_return = true;

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
                    time_last_draw = millis();
                    loop();
                    value_return = true;
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
                    value_return = false; // end of timer
                }
            }
        }

    }

    // もし省電力モードにしていたら drawが動いてないので、このタイミングでcanvas描画をしておく
    if (!isLooping()) {
        draw();
    }
    return value_return;;
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


// Thanks!!: https://qiita.com/fnobi/items/d3464ba0e4b6596863cb
// 補正付きの明度取得
var getBright = function (colorcode, mod) {
    // 先頭の#は、あってもなくてもOK
    if (colorcode.match(/^#/)) {
        colorcode = colorcode.slice(1);
    }

    // 無駄に、ケタを動的に判断してるので、
    // 3の倍数ケタの16進数表現ならOK etc) #ff0000 #f00 #fff000000
    var keta = Math.floor(colorcode.length / 3);

    if (keta < 1) {
        return false;
    }

    // 16進数をparseして、RGBそれぞれに割り当て
    var rgb = [];
    for (var i = 0; i < 3; i++) {
        rgb.push(parseInt(colorcode.slice(keta * i, keta * (i + 1)), 16));
    }

    // 青は暗めに見えるなど、見え方はRGBそれぞれで違うので、
    // それぞれ補正値を付けて、人間の感覚に寄せられるようにした
    var rmod = mod.r || 1;
    var gmod = mod.g || 1;
    var bmod = mod.b || 1;

    // 明度 = RGBの最大値
    var bright = Math.max(rgb[0] * rmod, rgb[1] * gmod, rgb[2] * bmod) / 255;

    // 明度を返す
    return bright;
};


// 補正はとりあえず、こんなもんがよさげだった
var mod = { r: 0.9, g: 0.8, b: 0.4 };