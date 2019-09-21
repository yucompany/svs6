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

  constructor(camera){
    let w = this.width = camera.width;
    let h = this.height = camera.height;
    
    this.objects = [];
    this.buffer = createGraphics(w, h)
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
        buffer.background(255, 204, 0);
  }
}

class SceneObject { 
  
  constructor(x, y, scene){
    this.x = x;
    this.y = y;

    this.width = 5;
    this.height = 5;
    
    this.scene = scene;
    this.init();
  }
  
  init() {
    let scene = this.scene;
    scene.register(this);
  }
  
  render(x, y, multiplier, layer){
    let w = this.width;
    let h = this.height;

    if(multiplier){
      w *= multiplier;
      h *= multiplier;
    }

    if(layer){ //Check if drawing object within layer
      layer.buffer.ellipse(x, y, w, h);
      return;
    }

    ellipse(x, y, w, h);
  }
}

class Camera extends SceneObject {
  
  constructor(x, y, width, height, scene){
    super(x, y, scene);
    
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
  
  constructor(x, y, width, height, image, scene){
    super(x, y, scene);
    
    if(width > 0 && height > 0){
      this.width = width;
      this.height = height;
    }
    
    this.image = image;
  }
  
  render(x, y, multiplier){
    let img = this.image;
    if(!img)
      return;
    
    let w = this.width; let h = this.height;
    
    if(w && h){
      if(multiplier){
        w *= multiplier;
        h *= multiplier;
      }

      image(img, x, y, w, h);
      return;
    }
    
    image(img, x, y);
  }
}