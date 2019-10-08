self.addEventListener( 'message', ( evt ) => {
    let s = evt.data[0];
    let d = evt.data[1];

    for(let i = 0; i < s.length; i += 4)
        if(s[i] > 100) d[i+3] = 0;

    self.postMessage(d);
} );  
