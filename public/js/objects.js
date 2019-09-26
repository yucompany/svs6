"use strict";


class Scene {
  
  constructor(width, height){
    this.width = width;
    this.height = height;
    
    this.objects = [];
  }
  
  register(object){
    if(!(object instanceof SceneObject)) return;
    
    let objects = this.objects;
    let index = objects.indexOf(object);
    if(index > -1) return;
    
    objects.push(object);
  }
  
  unregister(object){
    let index = this.objects.indexOf(object);
    if(index < 0)
        return;
    
    this.objects.splice(index, 1);
  }
}

class SceneLayer {

  constructor(camera, blend){
    let w = this.width = camera.width;
    let h = this.height = camera.height;
    
    this.objects = [];
    this.buffer = createGraphics(w, h)
    
    if(blend)
      this.blend = blend;
    else 
      this.blend = "DEFAULT";
    }

  add(object){
    if(!(object instanceof SceneObject)) return;
    
    let objects = this.objects;
    let index = objects.indexOf(object);
    if(index > -1) return;
    
    objects.push(object);
  }
  
  remove(object){
    let index = this.objects.indexOf(object);
    if(index < 0)
        return;
    
    this.objects.splice(index, 1);
  }

  render(){
    let buffer = this.buffer;
        buffer.clear();
  }
}

class SceneObject { 
  
  constructor(x, y, scale, scene){
    this.x = x;
    this.y = y;

    if(scale >= 0) this.scale = scale;
    else this.scale = 1;
    
    this.scene = scene;
    this.init();
  }
  
  init() {
    let scene = this.scene;
    scene.register(this);
  }
  
  render(x, y, multiplier, layer){
    let scale = this.scale;

    if(multiplier) scale *= multiplier;

    this.display(x, y, scale, layer);
  }

  display(x, y, sc, layer) {
    if(layer)
      layer.buffer.ellipse(x, y, sc, sc);
    else
      ellipse(x, y, sc, sc);
  }
}

class Camera extends SceneObject {
  
  constructor(x, y, width, height, scene){
    super(x, y, 1, scene);
    
    this.width = width;
    this.height = height;
    this.z = 1;
  }
  
  zoom(amount){
    let z = this.z;
    this.z = clamp(z + amount, 0, 10);
  }

  render(layer){
    if(!layer) return;

    layer.render();

    let objects = layer.objects;
    if(!objects)
      return;

    let w2 = this.width / 2;
    let h2 = this.height / 2;

    let x = this.x; let cx = (x + w2); 
    let y = this.y; let cy = (y + h2);
    let z = this.z;

    for(let i = 0; i < objects.length; i++){
      let obj = objects[i];
      if(obj != this){
        // Apply zoom to object's camera relative position
        let dcx = z*(obj.x - cx);
        let dcy = z*(obj.y - cy);

        let dx = (dcx + w2);
        let dy = (dcy + h2);
        
        obj.render(dx, dy, z, layer);
      }
    }

    return (layer.buffer);
  }
  
}

class SceneImage extends SceneObject {
  
  constructor(x, y, scale, width, height, image, scene){
    super(x, y, scale, scene);

    let img = this.image = image;
    
    if(width > 0 && height > 0){
      this.width = width;
      this.height = height;
    }
    else{
      this.width = img.width;
      this.height = img.height;
    }
  }
  
  render(x, y, multiplier, layer){
    let img = this.image;
    if(!img)
      return;
    
    let w = this.width; let h = this.height;

    let m = multiplier;
    let s = this.scale;
    
    this.display(x, y, Math.floor(w*s*m), Math.floor(h*s*m), img, layer);
  }

  display(x, y, w, h, img, layer){
    if(img){
      if(layer)
        layer.buffer.image(img, x, y, w, h);
      else
        image(img, x, y, w, h);
    }
  }
}

class SceneVideo extends SceneImage {

}

class SceneMask extends SceneImage {
  constructor(x, y, scale, width, height, image, color, scene){
    super(x, y, scale, width, height, image, scene);

    this.r = color[0];
    this.g = color[1];
    this.b = color[2];
    this.debug = 0;
  }

