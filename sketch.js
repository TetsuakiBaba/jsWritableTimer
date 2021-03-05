var canvas;
let color_scheme = []; // 0: input, 1: target, 2: text, 3: background
var one_dollar = new DollarRecognizer();
var rectangle_timer = [];
var str_debug;
var id;
var is_counting_down;
var points = [];
var array_pre_bell = {};
var timer = {
    hour: 0,
    minute: 5,
    second: 0,
    set: {
        hour: 0,
        minute: 5,
        second: 0
    },
    is_over: false
};

var str_message = '';
var is_pc;

var click_animation = new StrokeAnimation();

var sounds = {};

function preload() {

    var sels = document.getElementById('sound');
    soundFormats('mp3');
    for (let i = 0; i < sels.length; i++) {
        if (sels[i].value != 'No sound') {
            //            console.log(sels[i].value);
            sounds[sels[i].value] = loadSound(sels[i].value);
            sounds[sels[i].value].setVolume(0.3);
        }
    }

    //console.log(sounds);

}

var time_last_draw;

function mousePressed() {
    userStartAudio();
}

function setup() {
    time_last_draw = millis();
    str_debug = '';
    is_counting_down = false;
    let canvas_width = parseInt(document.getElementById('canvas').clientWidth);
    let canvas_height = canvas_width * (9 / 16);
    canvas = createCanvas(canvas_width, canvas_height, P2D);
    canvas.parent('#canvas');

    if (navigator.userAgent.indexOf('iPhone') > 0 ||
        navigator.userAgent.indexOf('iPod') > 0 ||
        (navigator.userAgent.indexOf('Android') > 0 &&
            navigator.userAgent.indexOf('Mobile') > 0)) {
        //スマホ用の処理
        canvas.touchStarted(cmousePressed);
        canvas.touchMoved(cmouseDragged);
        canvas.touchEnded(cmouseReleased);
        disable_scroll();
        is_pc = false;
    } else if (navigator.userAgent.indexOf('iPad') > 0 ||
        navigator.userAgent.indexOf('Android') > 0) {
        //タブレット用の処理
        canvas.touchStarted(cmousePressed);
        canvas.touchMoved(cmouseDragged);
        canvas.touchEnded(cmouseReleased);
        disable_scroll();
        is_pc = false;
    } else if (navigator.userAgent.indexOf('Safari') > 0 &&
        navigator.userAgent.indexOf('Chrome') == -1 &&
        typeof document.ontouchstart !== 'undefined') {
        //iOS13以降のiPad用の処理
        canvas.touchStarted(cmousePressed);
        canvas.touchMoved(cmouseDragged);
        canvas.touchEnded(cmouseReleased);
        disable_scroll();
        is_pc = false;
    } else {
        canvas.mousePressed(cmousePressed);
        canvas.mouseMoved(cmouseDragged);
        canvas.mouseReleased(cmouseReleased);
        is_pc = true;
    }


    canvas.doubleClicked(cdoubleClicked);

    select('#color_scheme').changed(changedColorScheme);
    select('#font').changed(changedFont);
    select('#message').input(inputMessage);
    select('#sound').changed(changedSound);
    select('#switch_pre_bell_1').changed(changedPreBell);
    select('#switch_pre_bell_2').changed(changedPreBell);
    select('#switch_pre_bell_3').changed(changedPreBell);
    select('#button_manual').mouseClicked(pushedManualButton);
    select('#button_copy_share_link').mouseClicked(copyShareLink);

    textAlign(CENTER, CENTER);
    textFont(document.getElementById('font').value);
    textSize(height / 2);
    frameRate(60);

    var str = document.getElementById('color_scheme').value;
    str = str.replace(/ /g, ''); // 空白の除去
    color_scheme = str.split(',');

    for (let i = 0; i < 4; i++) {
        rectangle_timer[3 - i] = new p5Rectangle(
            i * canvas_width / 4, 0,
            canvas_width / 4, canvas_height);
    }

    document.getElementById('app').style.fontFamily = document.getElementById('font').value;

    // manual(color) に色一覧の要素を作成する
    let options = document.getElementById('color_scheme').options;

    for (let i = 0; i < options.length; i++) {
        let tr = createElement('tr');
        tr.parent('table_color');

        //        console.log(options[i].innerHTML);
        let th = createElement('th', options[i].innerHTML);
        th.parent(tr);

        let colors = options[i].value;
        colors = colors.replace(/ /g, ''); // 空白の除去
        colors = colors.split(',');
        colors.forEach(color => {
            let td = createElement('td', color)
            td.parent(tr);
            td.style('background-color', color);
            td.style('color', getBright(color, mod) > 0.5 ? 'black' : 'white')
        })

    }
    // manual(font)にフォント一覧の要素を作成する
    options = document.getElementById('font').options;
    for (let i = 0; i < options.length; i++) {
        //        console.log(options[i].value);
        let tr = createElement('tr');
        tr.parent('table_font');
        let th = createElement('th', options[i].innerHTML);
        th.parent(tr);
        let td = createElement('td', '0123456789,The quick brown fox jumps over the lazy dog');
        td.style('font-family', options[i].value);
        if (options[i].innerHTML.indexOf('italic') > 0) {
            td.style('font-style', 'italic');
        } else {
            td.style('font-style', 'normal');
        }
        td.parent(tr);
    }


    // URLにGETパラメータがある場合は、それらを設定に反映させる
    var params = (new URL(document.location)).searchParams;
    var color = params.get('color');
    if (color) {
        let options_color_scheme = document.getElementById('color_scheme').options;
        for (let i = 0; i < options_color_scheme.length; i++) {
            if (options_color_scheme[i].innerHTML == color) {
                options_color_scheme[i].selected = true;
                changedColorScheme();
            }
        }
    }

    var font = params.get('font');
    let options_font = document.getElementById('font').options;
    if (options_font) {
        for (let i = 0; i < options_font.length; i++) {
            if (options_font[i].innerHTML == font) {
                options_font[i].selected = true;
                changedFont();
            }
        }
    }

    var bell = params.get('sound');
    let options_bell = document.getElementById('sound').options;
    if (options_bell) {
        for (let i = 0; i < options_bell.length; i++) {
            if (options_bell[i].innerHTML == bell) {
                options_bell[i].selected = true;
                changedSound();
            }
        }
    }

    var bell_1 = params.get('switch_pre_bell_1');
    var bell_2 = params.get('switch_pre_bell_2');
    var bell_3 = params.get('switch_pre_bell_3');
    if (bell_1 == 'true' || bell_2 == 'true' || bell_3 == 'true') {
        document.getElementById('checkbox_pre_bell').hidden = false;

    }
    if (bell_1 == 'true') {
        document.getElementById('switch_pre_bell_1').checked = true;
        array_pre_bell['switch_pre_bell_1'] = {
            min: 1,
            status: true
        };
    }
    if (bell_2 == 'true') {
        document.getElementById('switch_pre_bell_2').checked = true;
        array_pre_bell['switch_pre_bell_2'] = {
            min: 5,
            status: true
        };
    }
    if (bell_3 = 'true') {
        document.getElementById('switch_pre_bell_3').checked = true;
        array_pre_bell['switch_pre_bell_3'] = {
            min: 10,
            status: true
        }
    }


    if (params.get('message')) {
        str_message = params.get('message');
        document.getElementById('message').innerHTML = str_message;
    }

    makeShareLink();
}



