define(function(require) {
    
    const [
    
        // for common
        PR_TAB, PR_ORDER,
        PL_SUB,
        MTD_APPEND,
    
        // for tag node
        PR_PREV, PR_SL_ORDER,
        MTD_PREV, MTD_AFTER,
        
        // for tag syntax parser
        PR_KEY, PR_TAG,
        MTD_PARSE_LAYER, MTD_PARSE_NODES, MTD_PARSE_POST,
        
        // for tag
        MTD_MONO_NODE,
        
        // for tag tab
        PL_TAGNODE, PL_TAG,
        MTD_REGNODE,
        
    ] = require('core/util').symgen();
    
    // freegroup-2 float key in real field
    const CST_FG2_FK_MULT = Math.PI / 3;
    const f_fg2_fl = {
        a: key => key + 1,
        b: key => key * CST_FG2_FK_MULT,
        merge(...keys) {
            let rkey = 0;
            for(let key of keys) {
                rkey += 1 / key;
            }
            return rkey;
        },
        append: (src, dst) => src + 1 / dst,
    };
    
    let id_tagnode = 1;
    class c_tagnode {
        
        constructor(prev = null) {
            this[MTD_PREV](prev);
        }
        
        [MTD_PREV](prev) {
            //assert(!(PR_PREV in this));
            this[PR_PREV] = prev;
            if(prev) {
                this[PR_ORDER] = f_fg2_fl.a(prev[PR_SL_ORDER]);
                prev[PR_SL_ORDER] = this[PR_ORDER];
                this[PR_SL_ORDER] = f_fg2_fl.b(this[PR_ORDER]);
            } else {
                this[PR_ORDER] = id_tagnode ++;
            }
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
        
        constructor(tab) {
            this[PR_TAB] = tab;
            this[PL_SUB] = [];
            this[PR_KEY] = '';
            this[PR_TAG] = null;
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
            if(this[MTD_PARSE_NODES](s1, is_first, is_last) === null) {
                return null;
            }
            let nxt;
            if(is_last) {
                if(this[MTD_PARSE_POST]() === null) {
                    return null;
                }
                if(stk.length === 0 && is_end) {
                    return this;
                } else if(stk.length === 0 || is_end) {
                    return null;
                }
                nxt = stk.pop();
                nxt[MTD_APPEND](this);
            } else {
                nxt = new c_tag_syntax_parser(this[PR_TAB]);
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
        
        [MTD_APPEND](sub) {
            let skey;
            let has_sub = (sub instanceof c_tag_syntax_parser);
            if(has_sub) {
                if(sub[PL_SUB].length > 1) {
                    skey = TS_L_IN + sub[PR_KEY] + TS_L_OUT;
                } else {
                    skey = sub[PR_KEY];
                    has_sub = false;
                }
            } else {
                skey = sub;
            }
            if(this[PR_KEY]) {
                this[PR_KEY] += TS_SEP + skey;
            } else {
                this[PR_KEY] += skey;
            }
            this[PL_SUB].push([has_sub, skey]);
        }
        
        [MTD_PARSE_POST]() {
            let key = this[PR_KEY];
            let tag = this[PR_TAB][MTD_GET_TAG](key);
            if(!tag) {
                tag = this[PR_TAB][MTD_NEW_TAG]();
                for(let [has_sub, skey] of this[PL_SUB]) {
                    let stag;
                    if(has_sub) {
                        stag = this[PR_TAB][MTD_GET_TAG](skey);
                    } else {
                        stag = this[PR_TAB][MTD_MONO_TAG](skey);
                    }
                    tag[MTD_APPEND](stag);
                }
                this[PR_TAB][MTD_REG_TAG](key, tag);
            }
            this[PR_TAG] = tag;
        }
        
    }
    
    class c_tag {
        
        constructor(tab) {
            this[PR_TAB] = tab;
            this[PL_SUB] = [];
            this[PR_ORDER] = 0;
            //this[FLG_MONO] = false;
        }
        
        [MTD_MONO_NODE](node) {
            //assert(this[PL_SUB].length === 0);
            this[PL_SUB].push(node);
            this[PR_ORDER] = node[PR_ORDER];
            //this[FLG_MONO] = true;
        }
        
        [MTD_APPEND](dst) {
            //assert(!this[FLG_MONO]);
            let lsb = this[PL_SUB].length;
            for(let i = 0; i < lsb; i ++) {
                if(dst[PR_ORDER] < this[PL_SUB][i][PR_ORDER]) {
                    break
                }
            }
            this[PL_SUB].splice(i, 0, dst);
            this[PR_ORDER] = f_fg2_fl.append(this[PR_ORDER], dst[PR_ORDER]);
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