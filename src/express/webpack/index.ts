import webpack from 'webpack';
import config from './webpack.config';

const compiler = webpack(config);

await new Promise((resolve, reject) => {
    compiler.run((err, res) => {
        if (err) {
            reject(err);
            return;
        }

        resolve(res);
    });
});