function windowResized() {
    let w = document.getElementById('canvas').clientWidth;
    let h = w * (9 / 16);
    resizeCanvas(w, w * (9 / 16));
    for (let i = 0; i < 4; i++) {
        rectangle_timer[3 - i].set(i * w / 4, 0, w / 4, h);
    }
}

var angle_alpha = 0.0;


function keyPressed() {
    // if (key == 's') {
    //     save('output.png');
    // }
}

function draw() {
    background(color_scheme[0]);

    // textSize(12);
    // textAlign(LEFT, TOP);
    // fill(color_scheme[1]);
    // text(frameRate(), 10, 10);

    // rectangle_timer.forEach(rect => {
    //     stroke(255, 0, 0);
    //     rect.draw();
    //     circle(rect.getCenter().x, rect.getCenter().y, 10, 10);
    // });

    // タイマー部分の描画
    noStroke();
    //stroke(0, 0, 0);
    //strokeWeight(10);
    fill(color_scheme[1]);
    textSize(height / 1.7);
    textAlign(CENTER, CENTER);
    let str = nf(timer.minute, 2, 0) + ':' + nf(timer.second, 2, 0);
    text(str, width / 2, height / 2);

    // Messageの描画

    textSize(height / 10.0);
    textAlign(CENTER, TOP);
    text(str_message, width / 2, height * (3 / 4));

    // 入力ストロークの表示
    // strokeWeight(height * width / 50000);
    // strokeCap(PROJECT);
    // stroke(color_scheme[2]);
    // noFill();
    // beginShape();
    // points.forEach(point => {
    //     vertex(point.X, point.Y);
    // });
    // endShape();


    noFill();
    click_animation.draw();


    // console.log(mouseIsPressed);
    // textSize(12);
    // textAlign(LEFT, TOP);
    // text(mouseIsPressed, 10, 10);
    // if (mouseIsPressed) {
    //     points[points.length] = new Point(mouseX, mouseY);
    // }


    // pause の表示
    if (!is_counting_down) {
        noStroke();
        angle_alpha += 0.5;
        let rect_alpha = parseInt(50 + abs(100 * sin(radians(angle_alpha))));
        rect_alpha = rect_alpha.toString(16);
        //console.log(rect_alpha);
        fill(color_scheme[1] + rect_alpha);
        rectMode(CENTER);
        rect(width / 2, height / 2, width, height / 10);

        fill(color_scheme[2]);
        textSize(height / 10);
        textAlign(CENTER, CENTER);
        text('pause', width / 2, height / 2);
    } else if (timer.is_over) { // 制限時間オーバー
        noStroke();
        angle_alpha += 3.0;
        let rect_alpha = parseInt(50 + abs(100 * sin(radians(angle_alpha))));
        rect_alpha = rect_alpha.toString(16);
        //console.log(rect_alpha);
        fill('#FF0000' + rect_alpha);
        rectMode(CENTER);
        rect(width / 2, height / 2, width, height / 10);

        fill(color_scheme[2]);
        textSize(height / 10);
        textAlign(CENTER, CENTER);
        text('time up', width / 2, height / 2);
    }

    // textSize(12);
    // textAlign(LEFT, TOP);
    // text(str_debug, 10, 20);

    if ((millis() - time_last_draw) > 5000) {
        noLoop();
    }

}


