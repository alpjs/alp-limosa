/* global BROWSER */

import { RouterBuilder, RoutesTranslations } from 'limosa';

import t from 'flow-runtime';
export { RouterBuilder } from 'limosa';

export default function alpLimosa(routerBuilder, controllers) {
  let _routerBuilderType = t.function();

  let _controllersType = t.ref('Map');

  t.param('routerBuilder', _routerBuilderType).assert(routerBuilder);
  t.param('controllers', _controllersType).assert(controllers);

  return function (app) {
    const config = app.config;
    const routeTranslationsConfig = t.ref('Map').assert(config.get('routeTranslations'));
    const routeTranslations = new RoutesTranslations(routeTranslationsConfig);
    const builder = new RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    const router = builder.router;

    app.router = router;

    app.context.urlGenerator = function (...args) {
      return router.urlGenerator(this.language, ...args);
    };

    app.context.redirectTo = function (to, params) {
      let _toType = t.string();

      let _paramsType = t.nullable(t.object());

      t.param('to', _toType).assert(to);
      t.param('params', _paramsType).assert(params);

      return this.redirect(router.urlGenerator(this.language, to, params));
    };

    app.controllers = controllers;

    /**
     *
     * @param {string} controllerName
     * @param {string} [actionName]
     * @returns {*}
     */
    app.context.callAction = function (controllerName, actionName) {
      let _controllerNameType = t.string();

      let _actionNameType = t.nullable(t.string());

      t.param('controllerName', _controllerNameType).assert(controllerName);
      t.param('actionName', _actionNameType).assert(actionName);

      const route = this.route;

      if (!actionName) {
        actionName = _actionNameType.assert(controllerName);
        controllerName = _controllerNameType.assert(route.controller);
      }

      const controller = controllers.get(controllerName);
      if (!controller) {
        this.status = 404;
        throw new Error(`Controller not found: ${controllerName}`);
      }

      const action = controller[actionName];
      if (!action /* || !action.isAction*/) {
          this.status = 404;
          throw new Error(`Action not found: ${route.controller}.${route.action}`);
        }

      try {
        return Promise.resolve(controller[actionName].call(null, this));
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return function (ctx) {
      let route = router.find(ctx.path, ctx.language);

      if (!route) {
        ctx.status = 404;
        throw new Error(`Route not found: ${ctx.path}`);
      }

      ctx.route = route;

      return ctx.callAction(route.controller, route.action);
    };
  };
}
//# sourceMappingURL=index.js.map