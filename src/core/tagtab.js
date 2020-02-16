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
    
    function _bs2tr(src) {
        let tr = [];
        let bstr = src
        while(bstr) {
            let _match = false;
            let _synerr = false;
            bstr = bstr.replace(/(.*?)\((.*)\)/, (m, g1, g2) => {
                _match = true;
                tr.push(g1);
                let _subs = _bs2tr(g2);
                if(_subs === null) {
                    _synerr = true;
                    return '';
                }
                tr.push(_subs);
                return '';
            });
            if(!_match) {
                if(_synerr || bstr.match(/\(/) || bstr.match(/\)/)) {
                    return null;
                } else {
                    tr.push(bstr);
                    break;
                }
            }
        }
        return tr;
    }
    bs2tr = _bs2tr;
    console.log(_bs2tr("aaaa(bbb(c))ddd((ee()fff)ggg)"));
    
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