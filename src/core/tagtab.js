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
    
    function _parse_btr(tr, cb) {
        let rtr = [];
        let lst_arr = false;
        for(let ei = 0; ei < tr.length; ei++) {
            e = tr[ei];
            if(typeof(e) == 'string') {
                lst_arr = false;
                let [_rmhd, _rmtl] = [false, false];
                let er = e.split(TS_SEP);
                for(let i = 0; i < er.length; i++) {
                    er[i] = cb(er[i].trim());
                    let _rmer = false;
                    if(i == 0) {
                        if(ei > 0) {
                            if(!er[i]) {
                                _rmhd = true;
                                _rmer = true;
                            } else {
                                return null;
                            }
                        }
                    } else if(i == er.length - 1) {
                        if(ei < tr.length - 1) {
                            if(!er[i]) {
                                _rmtl = true;
                                _rmer = true;
                            } else {
                                return null;
                            }
                        }
                    }
                    if(!_rmer && !er[i]) {
                        if(er.length == 1) {
                            er.pop();
                        } else {
                            return null
                        }
                    }
                }
                if(_rmhd) {
                    er.shift();
                }
                if(_rmtl) {
                    er.pop();
                }
                rtr = rtr.concat(er);
            } else {
                if(lst_arr) {
                    return null;
                }
                lst_arr = true;
                let nr = _parse_btr(e, cb);
                if(nr === null) {
                    return null;
                }
                rtr.push(nr);
            }
        }
        return rtr;
    }
    
    //console.log(_parse_btr(_bs2tr("aaaa:(bbb:(c)):ddd:((ee:(  ):():ff:f):ggg)"), a=>a?a+'!':null));
    
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