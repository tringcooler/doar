define(function(require) {
    
    let sym_gen = function*() {
        while(true) {
            yield Symbol();
        }
    };
    
    return {
        'symgen': sym_gen,
    };
    
});