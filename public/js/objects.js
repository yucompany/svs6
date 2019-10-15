"use strict";

class SceneElement {
  constructor(x, y, scale){
    this.x = x;
    this.y = y;

    if(scale) this.scale = scale;
    else this.scale = 1;
  }

  render(buffer, mult){
    let x = this.x;
    let y = this.y;
    let scale = this.scale;
    let m = 1;

    if(mult)
      m = mult;

    if(buffer)
      buffer.ellipse(x, y, 50*scale*m, 50*scale*m);
    else
      ellipse(x, y, 50*scale*m, 50*scale*m);
  }
}

class Letter extends SceneElement {
  constructor(x, y, scale, images, char, timing){
    super(x, y, scale);

    this.char = char;
    this.images = images;
    let empty = this.empty = (images == null || images.length <= 0);
    
    this.width = LINEWIDTH/NUMCHARS; this.height = LINEWIDTH/NUMCHARS;
    this.built = true;
    this.buildings = [];
    
    if(!empty){
      let img = this.image = images[images.length-1];

      if(img != null){
        this.width = img.width;
        this.height = img.height;
      }
      
      if(timing >= 0){
        this.built = false;
        for(let i = 0; i < images.length; i++){
          this.buildings.push(timing);
          timing += (Math.random() * ((Math.random()) / 12.0));
        }
      }
    }

    this.index = -1;
  }

  next(){
    let images = this.images;
    let index = this.index;
    if(index < (images.length - 1)){
      let i = ++this.index;
      this.image = images[i];
    }
    else
      this.built = true;
  }

  reset(){
    this.index = -1;

    let images = this.images;
    if(images != null)
      this.image = images[images.length-1];

    this.built = false;
  }

  render(buffer, mult, t){
    let built = this.built;
    if(!built){
       if(t > this.buildings[this.index+1])
        this.next();
    }

    if(this.index >= 0){
      let empty = this.empty;
      if(!empty){
        let x = this.x;
        let y = this.y;
        let scale = this.scale;
        let m = 1;
        if(mult) m = mult;

        let img = this.image;
        let w = this.width * scale * m;
        let h = this.height * scale * m;

        let x1 = x + (w * .275);
        let y1 = y - (h * .2);

        if(buffer)
          buffer.image(img, x1 - w/2, y1 - h/2, w, h);
        else
          image(img, x1 - w/2, y1 - h/2, w, h);
      }
    }

    //super.render(buffer, mult);  //debug position
  }
}

class Line extends SceneElement {

  constructor(x, y, dx, dy, length, scale, charSize, buildTime){
    super(x, y, scale);

    this.dx = dx;
    this.dy = dy;
    this.length = length;
    
    this.charSize = charSize;
    this.charModifier = 1;

    this.letters = [];
    this.spaces = [];
    this.sizes = [];

    this.stretch = length;
    this.segment = length / NUMCHARS;

    this.buildTime = buildTime;
  }

  populate(letters, time){
    this.buildTime = time;

    let char, letter;

    let seg = this.segment;

    let len = 0.0; let s = 0; let k=0;
    for(let i = 0; i < letters.length; i++){
      s = CHARTABLE[letters[i]].size;
      this.sizes.push(s);

      if(i < letters.length-1){
        k = Kerning[CHARTABLE[letters[i]].shape + CHARTABLE[letters[i+1]].shape] * (CHARTABLE[letters[i]].size*2+CHARTABLE[letters[i+1]].size)/3; // Append shape constants to lookup kerning in table
        if(CHARTABLE[letters[i]].e.hasOwnProperty(letters[i+1]))
          k *= CHARTABLE[letters[i]].e[letters[i+1]];
      }
      else
        k = 0;
      this.spaces.push(k);

      len += (s*CHARSIZE+k*SPACING)*seg;
    }

      if(len > 0)
        len = this.charModifier = clamp(this.length / len, 0, 1); //Rescale letters if over total allowance
      else 
        len = this.charModifier = 1;

    for(let i = 0; i < letters.length; i++){
      char = letters[i];

      if(assets.letters.hasOwnProperty(char)){
        letter = new Letter(0, 0, 1, assets.letters[char], char, this.buildTime + Math.random());
      }
      else
        letter = new Letter(0, 0, 1, null, char, -1);      
      
        
      let sz = this.sizes[i] * CHARSIZE * this.segment * len;
      let kz = this.spaces[i] * SPACING * this.segment * len;

      this.stretch += (sz+kz);

      this.sizes[i] = sz;
      this.spaces[i] = kz;

      this.letters.push(letter);
    }
  }

  clear(){ 
    this.letters = []; 

    this.stretch = 0;
    this.segment = this.length / NUMCHARS;
    this.spaces = [];
    this.sizes = [];
  }

  reset(){
    let letters = this.letters;
    for(let i = 0; i < letters.length; i++){
       letters[i].reset();
    }
  }

  render(buffer, mult, t){
    let letters = this.letters;
    if(letters && letters.length != 0){
      let x = this.x;
      let y = this.y;
      let scale = this.scale;
      let m = 1;
      if(mult)
        m = mult;

      let dx = this.dx;
      let dy = this.dy;

      let length = this.stretch;
      let spaces = this.spaces;
      let sizes = this.sizes;
      let segment = this.segment;

      let ox = -(length/2.0);
      let oy = -(length/2.0);
      
      let sx = 0;
      let sy = 0;

      let l; let interval = 0;
      for(let i = 0; i < letters.length; i++){
        l = letters[i];

        l.x = x + (ox + sx)*dx*scale;
        l.y = y + (oy + sy)*dy*scale;

        sx += (sizes[i] + spaces[i]);
        sy += (sizes[i] + spaces[i]);

        

        letters[i].render(buffer, scale * 2.0 * m * CHARSIZE * this.charModifier, t);
      }
    }

    //super.render(buffer, .5);  debug position
  }

}

class Mask extends SceneElement {
  constructor(x, y, src, dest){
    super(x, y);
  
    this.source = src;
    this.dest = dest;

    console.log(src);
    console.log(dest);
  }

  mask(x1, y1, x2, y2, t){
    return new Promise(function(res, rej){
      let source = this.source;
      let dest = this.dest;

      source.loadPixels();
      dest.loadPixels();

      let s = source.pixels;
      let d = dest.pixels;

      for(let i = x1; i < x2; i++){
        for(let j = y1; j < y2; j++){
          let ind = (j * WIDTH + i) * 4;

          if(s[ind] > 100)
            d[ind + 3] = 0;
        }
      }

      dest.updatePixels();
      res((Date.now() - t));
    }.bind(this))
    
  }
  
}