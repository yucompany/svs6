"use strict";


/*
    Base class for all elements in scene, has x-coordinate, y-coordinate and scale
*/

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

    if(mult) // If being rendered at a larger scale (zoomed)
      m = mult;

    // Draw ellipse by default
    if(buffer) // Drawn to buffer
      buffer.ellipse(x, y, 50*scale*m, 50*scale*m);
    else // Drawn to canvas
      ellipse(x, y, 50*scale*m, 50*scale*m); 
  }
}

/*
    Class for a letter element 
      1. Has a sequence of images to move through
      2. Assigned a character
      3. Constructed at a specific time
*/

class Letter extends SceneElement {
  constructor(x, y, scale, images, char, timing){
    super(x, y, scale);

    this.char = char;
    this.images = images;
    let empty = this.empty = (images == null || images.length <= 0); // Check if letter is empty, has no images in sequence
    
    this.width = LINEWIDTH/NUMCHARS; this.height = LINEWIDTH/NUMCHARS; // Set width and height of letter based on base number of characters and line width
    this.built = true;
    this.buildings = []; // Timing for each step in build sequence
    
    if(!empty){
      let img = this.image = images[images.length-1]; // Final image in sequence

      // Set width and height of object from image height/width
      if(img != null){
        this.width = img.width;
        this.height = img.height;
      }
      
      // Has a specific timing to be constructed at, not empty
      if(timing >= 0){
        this.built = false;
        for(let i = 0; i < images.length; i++){
          this.buildings.push(timing);
          timing += (Math.random() * .1); // Increment base timing with added offset
        }
      }
    }

    this.index = -1; // Set index outside of array
  }

  // Moves animated sequence for letter building forward by step
  next(){
    let images = this.images;
    let index = this.index;
    if(index < (images.length - 1)){ // Has not finished building
      let i = ++this.index;
      this.image = images[i]; // Set image to draw to frame in sequence
    }
    else
      this.built = true; // Has moved through sequence
  }

  // Reset animation sequence index
  reset(){
    this.index = -1;

    let images = this.images;
    if(images != null)
      this.image = images[images.length-1]; // Set animation to final frame (on end sequence)

    this.built = false;
  }

  render(buffer, mult, t){
    let built = this.built;
    if(!built){ // Has not moved through sequence
       if(t > this.buildings[this.index+1]) // Move to next frame in sequence if time has passed building step time
        this.next();
    }

    // If started sequence, previously -1
    if(this.index >= 0){
      let empty = this.empty;

      // Letter is not an empty space
      if(!empty){

        let x = this.x;
        let y = this.y;
        let scale = this.scale;
        let m = 1;
        if(mult) m = mult;

        let img = this.image;
        let w = this.width * scale * m;
        let h = this.height * scale * m;

        // Set anchor for image
        let x1 = x + (w * .275); 
        let y1 = y - (h * .2);

        // Draw image to buffer/canvas
        if(buffer)
          buffer.image(img, x1 - w/2, y1 - h/2, w, h);
        else
          image(img, x1 - w/2, y1 - h/2, w, h);

      }
    }
  }
}


/*
    Class for a line element
      1. Draws a series of letters along a curve
      2. Drives the building of letters over time
      3. Adjusts the kerning of letters along line
*/
class Line extends SceneElement {

  constructor(x, y, dx, dy, length, scale, charSize, buildTime){
    super(x, y, scale);

    this.dx = dx;
    this.dy = dy;
    this.length = length;
    
    this.charSize = charSize;
    this.charModifier = 1; // Adjust size of characters

    this.letters = []; // Letters along line
    this.spaces = []; // Spaces between letters
    this.sizes = []; // Sizes of letters

    this.stretch = length; // Length of line
    this.segment = length / NUMCHARS; // Length of individual segment (split between letters)

    this.buildTime = buildTime; // Time to construct all letters
  }

