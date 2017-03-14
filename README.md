# alp-limosa

[![Greenkeeper badge](https://badges.greenkeeper.io/alpjs/alp-limosa.svg)](https://greenkeeper.io/)

limosa router in koa / alp / ibex

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
