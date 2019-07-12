var path = require('path');
var glob = require('glob');

module.exports = {
  mode: 'production',
  entry: glob.sync('./dev/**/main*.ts')
             .reduce((obj, el) => {
               let pos = el.indexOf('/', 2);
               obj['.' + el.substr(pos, el.length - pos - 3)] = el;
               return obj
             }, {}),
  output: {
    path: path.join(__dirname, './build'),
    filename: '[name].bundle.js',
    libraryTarget: 'var',
    library: 'Main',
  },
  /* Disable 'uglification' */
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json',
          compilerOptions: {
            "noEmit": false
          }
        }
      }
    ]
  },
  resolve: {
   extensions: ['.ts']
  }
};
