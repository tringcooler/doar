define(function(require) {
    
    const
        o_card = require('core/card');
    
    const [
        ST_FLIP, ST_DIR,
    ] = require('core/util').symgen();
    
    class c_card extends o_card {
        
        constructor(info) {
            super(info);
            this.set_stat(ST_FLIP, false);
            this.set_stat(ST_DIR, 0);
        }
        
    }
    
    return c_card;
    
});