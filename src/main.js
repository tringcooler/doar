define(function (require) {$(document).ready(function() {
    console.log('start');
    
    (function() {
        foo = new (require('core/deck'))();
        foo.put('d');
        foo.put('c');
        foo.put('b');
        foo.put('a');
    });
    
    (() => {
        foo = new (require('core/tagtab'))();
    })();
    
});});
