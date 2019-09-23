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
    console.log("Added : " + object.name);
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
    console.log("Added : " + object.name);
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
    if(layer)
      layer.buffer.image(img, x, y, w, h);
    else
      image(img, x, y, w, h);
  }
}

class SceneVideo extends SceneImage {
  constructor(x, y, scale, width, height, video, scene){
    super(x, y, scale, width, height, video, scene);
  }
  
  render(x, y, multiplier, layer){
    super.render(x, y, multiplier, layer);
  }

  display(x, y, w, h, img, layer){
    super.display(x, y, w, h, img, layer);
  }
}

class SceneImageSequence extends SceneImage {

  constructor(x, y, scale, width, height, images, scene){
    super(x, y, scale, width, height, images[0], scene);

    this.frames = images;
    this.index = -1;
  }

  render(x, y, multiplier, layer){
    let images = this.frames;
    let index = this.index;

    if(index >= (images.length-1))
      this.index = 0;
    else
      ++this.index;

    this.image = images[this.index];

    super.render(x, y, multiplier, layer);
  }

}