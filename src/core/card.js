define(function(require) {
    
    const [
        PL_INFO, PL_STAT,
    ] = require('core/util').symgen();
    
    class c_card {
        
        constructor(info) {
            this[PL_INFO] = info;
            this[PL_STAT] = {};
        }
        
        get_info(key) {
            return this[PL_INFO][key];
        }
        
        set_info(key, val) {
            this[PL_INFO][key] = val;
        }
        
        get_stat(key) {
            return this[PL_STAT][key];
        }
        
        set_stat(key, val) {
            this[PL_STAT][key] = val;
        }
        
    }
    
    return c_card;
    
});