var production = process.env.NODE_ENV === 'production';
module.exports = require('./lib-node7' + (production ? '' : '-dev') + '/index');
