requirejs.config({
    baseUrl: 'src',
    paths: {
        jquery: '../lib/jquery-1.12.4.min',
        'jquery-ui': '../lib/jquery-ui.min',
        'jquery-ui-tp': '../lib/jquery.ui.touch-punch.min',
        core: 'core',
    },
    shim: {
        'jquery-ui': ['jquery'],
        'jquery-ui-tp': ['jquery-ui'],
        'main': ['jquery-ui-tp'],
    },
});

requirejs(['jquery']);
requirejs(['jquery-ui']);
requirejs(['jquery-ui-tp']);
requirejs(['main']);
