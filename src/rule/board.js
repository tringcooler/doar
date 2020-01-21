define(function(require) {
    
    const
        c_deck = require('core/deck');
    
    const [
        PL_DECKS,
        MTD_INIT_DECKS,
    ] = require('core/util').symgen();
    
    class c_board {
        
        constructor(draw_deck) {
            this[PL_DECKS] = {};
            this[MTD_INIT_DECKS]();
        }
        
        [MTD_INIT_DECKS](draw_deck) {
            this[PL_DECKS].draw = draw_deck;
            this[PL_DECKS].hand = new c_deck();
            this[PL_DECKS].drop = new c_deck();
            this[PL_DECKS].elim = new c_deck();
            this[PL_DECKS].dun = new c_deck();
            this[PL_DECKS].bag = new c_deck();
        }
        
    }
    
    return c_board;
    
});