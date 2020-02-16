define(function(require) {
    
    const [
    
        // for common
        PR_STMP,
    
        // for tag node
        PR_PREV,
        MTD_PREV, MTD_AFTER,
        
        // for tag
        MTD_COMPILE,
        
        // for tag tab
        MTD_NEWSTAMP,
        
    ] = require('core/util').symgen();
    
    class c_tagnode {
        
        constructor() {
            this[MTD_PREV](null);
        }
        
        [MTD_PREV](prev) {
            this[PR_PREV] = prev;
        }
        
        [MTD_AFTER](dst) {
            let nd = this;
            while(nd) {
                if(nd === dst) {
                    return true;
                }
            }
            return false;
        }
        
    }
    
    function _bs2tr(src, tr, trstk) {
        let bui = src.indexOf('(');
        let bdi = src.indexOf(')');
        if(bdi >= 0 && (bdi < bui || bui < 0)) {
            if(trstk.length <= 0) {
                return null;
            }
            let s1 = src.slice(0, bdi);
            if(s1) {
                tr.push(s1);
            }
            return _bs2tr(src.slice(bdi + 1), trstk.pop(), trstk);
        }
        if(bui >= 0) {
            let s1 = src.slice(0, bui);
            if(s1) {
                tr.push(s1);
            }
            let trn = [];
            tr.push(trn);
            trstk.push(tr);
            return _bs2tr(src.slice(bui + 1), trn, trstk);
        }
        if(src) {
            tr.push(src);
        }
        return tr;
    }
    bs2tr = _bs2tr;
    bstst = ["aaaa(bbb(c))ddd((ee()fff)ggg)", [], []]
    console.log(_bs2tr(...bstst));
    console.log(bstst);
    
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