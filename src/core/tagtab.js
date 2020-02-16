define(function(require) {
    
    const [
    
        // for common
        PR_STMP,
    
        // for tag node
        PR_PREV,
        MTD_PREV, MTD_AFTER,
        
        // for tag
        PR_TAB,
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
    
    const [
        TS_SEP, TS_INV,
    ] = [
        ':', '$',
    ];
    
    function _bs2tr(src, tr = [], trstk = []) {
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
    
    function _parse_btr(tr) {
        let rtr = [];
        for(let e of tr) {
            let lst_r = rtr[rtr.length - 1];
            if(typeof(e) == 'string') {
                let er = e.split(TS_SEP);
                for(let i = er.length - 1; i >= 0 ; i--) {
                    er[i] = er[i].trim();
                    if(i == 0 && lst_r instanceof Array) {
                        if(lst_r.length <= 0) {
                            rtr.pop();
                        }
                        if(!er[i]) {
                            er.shift();
                        } else {
                            return null;
                        }
                    } else if(i < er.length - 1 && !er[i]) {
                        return null;
                    }
                }
                rtr = rtr.concat(er);
            } else {
                if(!lst_r) {
                    rtr.pop();
                } else {
                    return null;
                }
                let nr = _parse_btr(e);
                if(nr === null) {
                    return null;
                }
                rtr.push(nr);
            }
        }
        if(!rtr[rtr.length - 1]) {
            if(rtr.length > 1) {
                return null;
            } else {
                rtr.pop();
            }
        }
        return rtr;
    }
    
    console.log(_parse_btr(_bs2tr("aaaa:(bbb:(c)):ddd:((ee:():fff):ggg)")));
    
    class c_tag {
        
        constructor(src, tab) {
            this[PR_TAB] = tab;
        }
        
        [MTD_COMPILE](src) {
            let btr = _bs2tr(src);
            if(btr === null) return null;
            let rtr = _parse_btr(btr);
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