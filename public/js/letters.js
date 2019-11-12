"use strict";

// SQ = Square , TTR = Top-strong Trapezoid, BTR = Bottom-strong Trapezoid

// Table with size information and relative spacing multipliers for each character
const CHARTABLE = {
  "A" : { shape: "BTR", size: 1, e: { F: 1.5, P: 1.5, J: 1, L: 1.1 } },
  "B" : { shape: "SQ", size: .85, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "C" : { shape: "SQ", size: .85, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2}  },
  "D" : { shape: "SQ", size: .85, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "E" : { shape: "SQ", size: .7, e: { F: 1.2, P: 1.2, J: 1.2, L: 1.2 } },
  "F" : { shape: "TTR", size: .8, e: { F: 1.1, P: 1.2, J: 1.2, L: 1.35 } },
  "G" : { shape: "SQ", size: .85, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "H" : { shape: "SQ", size: .9, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "I" : { shape: "I", size: .3, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2, I: 1.5 } },
  "J" : { shape: "J", size: .95, e: { F: 1.5, P: 1.5, J: .85, L: .9 } },
  "K" : { shape: "SQ", size: .9, e: { F: 1.2, P: 1.2, J: 1.2, L: 1.2 } },
  "L" : { shape: "L", size: .8, e: { F: 1.5, P: 1.5, J: .85, L: .9 } },
  "M" : { shape: "SQ", size: 1.2, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2 } },
  "N" : { shape: "SQ", size: .9, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "O" : { shape: "SQ", size: .85, e: { F: 1.3, P: 1.3, J: 1.2, L: 1.2 } },
  "P" : { shape: "TTR", size: .8, e: { F: 1.1, P: 1.35, J: 1.2, L: 1.55  } },
  "Q" : { shape: "BTR", size: .95, e: { F: 1.5, P: 1.5, J: 1, L: 1.2 } },
  "R" : { shape: "SQ", size: .9, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "S" : { shape: "SQ", size: .9, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "T" : { shape: "TTR", size: .9, e: { F: 1.1, P: 1.2, J: .85, L: 1.35 } },
  "U" : { shape: "SQ", size: .85, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "V" : { shape: "TTR", size: 1, e: { F: 1.1, P: 1.2, J: 1.2, L: 1.5 } },
  "W" : { shape: "TTR", size: 1.4, e: { F: 1.1, P: 1.2, J: 1.3, L: 1.5 } },
  "X" : { shape: "SQ", size: .95, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },
  "Y" : { shape: "TTR", size: .95, e: { F: 1.1, P: 1.2, J: .9, L: 1.5 } },
  "Z" : { shape: "SQ", size: .8, e: { F: 1.2, P: 1.2 , J: 1.2, L: 1.2} },

  "@" : { shape: "SQ", size: 1.35, e: { F: 1.2, P: 1.2, J: 1.2, L: 1.2 } },
  "#" : { shape: "SQ", size: .85, e: { F: 1.2, P: 1.2, J: 1.2, L: 1.2 } },
  "-" : { shape: "SQ", size: .55, e: { F: 1.2, P: 1.2, J: 1.2, L: 1.2 } },
  "+" : { shape: "SQ", size: .85, e: { F: 1.2, P: 1.2, J: 1.2, L: 1.2 } },
  " " : { shape: "SQ", size: .35, e: { F: 1.2, P: 1.2, J: 1.2, L: 1.2 } }
}

const NUMCHARS = 6.0; // Base characters per line
const CHARSIZE = .67 * (6.0 / NUMCHARS);  // Base character size
const SPACING = CHARSIZE * (.87); // Base spacing size

// Table with kerning rules between principal character shapes, with exceptions (L, J, I)
const Kerning = {
  "SQSQ"   : 1,
  "SQTTR"  : .9,
  "SQBTR"  : .9,
  "SQL" : .9,
  "SQJ" : .9,
  "SQI" : 1.35,

  "TTRSQ"  : .9,
  "TTRBTR" : .6,
  "TTRTTR" : .8,
  "TTRL" : .7,
  "TTRJ" : .6,
  "TTRI" : 1.2,

  "BTRSQ"  : .9,
  "BTRTTR" : .6,
  "BTRBTR" : .9,
  "BTRL" : .9,
  "BTRJ" : .9,
  "BTRI" : 1.2,

  "LSQ" : .7,
  "LTTR": .3,
  "LBTR" : .7,
  "LL" : .85,
  "LJ" : .7,
  "LI" : 1.1,

  "JSQ" : .7,
  "JTTR": .5,
  "JBTR" : .5,
  "JL" : .9,
  "JJ" : .75,
  "JI" : 1,

  "ISQ" : 1,
  "ITTR": .9,
  "IBTR" : .9,
  "IL" : .9,
  "IJ" : .9,
  "II" : 1
}


// Loads all letter images (frames for build sequence) from static assets
function loadLetter(letter, callback){
    let letters = assets.letters;
    if(letters.hasOwnProperty(letter)){ // If already loaded letter
      callback(letters[letter])
    }
    else {
      let path = "/images/letters/";
      if(letter == "@" || letter == "#" || letter == "+" || letter == "-") path += "SPECIAL/" // Append subfolder if special character
  
      let lt = letter;

      // Translate special characters to path in subfolder
      if(letter == "@") lt = "AT";
      else if(letter == "#") lt = "HASH";
      else if(letter == "+") lt = "PLUS";
      else if(letter == "-") lt = "SUB";
  
      let letterPath = path + lt + "12f"; // Construct full path to sequence images
  
      let loaded = 0;
      let letterImages = [];
        for(let i = 0; i < 12; i++) letterImages.push(null); // Populate array with empty objects
      
      for(let i = 0; i < 12; i++) loadImage(letterPath + "/" + i + ".png", function(image){
        pushImage(i, image);
      });
      
      // Add loaded image to array of images
      function pushImage(i, image){
        ++loaded;
        letterImages[i] = image;
  
        // Has loaded all letters? Add key to lookup
        if(loaded >= 11){
          letters[letter] = letterImages; 
          callback(letterImages); // Has loaded all letter images
        }
      }
    }
  }
  
  // Loads all letters for a string
  function loadName(name, callback){
    if(name.length <= 0) // String was empty, has loaded
      callback();
    else{
      let loaded = 0; let len = name.length;
  
      function onLoadLetter(){ // Callback for when letter images have been loaded
        ++loaded;
        if(loaded >= len)
          callback(); // Has loaded name!
      }
  
      for(let i = 0; i < name.length; i++){
        let char = name[i];
        if(char != " ")
           loadLetter(char, onLoadLetter); // Load individual letter
        else
          onLoadLetter(); // Letter was empty, has loaded
      }
    }
  }