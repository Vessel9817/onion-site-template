import webpack from 'webpack';

// Do this first so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Env-dependent imports
const config: webpack.Configuration = require('../webpack.config');

webpack(config, function (err) {
    if (err) throw err;
});
