define(function(require) {
    
    const [
    
        // for common
        PR_STMP,
    
        // for tag node
        PR_TAB, PR_PREV,
        PL_CACHE,
        MTD_UPDATE,
        PP_DIRTY,
        
        // for tag
        MTD_COMPILE,
        
        // for tag tab
        MTD_NEWSTAMP,
        
    ] = require('core/util').symgen();
    
    class c_tagnode {
        
        constructor(tab) {
            this[PR_TAB] = tab;
            this[PL_CACHE] = new Set()
        }
        
        [MTD_UPDATE](prev) {
            this[PR_PREV] = prev;
            this[PR_STMP] = this[PR_TAB][MTD_NEWSTAMP]();
        }
        
        [MTD_CHECK](dst) {
            return this[PL_CACHE].has(dst)
        }
        
    }
    
    class c_tag {
        
        constructor(src) {
        }
        
        [MTD_COMPILE](src) {
            
        }
        
    }
    
    class c_tagtab {
        
        constructor() {
            this[PR_STMP] = 1;
        }
        
        [MTD_NEWSTAMP]() {
            return this[PR_STMP] ++;
        }
        
    }
    
    return c_tagtab;
    
});