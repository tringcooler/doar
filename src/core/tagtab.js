define(function(require) {
    
    const [
    
        // for common
    
        // for tag node
        PR_PREV,
        MTD_PREV, MTD_AFTER,
        
        // for tag syntax parser
        PL_SUB,
        MTD_PARSE_LAYER, MTD_PARSE_NODES, MTD_PARSE_POST,
        
        // for tag
        CST_TAGNODE_LIST,
        PR_TAB, PR_KEY,
        MTD_COMPILE,
        BDMTD_NODE_PARSE,
        
        // for tag tab
        PL_TAGNODE, PL_TAG,
        MTD_REGNODE,
        
    ] = require('core/util').symgen();
    
    // freegroup-2 float key in real field
    const
        CST_FG2_FK_MULT = Math.PI / 3,
        CST_FG2_FK_MULT_M = Math.E / 2;
    const f_fg2_fl_key = {
        a: key => key + 1,
        b: key => key * CST_FG2_FK_MULT,
        merge(...keys) {
            let rkey = 0;
            for(let key of keys) {
                rkey += 1 / key;
            }
            return rkey * CST_FG2_FK_MULT_M;
        },
    };
    
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
        TS_L_IN, TS_L_OUT, TS_SEP, TS_INV, TS_CLS,
    ] = [
        '(', ')', ':', '$', '*',
    ];
    
    class c_tag_syntax_parser {
        
        constructor() {
            this[PL_SUB] = [];
        }
        
        [MTD_PARSE_LAYER](src, stk = [], is_first = true) {
            let bui = src.indexOf(TS_L_IN),
                bdi = src.indexOf(TS_L_OUT),
                bi = bdi < 0 ? bui : bui < 0 ? bdi : bdi < bui ? bdi : bui,
                is_end = bi < 0,
                is_last = bi === bdi,
                next_is_first = bi === bui,
                s1 = is_end ? src : src.slice(0, bi),
                s2 = is_end ? '' : src.slice(bi + 1);
            let nr = this[MTD_PARSE_NODES](s1, is_first, is_last);
            if(nr === null) {
                return null;
            }
            let nxt;
            if(is_last) {
                if(stk.length === 0 && is_end) {
                    return this[MTD_PARSE_POST]();
                } else if(stk.length === 0 || is_end) {
                    return null;
                }
                nxt = stk.pop();
            } else {
                nxt = new c_tag_syntax_parser();
                this[MTD_APPEND](nxt);
                stk.push(this);
            }
            return nxt[MTD_PARSE_LAYER](s2, stk, next_is_first);
        }
        
        [MTD_PARSE_NODES](src, is_first, is_last) {
            let nodes = src.split(TS_SEP);
            let nl = nodes.length;
            for(let ni = 0; ni < nl; ni++) {
                let nd = nodes[ni].trim();
                let _empty = ( (!is_first && ni == 0) || (!is_last && ni == nl - 1) );
                if(!_empty == !nd && nl > 1) {
                    return null;
                } else if(!nd) {
                    continue;
                }
                this[MTD_APPEND](nd);
            }
        }
        
        [MTD_PARSE_POST]() {
            let key = ''
            let tag = new c_tag();
            
        }
        
    }
    
    function _bs2tr(src, tr = [], trstk = [], is_first = true, nd_cb = null, sc_cb = null) {
        let bui = src.indexOf('('),
            bdi = src.indexOf(')'),
            bi = bdi < 0 ? bui : bui < 0 ? bdi : bdi < bui ? bdi : bui,
            s1 = src;
        if(bi >= 0) {
            //s1 = 
        }
        if(nd_cb) {
            let _r = nd_cb(tr, s1, is_first, bi === bdi);
            if(_r === null) {
                return null;
            }
        } else {            
            if(s1) {
                tr.push(s1);
            }
        }
        if(bdi < bui || bui < 0) {
            if(bdi < 0) {
                return tr;
            } else {
                if(trstk.length <= 0) {
                    return null;
                }
                return _bs2tr(src.slice(bdi + 1), trstk.pop(), trstk, false, nd_cb, sc_cb);
            }
        } else {
            let trn = [];
            tr.push(trn);
            trstk.push(tr);
            return _bs2tr(src.slice(bui + 1), trn, trstk, true, nd_cb, sc_cb);
        }
        return tr;
    }
    
    function _parse_btr_node_hndl(cb, src, is_first, is_last) {
        let nodes = src.split(TS_SEP);
        let rtr = [];
        for(let nd of nodes) {
            nd = nd.trim();
            
        }
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
    
    console.log(_parse_btr(_bs2tr("aaaa:(bbb:(c)):ddd:((ee:(  ):():ff:f):ggg)"), a=>a?a+'!':null));
    
    class c_tag {
        
        constructor(tab, src, ...args) {
            this[PR_TAB] = tab;
        }
        
        and(dst) {
        }
        
        add(dst) {
        }
        
        concat(dst) {
        }
        
        insert(dst) {
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