  render(x, y, multiplier, layer){
    
    if(layer){
      let image = this.image;
          image.loadPixels();

      let buffer = layer.buffer;
          buffer.loadPixels();

      let ap = image.pixels;
      let bp = buffer.pixels;

      let masked = false;
      for(let i = 0; i < ap.length; i += 4){
        masked = (ap[i] > 128);
        
        if(masked)bp[i+3] = 0;
      }

      buffer.updatePixels();
    }
    
    //super.render(x, y, multiplier, layer);
  }

  
}

class SceneImageSequence extends SceneImage {

  constructor(x, y, scale, width, height, images, scene, wraps){
      super(x, y, scale, width, height, images[0], scene);

    this.frames = images;
    this.index = 0;
    this.wrap = wraps;
  }

  next(){
    let index = this.index;
    let images = this.frames;

    if(index >= (images.length-1)){
      let wrap = this.wrap;
      if(wrap) this.index = 0;
    } else
        ++this.index;
  }

  previous(){
    let index = this.index;
    let images = this.frames;

    if(index <= 0){
      let wrap = this.wrap;
      if(wrap) this.index = (images.length - 1);
    } else
        --this.index;
  }

  reset(){ this.index = 0; }

  render(x, y, multiplier, layer){
    let images = this.frames;
    let index = this.index;

    if(index >= 0)
      this.image = images[index];
    else
      this.image = null;

    super.render(x, y, multiplier, layer);
  }

}

class SceneGroup extends SceneObject {
  constructor(x, y, scale, scene){
    super(x, y, scale, scene);

    this.objects = [];
  }

  add(object){
    if(!(object instanceof SceneObject)) return;
    
    let objects = this.objects;
    let index = objects.indexOf(object);
    if(index > -1) return;
    
    objects.push(object);
  }
  
  remove(object){
    let index = this.objects.indexOf(object);
    if(index < 0)
        return;
    
    this.objects.splice(index, 1);
  }

  clear(){ this.objects = []; }

  render(x, y, multiplier, layer){
    let objects = this.objects;

    let ex = x;
    let ey = y;

    let scale = this.scale;

    if(objects && objects.length != 0){
      let e;
      for(let i = 0; i < objects.length; i++){
        e = objects[i];

        ex = x + scale*(e.x);
        ey = y + scale*(e.y);

        objects[i].render(ex, ey, scale*multiplier, layer);
      }
    }
  }
}

class SceneLineGroup extends SceneGroup {
  constructor(ax, ay, dx, dy, scale, scene){
    super(ax, ay, scale, scene);

     this.dx = dx;
     this.dy = dy;
  }

  render(x, y, multiplier, layer){
    let objects = this.objects;
    let ex = x; let dx = this.dx;
    let ey = y; let dy = this.dy;

    let scale = this.scale;
    if(objects && objects.length != 0){
      let e; let interval = 0;
      for(let i = 0; i < objects.length; i++){
        e = objects[i];

        if(objects.length <= 1)
          interval = 0;
        else{
          interval = (1.0*i) / (objects.length - 1);
        }

        ex = x + scale*dx*interval;
        ey = y + scale*dy*interval;

        objects[i].render(ex, ey, scale*multiplier, layer);
      }
    }
  }
}


/* * * * * * * * * * * * * * * * * * *
              Entities
* * * * * * * * * * * * * * * * * * */

class Letter extends SceneImageSequence {

  constructor(images, scene){
    super(0, 0, 1, -1, -1, images, scene, false);

    this.building = false;
    this.buildTime = 0.0; this.buildDuration = (2 - 1.67)*Math.random() + 1.67;

    this.index = -1;
  }

  build(){ super.next(); }

  reset(){ this.index = -1; this.building = false; this.buildTime = 0; }

  render(x, y, multiplier, layer){
    if(this.building && this.index < (this.frames.length-1)){
      let r = Math.random();
      if(r <= clamp(this.buildTime / this.buildDuration, 0, 1)) this.build();

      this.buildTime += timeDelta;
    }

    super.render(x, y, multiplier, layer);
  }
}

class Line extends SceneLineGroup {
  
  build(){
    let objects = this.objects;
    for(let i = 0; i < objects.length; i++)
      objects[i].building = true;
  }

  reset(){
    let objects = this.objects;
    for(let i = 0; i < objects.length; i++)
      objects[i].reset();
  }
}