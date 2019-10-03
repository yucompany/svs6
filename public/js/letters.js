"use strict";

// SQ = Square , TTR = Top-strong Trapezoid, BTR = Bottom-strong Trapezoid

const CHARTABLE = {
  "A" : { shape: "BTR", size: 1, e: {F: 1.67} },
  "B" : { shape: "SQ", size: 1, e: {} },
  "C" : { shape: "SQ", size: 1, e: {}  },
  "D" : { shape: "SQ", size: 1, e: {} },
  "E" : { shape: "SQ", size: .95, e: {} },
  "F" : { shape: "TTR", size: .9, e: {} },
  "G" : { shape: "SQ", size: 1, e: {} },
  "H" : { shape: "SQ", size: 1, e: {} },
  "I" : { shape: "SQ", size: .6, e: {} },
  "J" : { shape: "BTR", size: 1, e: {F: 1.67} },
  "K" : { shape: "SQ", size: 1, e: {} },
  "L" : { shape: "BTR", size: .85, e: {} },
  "M" : { shape: "SQ", size: 1.67, e: {} },
  "N" : { shape: "SQ", size: 1, e: {} },
  "O" : { shape: "SQ", size: 1, e: {} },
  "P" : { shape: "TTR", size: 1, e: {} },
  "Q" : { shape: "BTR", size: 1, e: {F: 1.67} },
  "R" : { shape: "SQ", size: 1, e: {} },
  "S" : { shape: "SQ", size: 1, e: {} },
  "T" : { shape: "TTR", size: 1, e: {} },
  "U" : { shape: "SQ", size: 1, e: {} },
  "V" : { shape: "TTR", size: 1, e: {} },
  "W" : { shape: "TTR", size: 1.67, e: {} },
  "X" : { shape: "SQ", size: 1, e: {} },
  "Y" : { shape: "TTR", size: 1.2, e: {} },
  "Z" : { shape: "SQ", size: 1, e: {} },

  "@" : { shape: "SQ", size: 1.5, e: {} },
  "#" : { shape: "SQ", size: 1, e: {} },
  "-" : { shape: "SQ", size: 1, e: {} },
  "+" : { shape: "SQ", size: 1, e: {} },
  " " : { shape: "SQ", size: .33, e: {} }
}

const NUMCHARS = 7.0;
const CHARSIZE = .7 * (6.0 / NUMCHARS); 
const SPACING = CHARSIZE * (.9);

const Kerning = {
  "SQSQ"   : 1,
  "SQTTR"  : .67,
  "SQBTR"  : .9,

  "TTRSQ"  : .67,
  "TTRBTR" : .75,
  "TTRTTR" : .9,

  "BTRSQ"  : .9,
  "BTRTTR" : .75,
  "BTRBTR" : 1
}


function loadLetter(letter, callback){
    let letters = assets.letters;
    if(letters.hasOwnProperty(letter)){
      callback(letters[letter])
    }
    else {
      let path = "/images/letters/";
      if(letter == "@" || letter == "#" || letter == "+" || letter == "-") path += "SPECIAL/"
  
      let lt = letter;
      if(letter == "@") lt = "AT";
      else if(letter == "#") lt = "HASH";
      else if(letter == "+") lt = "PLUS";
      else if(letter == "-") lt = "SUB";
  
      let letterPath = path + lt + "12f";
  
      let loaded = 0;
      let letterImages = [];
        for(let i = 0; i < 12; i++) letterImages.push(null);
      
      for(let i = 0; i < 12; i++) loadImage(letterPath + "/" + i + ".png", function(image){
        pushImage(i, image);
      });
      
      function pushImage(i, image){
        ++loaded;
        letterImages[i] = image;
  
        if(loaded >= 11){
          letters[letter] = letterImages;
          callback(letterImages);
        }
      }
    }
  }
  
  function loadName(name, callback){
    if(name.length <= 0)
      callback();
    else{
      let loaded = 0; let len = name.length;
  
      function onLoadLetter(){
        ++loaded;
        if(loaded >= len)
          callback();
      }
  
      for(let i = 0; i < name.length; i++){
        let char = name[i];
        if(char != " ")  loadLetter(char, onLoadLetter);
        else  onLoadLetter();
      }
    }
  }