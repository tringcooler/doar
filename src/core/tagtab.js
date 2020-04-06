define(function(require) {
    
    const [
    
        // for common
        PR_ORDER, PR_OHASH,
        PL_SUB,
        MTD_APPEND, MTD_MERGE,
        
        // for order
        SQ_RL,
        MTD_UPD_ORDER, MTD_ADD, MTD_CMP,
        PP_ORDER,
    
        // for tag node
        PR_PREV, PR_SL_ORDER,
        MTD_PREV, MTD_AFTER,
        
        // for tag syntax parser
        PR_TAB,
        SQ_PREFIX,
        MTD_PARSE_LAYER, MTD_PARSE_NODES, MTD_PARSE_PREFIX, MTD_DECO_PREFIX, MTD_DECO_TAG, MTD_PARSE_POST,
        
        // for tag
        FLG_NOT,
        MTD_MONO_NODE, MTD_COMBINE, MTD_DECO_NOT,
        
        // for tag tab
        PL_TAGNODE, PL_TAGOHASH, PL_TAG_BY_OHASH,
        MTD_MONO_TAG, MTD_GET_TAG, MTD_NEW_TAG,
        
    ] = require('core/util').symgen();
    
    // freegroup-2 float key in real field
    const 
        CST_FG2_FK_MULT = Math.PI / 3,
        CST_FG2_FK_REV = 3 / Math.PI,
        CST_FG2_FK_ADD = Math.E / 3,
        CST_FG2_FK_NOT = 3 / Math.E,
        CST_FG2_FK_MXPREC = 15;
    const f_fg2_fl = {};
    f_fg2_fl.a = key => key + 1;
    f_fg2_fl.b = key => key * CST_FG2_FK_MULT;
    f_fg2_fl.r = key => CST_FG2_FK_REV + 1 / (key - CST_FG2_FK_REV);
    f_fg2_fl.not = key => CST_FG2_FK_NOT + 1 / (key - CST_FG2_FK_NOT);
    f_fg2_fl.append = (src, dst) => src + 1 / (dst + CST_FG2_FK_ADD);
    f_fg2_fl.merge = (...keys) => {
        let rkey = 0;
        for(let key of keys) {
            rkey = f_fg2_fl.append(rkey, key);
        }
        return rkey;
    };
    f_fg2_fl.v2k = v => v.toPrecision(CST_FG2_FK_MXPREC);
    const F_TAG_OHASH = f_fg2_fl;
    
    const
        ORD_BOT = 0,
        ORD_LEN = 1,
        ORD_MAX_PREC = 50;
    class c_order {
        
        constructor(sq = null) {
            if(sq === null) {
                sq = [];
            }
            this[SQ_RL] = sq;
            this[PR_ORDER] = null;
            //this[FLG_IS_SIMPLE] = true;
        }
        
        [MTD_UPD_ORDER]() {
            let cbot = ORD_BOT;
            let cbot_sq = [];
            let clen = ORD_LEN;
            let cprec = 0,
                cprec_m = 0;
            let mprec = null;
            let is_1st = true;
            for(let rlv of this[SQ_RL]) {
                let vdir = -1;
                for(let v of rlv) {
                    vdir = - vdir;
                    if(is_1st) {
                        //assert(vdir > 0);
                        is_1st = false;
                        if(v === 0) {
                            v = null;
                        }
                    }
                    if(v === null) {
                        //assert(vdir < 0);
                        continue;
                    }
                    //assert(v >= 0);
                    v += 1;
                    let o_clen = clen;
                    clen *= 1 / 2 ** v;
                    cprec_m = cprec;
                    cprec += v;
                    if(vdir < 0) {
                        cprec_m = cprec;
                    }
                    if(mprec === null) {
                        mprec = cprec_m;
                    }
                    if(cprec - mprec > ORD_MAX_PREC) {
                        //throw Error('order precision overflow');
                        cbot_sq.push(cbot);
                        cbot = 0;
                        mprec = cprec_m;
                    }
                    if(vdir > 0) {
                        cbot = cbot + o_clen - clen;
                    }
                }
            }
            cbot_sq.push(cbot + clen / 2);
            this[PR_ORDER] = cbot_sq;
        }
        
        [PP_ORDER]() {
            if(this[PR_ORDER] === null) {
                this[MTD_UPD_ORDER]();
            }
            return this[PR_ORDER];
        }
        
        [MTD_CMP](dst) {
            let sv = this[PP_ORDER](),
                dv = dst[PP_ORDER]();
            let vi = 0,
                df = sv[vi] - dv[vi];
            while(true) {
                let sn = Math.sign(df);
                if(sn) {
                    return sn;
                }
                let s = 0,
                    d = 0,
                    vvi = 0;
                vi += 1;
                if(vi < sv.length) {
                    vvi += 1;
                    s = sv[vi];
                }
                if(vi < dv.length) {
                    vvi += 1;
                    d = dv[vi];
                }
                df = s - d;
                if(!vvi) {
                    return 0;
                }
            }
        }
        
        [MTD_APPEND](dsts) {
            //assert(this[FLG_IS_SIMPLE]);
            let dst_sq = this[SQ_RL].slice(0);
            for(let dst of dsts) {
                dst_sq.push([0, dst]);
            }
            return new c_order(dst_sq);
        }
        
        [MTD_ADD](dst, val = 1) {
            //assert(this[FLG_IS_SIMPLE]);
            let dst_sq = this[SQ_RL].slice(0, -1);
            let [sr, sv] = this[SQ_RL][this[SQ_RL].length - 1];
            dst_sq.push([sr, sv + val]);
            return new c_order(dst_sq);
        }
        
        [MTD_MERGE](srcs) {
            //assert(this[SQ_RL].length === 0);
            //this[FLG_IS_SIMPLE] = false;
            if(this[SQ_RL].length > 0) {
                srcs = [this].concat(srcs);
            }
            let sqs = [],
                sqr = [],
                sqp = [],
                sqpv = [],
                sqi = [],
                sql = [],
                ci = 0,
                cl = srcs.length,
                vc = cl;
            for(let src of srcs) {
                let rshft = 0;
                while(src instanceof Array) {
                    src = src[0];
                    rshft += 1;
                }
                sqs.push(src[SQ_RL]);
                sqr.push(rshft);
                sqp.push([]);
                sqpv.push(false);
                sqi.push(0);
                sql.push(src[SQ_RL].length);
            }
            let dst_sq = [],
                sec_1st = true;
            while(vc > 0 || !(ci === 0 && sec_1st)) {
                let cr, cv;
                if(sqi[ci] < sql[ci]) {
                    [cr, cv] = sqs[ci][sqi[ci]];
                    if(cr > 0) {
                        cr += sqr[ci];
                    }
                } else if(sqpv[ci]) {
                    let cpad = sqp[ci],
                        padi = (sqi[ci] - sql[ci]) % cpad.length;
                    cr = cpad[padi];
                    cv = null;
                } // else assert(false);
                let scr = cr;
                if(cr === 0) {
                    if(!sec_1st) {
                        sqpv[ci] = true;
                        ci = (ci + 1) % cl;
                        sec_1st = true;
                        continue;
                    } else if(ci > 0) {
                        cr = 1;
                    }
                }
                sec_1st = false;
                dst_sq.push([cr, cv]);
                if(!sqpv[ci]) {
                    sqp[ci].push(scr);
                }
                if(++sqi[ci] === sql[ci]) {
                    vc -= 1;
                }
            }
            return new c_order(dst_sq);
        }
        
    }
    /*tst1 = (function() {
        let shw = o => {console.log(o[SQ_RL]);console.log(o[PP_ORDER]());};
        let o1 = new c_order();
        let o2 = o1[MTD_APPEND]([1,2,3,4,5]);
        shw(o2);
        let o3 = o2[MTD_APPEND]([7,8])[MTD_MERGE]([o2[MTD_ADD]()]);//[MTD_APPEND]([7,8])]);
        shw(o3);
        let od = o2[MTD_ADD](3)[MTD_APPEND]([9, 8, 7])[MTD_MERGE]([[o3]]);
        shw(od);
        console.log(od[MTD_CMP](o2), o2[MTD_CMP](o3), o3[MTD_CMP](od), od[MTD_CMP](od));
        return od;
    })();*/
    tst2 = (function() {
        let shw = o => {console.log(o[SQ_RL]);console.log(o[PP_ORDER]());};
        //let o1 = new c_order([[0, 45], [45, 45], [45, 45]]);
        let o1 = new c_order([[0, 45], [0, 45], [45, 45]]);
        //let o1 = new c_order([[45, 45], [45, 45], [45, 45]]);
        //let o1 = new c_order([[45, 45], [0, 45], [45, 45]]);
        shw(o1);
        return o1;
    })();
    
    let id_tagnode = 1;
    class c_tagnode {
        
        constructor(prev = null) {
            this[MTD_PREV](prev);
        }
        
        [MTD_PREV](prev) {
            //assert(!(PR_PREV in this));
            this[PR_PREV] = prev;
            if(prev) {
                this[PR_ORDER] = F_TAG_OHASH.a(prev[PR_SL_ORDER]);
                prev[PR_SL_ORDER] = this[PR_ORDER];
                this[PR_SL_ORDER] = F_TAG_OHASH.b(this[PR_ORDER]);
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
        TS_L_IN, TS_L_OUT, TS_SEP, TS_N_INV, TS_N_ARG,
    ] = [
        '(', ')', ':', '$', '*',
    ];
    const
        TS_L_PREFIX = '!',
        TD_MTD_L_PREFIX = [
            [F_TAG_OHASH.not, MTD_DECO_NOT],
        ];
    
    
    class c_tag_syntax_parser {
        
        constructor(tab) {
            this[PR_TAB] = tab;
            this[PL_SUB] = [];
            this[PR_OHASH] = 0;
            this[SQ_PREFIX] = [];
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
                let tag = this[MTD_PARSE_POST]();
                if(tag === null) {
                    return null;
                }
                if(stk.length === 0 && is_end) {
                    return tag;
                } else if(stk.length === 0 || is_end) {
                    return null;
                }
                nxt = stk.pop();
                nxt[MTD_APPEND](tag);
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
                nd = this[MTD_PARSE_PREFIX](nd);
                let _is_empty = !nd;
                let _should_empty = ( (!is_first && ni === 0) || (!is_last && ni === nl - 1) );
                if(_should_empty !== _is_empty && nl > 1) {
                    return null;
                } else if(_is_empty) {
                    continue;
                }
                let tag = this[PR_TAB][MTD_MONO_TAG](nd);
                if(tag === null) {
                    return null;
                }
                this[MTD_APPEND](tag);
            }
        }
        
        [MTD_PARSE_PREFIX](src) {
            if(!TS_L_PREFIX || src.length === 0) {
                return src;
            }
            let si = 0;
            let pfi;
            while((pfi = TS_L_PREFIX.indexOf(src[si])) >= 0) {
                this[SQ_PREFIX].push(pfi);
                si ++;
            }
            return src.slice(si);
        }
        
        [MTD_DECO_PREFIX](tag) {
            if(TS_L_PREFIX) {
                let pf;
                while((pf = this[SQ_PREFIX].pop()) !== undefined) {
                    tag = this[PR_TAB][MTD_DECO_PREFIX](tag, pf);
                }
            }
            return tag;
        }
        
        [MTD_DECO_TAG](stag, di) {
            let [ord_f, tag_mtd] = TD_MTD_L_PREFIX[di];
            let ohash = ord_f(stag[PR_OHASH]);
            let dtag = this[PR_TAB][MTD_GET_TAG](ohash);
            if(!dtag) {
                dtag = this[PR_TAB][MTD_NEW_TAG](ohash);
                dtag[tag_mtd]();
            }
            return dtag;
        }
        
        [MTD_APPEND](tag) {
            tag = this[MTD_DECO_PREFIX](tag);
            this[PL_SUB].push(tag);
            this[PR_OHASH] = F_TAG_OHASH.append(this[PR_OHASH], tag[PR_OHASH]);
        }
        
        [MTD_PARSE_POST]() {
            let ohash = this[PR_OHASH];
            let tag = this[PR_TAB][MTD_GET_TAG](ohash);
            if(!tag) {
                if(this[PL_SUB].length > 1) {
                    tag = this[PR_TAB][MTD_NEW_TAG](ohash);
                    tag[MTD_COMBINE](this[PL_SUB]);
                } else {
                    //assert(this[PL_SUB].length === 1);
                    tag = this[PL_SUB][0];
                }
            }
            return tag;
        }
        
    }
    
    class c_tag {
        
        constructor() {
            this[PL_SUB] = [];
            this[PR_ORDER] = 0;
            //this[FLG_MONO] = false;
            this[FLG_NOT] = false;
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
            let i;
            for(i = 0; i < lsb; i ++) {
                if(dst[PR_ORDER] < this[PL_SUB][i][PR_ORDER]) {
                    break
                }
            }
            this[PL_SUB].splice(i, 0, dst);
            this[PR_ORDER] = F_TAG_OHASH.append(this[PR_ORDER], dst[PR_ORDER]);
        }
        
        [MTD_COMBINE](stags) {
            for(let stag of stags) {
                this[MTD_APPEND](stag);
            }
        }
        
        [MTD_MERGE](stags) {
            let sidxs = [],
                slens = [],
                itags = [];
            let _gsub0 = itag => stags[itag][PL_SUB][sidxs[itag]];
            for(let i = 0; i < stags.length; i++) {
                let sl = stags[i][PL_SUB].length;
                if(sl > 0) {
                    sidxs.push(0);
                    slens.push(sl);
                    itags.push(i);
                }
            }
            //let last_order = 0
            while(itags.length > 0) {
                let [min_order, min_ii] = [Infinity, -1];
                for(let i = 0; i < itags.length; i++) {
                    let itag = itags[i];
                    let order0 = _gsub0(itag)[PR_ORDER];
                    if(order0 < min_order) {
                        min_order = order0;
                        min_ii = i;
                    }
                }
                //assert(min_ii >= 0);
                let itag = itags[min_ii],
                    sub0 = _gsub0(itag);
                //assert(sub0[PR_ORDER] > last_order); last_order = sub0[PR_ORDER];
                this[PR_ORDER] = F_TAG_OHASH.append(this[PR_ORDER], sub0[PR_ORDER]);
                this[PL_SUB].push(sub0);
                if(++sidxs[itag] >= slens[itag]) {
                    itags.splice(min_ii, 1);
                }
            }
        }
        
        [MTD_DECO_NOT]() {
            //assert(!this[FLG_NOT]);
            this[FLG_NOT] = !this[FLG_NOT];
            this[PR_ORDER] = F_TAG_OHASH.not(this[PR_ORDER]);
        }
        
    }
    
    class c_tag_context {
        
        constructor(tag) {
            this[PR_TAG] = tag;
            this[SQ_ARG_TOK] = [];
        }
        
        [MTD_COMBINE](sctxs) {
        }
        
        [MTD_MERGE](sctxs) {
        }
        
    }
    
    class c_tagtab {
        
        constructor() {
            this[PL_TAGNODE] = {};
            this[PL_TAGOHASH] = {};
            this[PL_TAG_BY_OHASH] = {};
        }
        
        [MTD_MONO_TAG](key) {
            if(key in this[PL_TAGOHASH]) {
                let ohash = this[PL_TAGOHASH][key];
                //assert(ohash in this[PL_TAG_BY_OHASH]);
                return this[PL_TAG_BY_OHASH][ohash];
            }
            if(key in this[PL_TAGNODE]) {
                let node = this[PL_TAGNODE][key];
                let tag = new c_tag();
                tag[MTD_MONO_NODE](node);
                let ohash = tag[PR_OHASH];
                this[PL_TAGOHASH][key] = ohash;
                this[PL_TAG_BY_OHASH][ohash] = tag;
                return tag;
            }
            return null;
        }
        
        [MTD_GET_TAG](ohash) {
            if(ohash in this[PL_TAG_BY_OHASH]) {
                return this[PL_TAG_BY_OHASH][ohash];
            } else {
                return null;
            }
        }
        
        [MTD_NEW_TAG](ohash) {
            if(ohash in this[PL_TAG_BY_OHASH]) {
                return null;
            }
            let tag = new c_tag();
            this[PL_TAG_BY_OHASH][ohash] = tag;
            return tag;
        }
        
    }
    
    return c_tagtab;
    
});