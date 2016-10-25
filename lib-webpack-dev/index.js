import _t from 'tcomb-forked';
/* global BROWSER */

import { RouterBuilder, RoutesTranslations } from 'limosa';

export { RouterBuilder } from 'limosa';

export default function alpLimosa(routerBuilder, controllers) {
  _assert(routerBuilder, _t.Function, 'routerBuilder');

  _assert(controllers, Map, 'controllers');

  return function (app) {
    var config = app.config;
    var routeTranslationsConfig = config.get('routeTranslations');
    var routeTranslations = new RoutesTranslations(routeTranslationsConfig);
    var builder = new RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    var router = app.router = builder.router;

    app.context.urlGenerator = function () {
      // eslint-disable-next-line prefer-rest-params
      return router.urlGenerator.apply(router, [this.language].concat(Array.prototype.slice.call(arguments)));
    };

    app.context.redirectTo = function (to, params) {
      _assert(to, _t.String, 'to');

      _assert(params, _t.maybe(_t.Object), 'params');

      // eslint-disable-next-line prefer-rest-params
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
      _assert(controllerName, _t.String, 'controllerName');

      _assert(actionName, _t.maybe(_t.String), 'actionName');

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
      var route = router.find(ctx.path, ctx.language);

      if (!route) {
        ctx.status = 404;
        throw new Error('Route not found: ' + ctx.path);
      }

      ctx.route = route;

      return ctx.callAction(route.controller, route.action);
    };
  };
}

function _assert(x, type, name) {
  function message() {
    return 'Invalid value ' + _t.stringify(x) + ' supplied to ' + name + ' (expected a ' + _t.getTypeName(type) + ')';
  }

  if (_t.isType(type)) {
    if (!type.is(x)) {
      type(x, [name + ': ' + _t.getTypeName(type)]);

      _t.fail(message());
    }
  } else if (!(x instanceof type)) {
    _t.fail(message());
  }

  return x;
}
//# sourceMappingURL=index.js.map