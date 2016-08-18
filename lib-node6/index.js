'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RouterBuilder = undefined;

var _limosa = require('limosa');

Object.defineProperty(exports, 'RouterBuilder', {
    enumerable: true,
    get: function get() {
        return _limosa.RouterBuilder;
    }
});
exports.default = alpLimosa;
function alpLimosa(routerBuilder, controllers) {
    if (!(controllers instanceof Map)) {
        throw new Error('controllers should be a Map');
    }

    return app => {
        const config = app.config;
        const routeTranslationsConfig = config.get('routeTranslations');
        const routeTranslations = new _limosa.RoutesTranslations(routeTranslationsConfig);
        const builder = new _limosa.RouterBuilder(routeTranslations, config.get('availableLanguages'));
        routerBuilder(builder);
        const router = app.router = builder.router;

        app.context.urlGenerator = function () {
            return router.urlGenerator(this.language, ...arguments); // eslint-disable-line prefer-rest-params
        };

        app.context.redirectTo = function (to, params) {
            return this.redirect(router.urlGenerator(this.language, to, params)); // eslint-disable-line prefer-rest-params
        };

        app.controllers = controllers;

        /**
         *
         * @param {string} controllerName
         * @param {string} actionName
         * @returns {*}
         */
        app.context.callAction = function (controllerName, actionName) {
            const route = this.route;

            if (!actionName) {
                actionName = controllerName;
                controllerName = route.controller;
            }

            const controller = controllers.get(controllerName);
            if (!controller) {
                this.status = 404;
                throw new Error(`Controller not found: ${ controllerName }`);
            }

            const action = controller[actionName];
            if (!action /* || !action.isAction*/) {
                    this.status = 404;
                    throw new Error(`Action not found: ${ route.controller }.${ route.action }`);
                }

            try {
                return Promise.resolve(controller[actionName].call(null, this));
            } catch (err) {
                return Promise.reject(err);
            }
        };

        return ctx => {
            let route = router.find(ctx.path, ctx.language);

            if (!route) {
                ctx.status = 404;
                throw new Error(`Route not found: ${ ctx.path }`);
            }

            ctx.route = route;

            return ctx.callAction(route.controller, route.action);
        };
    };
}
//# sourceMappingURL=index.js.map