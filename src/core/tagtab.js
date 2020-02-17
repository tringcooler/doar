define(function(require) {
    
    const [
    
        // for common
    
        // for tag node
        PR_PREV,
        MTD_PREV, MTD_AFTER,
        
        // for tag
        CST_TAGNODE_LIST,
        PR_TAB,
        MTD_COMPILE,
        BDMTD_TAGNODE,
        
        // for tag tab
        PL_TAGNODE, PL_TAG,
        MTD_REGNODE,
        
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
                    er[i] = cb ? cb(er[i].trim()) : er[i].trim();
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
        
        CST_TAGNODE_LIST = [
            [null, null, c_tagnode],
        ];
        
        [BDMTD_TAGNODE] = (name) => {
            for(let [f_chk, f_key, cls_tn] of this[CST_TAGNODE_LIST]) {
                if(!f_chk || f_chk(name)) {
                    let key = f_key ? f_key(name) : name;
                    let node = this[PR_TAB][MTD_REGNODE](key, cls_tn)
                    return node;
                }
            }
        }
        
        [MTD_COMPILE](src) {
            let btr = _bs2tr(src);
            if(btr === null) return null;
            let rtr = _parse_btr(btr, _new_tagnode);
        }
        
    }
    
    class c_tagtab {
        
        constructor() {
            this[PL_TAGNODE] = {};
        }
        
        [MTD_REGNODE]() {
            
        }
        
    }
    
    return c_tagtab;
    
});