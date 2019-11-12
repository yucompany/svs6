"use strict";

/*     
    Class for rendering in layers, NOT USED*
*/

class Drawing {
    constructor(){
        this.layers = [];
    }

    // Adds layer to drawing layers
    addLayer(layer){
        this.layers.push(layer);
    }

    // Remove layer from drawing layers
    subtractLayer(layer){
        let index = this.layers.indexOf(object);
        if(index < 0)
            return;
        
        this.layers.splice(index, 1);
    }

    // Go through layers in order and draws to canvas
    render(camera){
        background(0);

        let layers = this.layers;
        if(!layers) // If there are no layers
            return;

        for(let i = 0; i < layers.length; i++) {
            let layer = layers[i];

            let buffer = camera.render(layer);   // Return buffer from layer to draw
            if(layer.blend == "DEFAULT")
                image(buffer, 0, 0);   // Default blending
            else 
                blend(buffer, 0, 0, layer.width, layer.height, 0, 0, layer.width, layer.height, blends[layer.blend]); // Override blending
                
        }
    }
}

