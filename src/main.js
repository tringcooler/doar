define(function (require) {$(document).ready(function() {
    console.log('start');
    
    (function() {
        foo = new (require('core/deck'))();
    })();
    
});});
