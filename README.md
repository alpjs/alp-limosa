# alp-limosa [![NPM version][npm-image]][npm-url]

router limosa in alp

[![Dependency ci Status][dependencyci-image]][dependencyci-url]
[![Dependency Status][daviddm-image]][daviddm-url]

## With Koa

```js
import Koa from 'koa';
import config from 'alp-config';
import language from 'alp-language';
import router from 'alp-limosa';
import routerBuilder from './routerBuilder';

const controllers = new Map();
// controllers.set('site', SiteController);

const app = new Koa();
config(__dirname + '/config')(app);
language(app);
const handler = router(routerBuilder, controllers)(app);

// app.use(serve(__dirname + '../public/')); // static files
app.use(handler);
```

## With Ibex

```js
import Ibex from 'ibex';
import config from 'alp-config';
import language from 'alp-language';
import router from 'alp-limosa';
import routerBuilder from './routerBuilder';

const controllers = new Map();
// controllers.set('site', SiteController);

const app = new Ibex();
config(__dirname + '/config')(app);
language(app);
const handler = router(routerBuilder, controllers)(app);

app.use(handler);
```

## With Alp (Node or Browser)

```js
import Alp from 'alp';
import routerBuilder from './routerBuilder';

const controllers = new Map();
// controllers.set('site', SiteController);

const app = new Alp();
app.useRouter(routerBuilder, controllers);
```

[npm-image]: https://img.shields.io/npm/v/alp-limosa.svg?style=flat-square
[npm-url]: https://npmjs.org/package/alp-limosa
[daviddm-image]: https://david-dm.org/alpjs/alp-limosa.svg?style=flat-square
[daviddm-url]: https://david-dm.org/alpjs/alp-limosa
[dependencyci-image]: https://dependencyci.com/github/alpjs/alp-limosa/badge?style=flat-square
[dependencyci-url]: https://dependencyci.com/github/alpjs/alp-limosa
