define(function(require) {
    
    const [
        PL_CARDS,
        MTD_IDX,
        GEN_IDX,
    ] = require('core/util').symgen();
    
    let _inrng = function(a, b, s) {
        return Math.min(Math.max(a, s), b);
    };
    
    let _mod = function(s, n) {
        return ((s % n) + n) % n;
    };
    
    class c_deck {
        
        constructor() {
            this[PL_CARDS] = [];
        }
        
        len() {
            return this[PL_CARDS].length;
        }
        
        [MTD_IDX](idx, top) {
            let l = this.len() - 1;
            idx = _inrng(- l - 1, l, idx);
            idx = _mod(idx, l + 1);
            return top ? idx : l - idx;
        }
        
        put(card, idx = 0, top = true) {
            idx = this[MTD_IDX](idx, top);
            idx = top ? idx : idx + 1;
            this[PL_CARDS].splice(idx, 0, card);
        }
        
        peek(idx = 0, top = true) {
            return this[PL_CARDS][this[MTD_IDX](idx, top)];
        }
        
        draw(idx = 0, top = true) {
            return this[PL_CARDS].splice(this[MTD_IDX](idx, top), 1)[0];
        }
        
        *[GEN_IDX](top, start, end) {
            start = this[MTD_IDX](start, top);
            end = this[MTD_IDX](end, top);
            let step = top ? 1 : -1;
            for(let i = start; (end - i) * step >= 0; i += step) {
                yield i;
            }
        }
        
        foreach(cb, top = true, start = 0, end = -1) {
            let iter_idx = this[GEN_IDX](top, start, end);
            let rm_seq = [];
            for(let i of iter_idx) {
                let c = this[PL_CARDS][i];
                let r = cb(c, i);
                if(r === 'remove') {
                    if(step > 0) {
                        rm_seq.unshift(i);
                    } else {
                        //this[PL_CARDS].splice(i, 1);  //can, but not.
                        rm_seq.push(i);
                    }
                }
            }
            for(let i of rm_seq) {
                this[PL_CARDS].splice(i, 1);
            }
        }
        
        *iter(top = true, start = 0, end = -1) {
            let iter_idx = this[GEN_IDX](top, start, end);
            for(let i of iter_idx) {
                yield this[PL_CARDS][i];
            }
        }
        
    }
    
    return c_deck;
    
});