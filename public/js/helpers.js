"use strict";

function clamp(a, b, c){return Math.max(b,Math.min(c,a));}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}