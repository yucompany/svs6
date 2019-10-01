"use strict";

// SQ = Square , TTR = Top-strong Trapezoid, BTR = Bottom-strong Trapezoid

const CHARTABLE = {
  "A" : { shape: "BTR", size: 1.1 },
  "B" : { shape: "SQ", size: 1 },
  "C" : { shape: "SQ", size: 1 },
  "D" : { shape: "SQ", size: 1},
  "E" : { shape: "SQ", size: .87},
  "F" : { shape: "TTR", size: 1},
  "G" : { shape: "SQ", size: 1},
  "H" : { shape: "SQ", size: 1},
  "I" : { shape: "SQ", size: .33},
  "J" : { shape: "BTR", size: 1},
  "K" : { shape: "SQ", size: 1},
  "L" : { shape: "BTR", size: .75},
  "M" : { shape: "SQ", size: 1},
  "N" : { shape: "SQ", size: 1},
  "O" : { shape: "SQ", size: 1},
  "P" : { shape: "TTR", size: 1},
  "Q" : { shape: "BTR", size: 1},
  "R" : { shape: "SQ", size: 1},
  "S" : { shape: "SQ", size: 1},
  "T" : { shape: "TTR", size: 1},
  "U" : { shape: "SQ", size: 1},
  "V" : { shape: "TTR", size: 1},
  "W" : { shape: "TTR", size: 1},
  "X" : { shape: "SQ", size: 1},
  "Y" : { shape: "TTR", size: 1},
  "Z" : { shape: "SQ", size: 1},

  "@" : { shape: "SQ", size: 1},
  "#" : { shape: "SQ", size: 1},
  "-" : { shape: "SQ", size: 1},
  "+" : { shape: "SQ", size: 1},
  " " : { shape: "SQ", size: .33}
}

const SPACING = 8;
const NUMCHARS = 7.0;

const Kerning = {
  "SQSQ"   : 1,
  "SQTTR"  : .5,
  "SQBTR"  : .5,

  "TTRSQ"  : .87,
  "TTRBTR" : -.167,
  "TTRTTR" : .33,

  "BTRSQ"  : .87,
  "BTRTTR" : -.167,
  "BTRBTR" : .87
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