function changedColorScheme() {
    var str = document.getElementById('color_scheme').value;
    str = str.replace(/ /g, ''); // 空白の除去
    color_scheme = str.split(',');
    makeShareLink();

    draw();
}

function cmousePressed() {
    //    console.log("mousePressed", mouseX, mouseY);
    if (!is_pc) {
        disable_scroll();
    }
    click_animation.setReady(mouseX, mouseY, width * height / 100000, color_scheme[2]);
    points = [];
    // 以下のコメントアウトは，iOSだとこの最初の座標が以前の値の飛び値なので無視することにしました．
    //points[0] = new Point(mouseX, mouseY);
    //str_debug = points[0].X + ", " + points[0].Y;

    // 省電力モードになってたらloop()を開始してcanvasを描く
    if (!isLooping()) {
        frameRate(60);
        loop();
    }

}

function cmouseDragged() {
    //    console.log("mouseMoved");
    if (mouseIsPressed) {
        points[points.length] = new Point(mouseX, mouseY);
    }


    // 省電力モードになってたらloop()を開始してcanvasを描く
    if (!isLooping()) {
        frameRate(60);
        loop();
    }
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
    //console.log("mouseReleased", points.length);
    if (points.length >= 10) {
        let str;
        str = "new Unistroke(\"name\", new Array(";

        for (let i = 0; i < points.length; i++) {
            if (i == points.length - 1) {
                str += "new Point(" + String(parseInt(points[i].X)) + "," + String(parseInt(points[i].Y)) + ")";
            } else {
                str += "new Point(" + String(parseInt(points[i].X)) + "," + String(parseInt(points[i].Y)) + "),";
            }
        }
        str += '));';
        //console.log(str)

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
        //console.log(dists);

        var result = one_dollar.Recognize(points, true);
        //console.log(result);

        //console.log("length of points:", points.length);
        let number_recognized;
        if (result.Name == 'No match.') {
            number_recognized = 0;
        } else if (result.Name == 'c') {
            timer.hour = timer.minute = timer.second = 0;
            points = [];
            return;
        } else {
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


    } else {
        // single click -> start timer or pause timer

        if (is_counting_down) {
            clearInterval(id);
        } else {
            id = setInterval(function () {
                if (!countdown()) {
                    clearInterval(id);
                }
            }, 1000);
        }


        is_counting_down = !is_counting_down;
        points = [];
    }

    points = [];

    // 省電力モードになってたらloop()を開始してcanvasを描く
    time_last_draw = millis();
    console.log(time_last_draw);
    if (!isLooping()) {
        frameRate(60);
        loop();
    }


}

function cdoubleClicked() {
    //    console.log("double clicked");
    timer.hour = timer.set.hour;
    timer.minute = timer.set.minute;
    timer.second = timer.set.second;
    timer.is_over = false;

    if (is_counting_down) {
        clearInterval(id);
    } else { }

    is_counting_down = false;
    points = [];
}

function changedFont() {

    //console.log(this.value());
    let id_selected = document.getElementById('font').selectedIndex;
    //console.log(document.getElementById('font').options[id_selected].innerHTML);
    if (document.getElementById('font').options[id_selected].innerHTML.indexOf('italic') > 0) {
        textStyle(ITALIC);
        document.getElementById('app').style.fontStyle = 'italic';
    } else {
        textStyle(NORMAL)
        document.getElementById('app').style.fontStyle = 'normal';
    }
    textFont(document.getElementById('font').options[id_selected].value);
    document.getElementById('app').style.fontFamily = document.getElementById('font').options[id_selected].value;

    makeShareLink();

    // 省電力モードになってたらloop()を開始してcanvasを描く
    time_last_draw = millis();
    console.log(time_last_draw);
    if (!isLooping()) {
        frameRate(60);
        loop();
    }
}


function inputMessage() {
    str_message = this.value();
    makeShareLink();
    // 省電力モードになってたらloop()を開始してcanvasを描く
    time_last_draw = millis();
    console.log(time_last_draw);
    if (!isLooping()) {
        frameRate(60);
        loop();
    }
}


function changedSound() {
    //console.log(this.value());
    var selected = document.getElementById('sound');
    if (selected.value != 'No sound') {
        sounds[selected.value].play();
        document.getElementById('checkbox_pre_bell').hidden = false;
    }
    else {
        document.getElementById('checkbox_pre_bell').hidden = true;
        // no soundを選択した時
    }

    makeShareLink();
    // 省電力モードになってたらloop()を開始してcanvasを描く
    time_last_draw = millis();
    console.log(time_last_draw);
    if (!isLooping()) {
        frameRate(60);
        loop();
    }
}

function changedPreBell() {
    //console.log(this.id(), this.value(), this.checked());
    array_pre_bell[this.id()] = {
        min: this.value(),
        status: this.checked()
    };

    makeShareLink();
    //console.log(array_pre_bell);
}

function pushedManualButton() {

    if (this.value() == 'false') {
        this.value('true');
    } else {
        this.value('false');
    }

    if (this.value() == 'true') {
        if (!is_pc) {
            enable_scroll();
        }
    } else {
        if (!is_pc) {
            disable_scroll();
        }
    }

}

function makeShareLink() {
    let text = document.getElementById('text_share_link');
    //    console.log(location.hostname + location.pathname);
    // colorのパラメータ設定
    {
        let id_selected = document.getElementById('color_scheme').selectedIndex;
        let str = '?color=' + document.getElementById('color_scheme').options[id_selected].innerHTML;
        text.value = location.protocol + '//' + location.hostname + location.pathname + str;
    }
    // fontのパラメータ設定
    {
        let id_selected = document.getElementById('font').selectedIndex;
        let str = '&font=' + document.getElementById('font').options[id_selected].innerHTML;
        str = str.replace(/ /g, '+');
        text.value += str;
    }
    // soundのパラメータ設定
    {
        let id_selected = document.getElementById('sound').selectedIndex;
        let str = '&sound=' + document.getElementById('sound').options[id_selected].innerHTML;
        str = str.replace(/ /g, '+');
        text.value += str;
    }
    // pre-bellのパラメータ設定
    {
        if (Object.keys(array_pre_bell).length > 0) {
            var str = '';
            for (let i in array_pre_bell) {
                str += '&' + i.toString() + '=' + array_pre_bell[i].status;
            }
            text.value += str;
        }

    }
    // messageのパラメータ設定
    {
        let str = '&message=' + document.getElementById('message').value;
        str = str.replace(/ /g, '+');
        text.value += str;
    }
}

function copyShareLink() {
    var text_share_link = document.getElementById("text_share_link");
    var button = document.getElementById("button_copy_share_link");
    // 文字をすべて選択
    text_share_link.select();
    // コピー
    document.execCommand("copy");
    button.classList.remove('btn');
    button.classList.remove('btn-outline-secondary');
    button.classList.add('btn');
    button.classList.add('btn-outline-success');
    document.getElementById('button_copy_share_link').innerHTML = 'copied to clipboard';
    setTimeout(function () {
        document.getElementById('button_copy_share_link').innerHTML = 'copy share link';
        button.classList.remove('btn');
        button.classList.remove('btn-outline-success');
        button.classList.add('btn');
        button.classList.add('btn-outline-secondary');
    }, 1500);


}