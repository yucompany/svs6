"use strict";

const VALID_CHARS = "A C E I L N O S V Y";

const nameform = document.forms["nameform"];
    const firstname = nameform["firstname"];
    const lastname = nameform["lastname"];

const verifyName = function(){
    var throwError = function(){
       alert("Invalid name input, cannot contain characters besides:\n" + VALID_CHARS);
    }
    var throwAccept = function(f, l){
        construct(f, l);
    }


    let first = firstname.value.toUpperCase();
    let last = lastname.value.toUpperCase();

    let char = "";
    for(let i = 0; i < first.length; i++){
        if(!VALID_CHARS.includes(first[i])){
            throwError();
            return;
        }
    }

    for(let i = 0; i < last.length; i++){
        if(!VALID_CHARS.includes(last[i])){
            throwError();
            return;
        }
    }

    throwAccept(first, last);
}

$('#nameform').submit(function(e){
    e.preventDefault();
    verifyName();

    return false;
});