// ==UserScript==
// @name         BratishkinBot
// @namespace    http://tampermonkey.net/
// @version      1.4.88ar
// @description  try to take over the world!
// @author       Flyink13, DarkKeks, xi
// @match        https://pixel.vkforms.ru/*
// @downloadURL  https://raw.githubusercontent.com/S1ROZHA/BratishkinPixelBot/master/PixelDefender.js
// @updateURL    https://raw.githubusercontent.com/S1ROZHA/BratishkinPixelBot/master/PixelDefender.js
// @grant        none
// ==/UserScript==

function BratishkinBot() {
    window.BratishkinBot = BratishkinBot;
    BratishkinBot.url = {
        script: 'https://raw.githubusercontent.com/SpawnerHocKoB/Desturm/master/PixelDefender.js'
    };
    BratishkinBot.refreshTime = 300;
    BratishkinBot.pts = 30;
    BratishkinBot.tc = "rgb(0, 0, 0)";
    BratishkinBot.doCoordLog = true;
    BratishkinBot.currentUrl = '';
    BratishkinBot.urlGen = {
        script: function() {
            return BratishkinBot.url.script + '?v=' + Math.random()
        },
        image: function() {
            return new Promise(function(resolve, reject) {
                fetch('https://gist.githubusercontent.com/SpawnerHocKoB/2a0a17c713d48b22de0709fc61d8f44f/raw/6c049bd2264bcaf48d88665adb1fa541a13f0c32/navalny.json').then(function(data) {
                        data.json().then(function(answer){
                            resolve(answer.currentTarget);
                        }).catch(function(e) {
                            BratishkinBot.state.textContent = "E120: " + e;
                            reject();
                        });
                }).catch(function(e){
                    BratishkinBot.state.textContent = "E121: " + e;
                    resolve(BratishkinBot.currentUrl);
                });
            });
        }
    };
    BratishkinBot.state = document.createElement("div");
    BratishkinBot.state.onclick = BratishkinBot.reload;
    BratishkinBot.state.textContent = "Загрузка приложения...";
    Object.assign(BratishkinBot.state.style, {
        background: "rgba(0,0,0,0.5)",
        bottom: "0px",
        right: "0px",
        width: "100%",
        height: "100%",
        lineHeight: "500px",
        textAlign: "center",
        color: "#fff",
        position: "fixed",
        zIndex: 10000
    });
    document.body.appendChild(BratishkinBot.state);
    BratishkinBot.loger = document.createElement("div");
    BratishkinBot.loger.onclick = BratishkinBot.reload;
    Object.assign(BratishkinBot.loger.style, {
        background: "rgba(0,0,0,0)",
        top: "0px",
        left: "0px",
        width: "250px",
        height: "100%",
        color: "#fff",
        position: "fixed",

        fontSize: "11px",
        padding: "12px",
        zIndex: 10001
    });
    document.body.appendChild(BratishkinBot.loger);
    BratishkinBot.log = function(x) {
        BratishkinBot.loger.innerHTML += x + "<br>";
        if (BratishkinBot.loger.scrollTo) {
            BratishkinBot.loger.scrollTo(0, 10000);
        } else {
            BratishkinBot.loger.scrollTop = BratishkinBot.loger.scrollHeight;
        }
    }
    ;
    BratishkinBot.setState = function(s) {
        BratishkinBot.state.innerHTML = "BratishkinBot " + s;
        BratishkinBot.log(s)
    }
    ;
    BratishkinBot.reloadImage = function() {
        BratishkinBot.urlGen.image().then(function(url) {
            if (!BratishkinBot.img) {
                BratishkinBot.img = new Image();
                BratishkinBot.img.crossOrigin = "Anonymous";
                BratishkinBot.img.onload = function() {
                    BratishkinBot.setState("перезагрузил зону защиты.");
                    if (BratishkinBot.inited) BratishkinBot.getFullData();
                };
            }
            if (url != BratishkinBot.currentUrl) {
                BratishkinBot.img.src = url;
                BratishkinBot.currentUrl = url;
            }
        });
    };
    BratishkinBot.canvasEvent = function(type, q) {
        if (!BratishkinBot.canvas)
            return;
        if (type == "mousewheel") {
            BratishkinBot.canvas.dispatchEvent(new WheelEvent("mousewheel",q));
        } else {
            BratishkinBot.canvas.dispatchEvent(new MouseEvent(type,q));
        }
    }
    ;

    BratishkinBot.parseRgb = function(rgb) {
        return rgb.replace('rgb(', '').replace(')', '').split(', ').map(function(e){return +e;});
    };
    BratishkinBot.canvasClick = function(x, y, color) {
        BratishkinBot.resetZoom();
        if (x > 1590) {
            BratishkinBot.canvasMoveTo(1590, 0);
            x = x - 1590
        } else {
            BratishkinBot.canvasMoveTo(0, 0)
        }
        var q = {
            bubbles: true,
            cancelable: true,
            button: 1,
            clientX: x,
            clientY: y + 1,
            layerX: x,
            layerY: y + 1
        };
        var pxColor = BratishkinBot.getColor(BratishkinBot.ctx.getImageData(x, y + 1, 1, 1).data, 0);
        var colors = document.getElementsByClassName('color');
        var colorEl = null;
        var mindelta = 999999;
        if (colors.length == 0) {
            return;
        }
        for (var i = 0; i < colors.length; i++) {
            var colorElRgb = BratishkinBot.parseRgb(colors[i].style.backgroundColor);
            var neededRgb = BratishkinBot.parseRgb(color);
            var delta = Math.abs(colorElRgb[0] - neededRgb[0]) + Math.abs(colorElRgb[1] - neededRgb[1]) + Math.abs(colorElRgb[2] - neededRgb[2]);
            if (delta < mindelta) {
                mindelta = delta;
                colorEl = colors[i];
            };
        }
        if (!colorEl) {
            console.log("color error %c " + color, 'background:' + color + ';');
            BratishkinBot.setState("Ошибка подбора цвета " + color);
            return
        } else if (pxColor == color) {
            if (BratishkinBot.doCoordLog) {
                console.log("== " + x + "x" + y + "%c " + pxColor, 'background:' + pxColor + ';');
                BratishkinBot.setState("Пропускаю " + (x + 1) + "x" + (y + 1) + " совпал цвет")
            } else {
                console.log("==");
                BratishkinBot.setState("Пропускаю, совпал цвет")
            }
            return
        } else {
            if (BratishkinBot.doCoordLog) {
                console.log(x + "x" + y + "%c " + pxColor + " -> %c " + color, 'background:' + pxColor + ';', 'background:' + color + ';');
                BratishkinBot.setState("Поставил точку " + (x + 1) + "x" + (y + 1))
            } else {
                console.log(" -> ");
                BratishkinBot.setState("Поставил точку")
            }
        }
        colorEl.click();
        BratishkinBot.canvasEvent("mousedown", q);
        BratishkinBot.canvasEvent("click", q);
        q.button = 0;
        BratishkinBot.canvasEvent("mouseup", q);
        document.getElementsByTagName('button')[0].click()
    }
    ;
    BratishkinBot.draw = function() {
        var px = BratishkinBot.pixs.shift();
        if (!px) {
            BratishkinBot.setState("Точек нет")
        } else {
            BratishkinBot.canvasClick(px[0], px[1], px[2])
        }
    }
    ;
    BratishkinBot.canvasMove = function(x, y) {
        var q = {
            bubbles: true,
            cancelable: true,
            button: 1,
            clientX: 0,
            clientY: 0
        };
        BratishkinBot.canvasEvent("mousedown", q);
        q.clientY = y;
        q.clientX = x;
        BratishkinBot.canvasEvent("mousemove", q);
        BratishkinBot.canvasEvent("mouseup", q)
    }
    ;
    BratishkinBot.canvasMoveTo = function(x, y) {
        BratishkinBot.canvasMove(10000, 10000);
        BratishkinBot.canvasMove(-40 - x, -149 - y)
    }
    ;
    BratishkinBot.getImageData = function() {
        var data = BratishkinBot.ctx.getImageData(0, 1, 1590, 400).data;
        return data
    }
    ;
    BratishkinBot.getColor = function(data, i) {
        return "rgb(" + data[i] + ", " + data[i + 1] + ", " + data[i + 2] + ")"
    }
    ;
    BratishkinBot.getFullData = function() {
        BratishkinBot.pixs = [];
        BratishkinBot.pixs = BratishkinBot.randomShuffle(BratishkinBot.getData(0));
        BratishkinBot.setState("осталось точек:" + BratishkinBot.pixs.length);
        return BratishkinBot.pixs.length
    }
    ;
    BratishkinBot.getData = function(offsetX) {
        BratishkinBot.resetZoom();
        BratishkinBot.canvasMoveTo(offsetX, 0);
        var id1 = BratishkinBot.getImageData();
        BratishkinBot.ctx.drawImage(BratishkinBot.img, -offsetX, 1);
        var id2 = BratishkinBot.getImageData();
        var data = [];
        for (var i = 0; i < id1.length; i += 4) {
            var x = offsetX + (i / 4) % 1590
              , y = ~~((i / 4) / 1590);
            if (BratishkinBot.getColor(id1, i) !== BratishkinBot.getColor(id2, i) && BratishkinBot.getColor(id2, i) !== BratishkinBot.tc) {
                data.push([x, y, BratishkinBot.getColor(id2, i), BratishkinBot.getColor(id1, i)])
            }
        }
        return data
    };

    BratishkinBot.randomShuffle = function(data) {
        var currentIndex = data.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = data[currentIndex];
            data[currentIndex] = data[randomIndex];
            data[randomIndex] = temporaryValue
        }
        return data
    };

    BratishkinBot.resetZoom = function() {
        BratishkinBot.canvasEvent("mousewheel", {
            deltaY: 100000,
            deltaX: 0,
            clientX: 100,
            clientY: 100,
        });
    };

    BratishkinBot.init = function() {
        BratishkinBot.inited = 1;
        BratishkinBot.getFullData();
        BratishkinBot.setState("Запущен.")
    };

    BratishkinBot.wait = setInterval(function() {
        if (window.localStorage.getItem('DROP_FIRST_TIME') != '1') {
            document.querySelector(".App__advance > .Button.primary").click();
        } else if (window.localStorage.getItem('DROP_HEADER') != '1') {
            document.querySelector(".Header__close").click();
        } else if (!BratishkinBot.inited && BratishkinBot.canvas) {
            BratishkinBot.ctx = BratishkinBot.canvas.getContext("2d");
            BratishkinBot.init()
        } else if (BratishkinBot.canvas && document.querySelector(".Ttl__wait")) {
            BratishkinBot.timer = 1
        } else if (!BratishkinBot.canvas) {
            var all = document.querySelectorAll("canvas");
            for(var i = 0; i < all.length; ++i) {
                if(all[i].style.display != 'none') {
                    BratishkinBot.canvas = all[i];
                }
            }
        } else if (!BratishkinBot.pts) {
            BratishkinBot.reload();
            BratishkinBot.pts = 30
        } else if (BratishkinBot.inited && BratishkinBot.canvas) {
            BratishkinBot.pts--;
            BratishkinBot.draw()
        }
    }, 1000);

    BratishkinBot.refresh = setTimeout(function() {
        location.reload()
    }, BratishkinBot.refreshTime * 1e3);

    BratishkinBot.reload = function() {
        BratishkinBot.state.outerHTML = "";
        BratishkinBot.loger.outerHTML = "";
        clearInterval(BratishkinBot.wait);
        var script = document.createElement('script');
        script.type = 'application/javascript';
        script.src = BratishkinBot.urlGen.script();
        document.body.appendChild(script)
    };

    BratishkinBot.reloadImage();
    console.log("BratishkinBot loaded")
}

if (window.loaded) {
    BratishkinBot();
} else {
    var inject = function() {
        window.loaded = 1;
        var script = document.createElement('script');
        script.appendChild(document.createTextNode('(' + BratishkinBot + ')();'));
        (document.body || document.head || document.documentElement).appendChild(script);
    };

    //if (document.readyState == 'complete') inject();
    window.addEventListener("load", function() {
        inject();
    });
}
window.alert = function(smth){document.location.reload();}
setTimeout(function(){document.location.reload();}, 1200000);
