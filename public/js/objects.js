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

class SceneObject { 
  
  constructor(x, y, scene){
    this.x = x;
    this.y = y;
    
    this.scene = scene;
    this.init();
  }
  
  init() {
    let scene = this.scene;
    scene.register(this);
  }
  
  render(x, y){
    ellipse(x, y, 5, 5);
  }
  
}

class Camera extends SceneObject {
  
  constructor(x, y, width, height, scene){
    super(x, y, scene);
    
    this.width = width;
    this.height = height;
    
  }
  
  render(canvas){
    let scene = this.scene;
    let objects = scene.objects;
    
    if(!objects)
      return;
    
    for(let i = 0; i < objects.length; i++){
      let obj = objects[i];
      if(obj != this){
        let dx = (obj.x - this.x);
        let dy = (obj.y - this.y);
        
        
        obj.render(dx, dy);
      }
    }
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
  
  render(x, y){
    let img = this.image;
    if(!img)
      return;
    
    let w = this.width; let h = this.height;
    
    if(w && h){
      image(img, x, y, w, h);
      return;
    }
    
    image(img, x, y);
  }
}