  populate(letters, time){
    this.buildTime = time;

    let char, letter;

    let seg = this.segment;

    let len = 0.0; let s = 0; let k=0;
    for(let i = 0; i < letters.length; i++){
      s = CHARTABLE[letters[i]].size; // Fetch size of character from table
      this.sizes.push(s);

      if(i < letters.length-1){
        // Calculate kerning for letter, using current and next character sizes with weighted average
        k = Kerning[CHARTABLE[letters[i]].shape + CHARTABLE[letters[i+1]].shape] * (CHARTABLE[letters[i]].size*2+CHARTABLE[letters[i+1]].size)/3;
        if(CHARTABLE[letters[i]].e.hasOwnProperty(letters[i+1])) // Look for kerning exception, apply
          k *= CHARTABLE[letters[i]].e[letters[i+1]];
      }
      else
        k = 0;
      this.spaces.push(k); // Add to spaces array

      len += (s*CHARSIZE+k*SPACING)*seg; // Add to total length (+ character size + spacing)
    }

      if(len > 0)
        len = this.charModifier = clamp(this.length / len, 0, 1); // Rescale letters if over total allowance
      else 
        len = this.charModifier = 1;

    for(let i = 0; i < letters.length; i++){
      char = letters[i];

      if(assets.letters.hasOwnProperty(char)){  // Construct CHARACTER letter
        letter = new Letter(0, 0, 1, assets.letters[char], char, this.buildTime + Math.random());
      }
      else // Construct EMPTY letter
        letter = new Letter(0, 0, 1, null, char, -1);      
      
        
      let sz = this.sizes[i] * CHARSIZE * this.segment * len * SFW; // Size delta
      let kz = this.spaces[i] * SPACING * this.segment * len * SFW; // Kerning delta

      this.stretch += (sz+kz); // Add to total length from size and kerning

      this.sizes[i] = sz;
      this.spaces[i] = kz;

      this.letters.push(letter); // Add constructed letter
    }
  }

  // Destroy all letters, reset length and segment
  clear(){ 
    this.letters = []; 

    this.stretch = 0;
    this.segment = this.length / NUMCHARS;
    this.spaces = [];
    this.sizes = [];
  }

  // Reset letters to final frame of respective sequences
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

      let ox = -(length/2.0); // Origin (x)
      let oy = -(length/2.0); // Origin (y)
      
      let sx = 0;
      let sy = 0;

      let l; let interval = 0;
      for(let i = 0; i < letters.length; i++){
        l = letters[i];

        // Calculate letter draw position on line, origin + delta
        l.x = x + (ox + sx)*dx*scale;
        l.y = y + (oy + sy)*dy*scale;

        // Append to overall delta (from origin)
        sx += (sizes[i] + spaces[i]);
        sy += (sizes[i] + spaces[i]);

        

        letters[i].render(buffer, scale * SFW * 2.0 * m * CHARSIZE * this.charModifier, t);  // Render letter
      }
    }

    //super.render(buffer, .5);  debug position
  }

}


/*
    Class for a mask element 
      1. Sets the alpha channel of destination from source pixels
*/
class Mask extends SceneElement {
  constructor(x, y, src, dest){
    super(x, y);
  
    this.source = src;
    this.dest = dest;
  }

  mask(x1, y1, x2, y2, t){
    let source = this.source;
    let dest = this.dest;

    return new Promise(function(res, rej){
      // Load all pixels on frame
      source.loadPixels();
      dest.loadPixels();

      for(let i = x1; i < x2; i++){
        for(let j = y1; j < y2; j++){
          let ind = (j * WIDTH + i) * 4; // Calculate pixel position in 1D array

          let s = source.pixels[ind]; // Get color (R value) at position
          if(s > 128)
            dest.pixels[ind + 3] = 0; // If Red channel is > 128 (out of 255), hide pixel in destination
        }
      }

      dest.updatePixels();
      res((Date.now() - t)*2); // Resolve with time it took to mask
    });
    
  }
  
}