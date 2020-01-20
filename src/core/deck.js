define(function(require) {
    
    const [
        PL_CARDS,
        MTD_IDX,
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
        
    }
    
    return c_deck;
    
});