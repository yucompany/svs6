"use strict";

// Clamps value between 2 values
function clamp(a, b, c){return Math.max(b,Math.min(c,a));}

// Adds padding to string with leading zeroes
function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}