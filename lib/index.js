'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = aukLimosa;

var _limosa = require('limosa');

/**
 * @function
 * @param routerBuilder
 * @param controllers
*/function aukLimosa(routerBuilder, controllers) {
    if (!controllers instanceof Map) {
        throw new Error('controllers should be a Map');
    }

    return app => {
        const config = app.config;
        const routeTranslationsConfig = config.get('routeTranslations');
        const routeTranslations = new _limosa.RoutesTranslations(routeTranslationsConfig);
        const builder = new _limosa.RouterBuilder(routeTranslations, config.get('availableLanguages'));
        routerBuilder(builder);
        const router = app.router = builder.router;

        app.context.urlGenerator = /**
                                    * @function
                                   */function () {
            return router.urlGenerator(this.language, ...arguments);
        };

        app.controllers = controllers;

        /**
         *
         * @param {string} controllerName
         * @param {string} actionName
         * @returns {*}
         */
        app.context.callAction = /**
                                  * @function
                                  * @param controllerName
                                  * @param actionName
                                 */function (controllerName, actionName) {
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
            let route = router.find(ctx.path);

            if (!route) {
                ctx.status = 404;
                throw new Error(`Route not found: ${ ctx.path }`);
            }

            const controller = app.controllers.get(route.controller);
            if (!controller) {
                ctx.status = 404;
                throw new Error(`Controller not found: ${ route.controller }`);
            }

            ctx.route = route;

            return ctx.callAction(route.controller, route.action);
        };
    };
}
//# sourceMappingURL=index.js.map