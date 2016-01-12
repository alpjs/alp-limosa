'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = aukLimosa;

var _limosa = require('limosa');

function aukLimosa(routerBuilder, controllers) {
    if (!controllers instanceof Map) {
        throw new Error('controllers should be a Map');
    }

    return function (app) {
        var config = app.config;
        var routeTranslationsConfig = config.get('routeTranslations');
        var routeTranslations = new _limosa.RoutesTranslations(routeTranslationsConfig);
        var builder = new _limosa.RouterBuilder(routeTranslations, config.get('availableLanguages'));
        routerBuilder(builder);
        var router = app.router = builder.router;

        app.context.urlGenerator = function () {
            return router.urlGenerator.apply(router, [this.language].concat(Array.prototype.slice.call(arguments)));
        };

        app.controllers = controllers;

        /**
         *
         * @param {string} controllerName
         * @param {string} actionName
         * @returns {*}
         */
        app.context.callAction = function (controllerName, actionName) {
            var route = this.route;

            if (!actionName) {
                actionName = controllerName;
                controllerName = route.controller;
            }

            var controller = controllers.get(controllerName);
            if (!controller) {
                this.status = 404;
                throw new Error('Controller not found: ' + controllerName);
            }

            var action = controller[actionName];
            if (!action /* || !action.isAction*/) {
                    this.status = 404;
                    throw new Error('Action not found: ' + route.controller + '.' + route.action);
                }

            try {
                return Promise.resolve(controller[actionName].call(null, this));
            } catch (err) {
                return Promise.reject(err);
            }
        };

        return function (ctx) {
            var route = router.find(ctx.path);

            if (!route) {
                ctx.status = 404;
                throw new Error('Route not found: ' + ctx.path);
            }

            var controller = app.controllers.get(route.controller);
            if (!controller) {
                ctx.status = 404;
                throw new Error('Controller not found: ' + route.controller);
            }

            ctx.route = route;

            return ctx.callAction(route.controller, route.action);
        };
    };
}
//# sourceMappingURL=index.js.map