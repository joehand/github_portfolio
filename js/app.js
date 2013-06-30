requirejs.config({
    //By default load any module IDs from js/app
    baseUrl: 'js/app',

    paths: {
        jquery                  : '../lib/jquery-1.9.1.min',
        bootstrap               : '../lib/bootstrap',
        backbone                : '../lib/backbone',
        text                    : '../lib/text',
        underscore              : '../lib/underscore',
        template               : '../templates'
    },

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'bootstrap': {
            deps: ['jquery']
        }
    }
});

// Start the main app logic.
require([
    'model',
    'view'
], function (Model, View) {
        var config = GlobalData.config;

        var mainModel = new Model(GlobalData, config),
            mainView = new View({
                model : mainModel,
                class : 'container'
            });
});
