var path = require('path');

module.exports = {
  mode: 'production',
  entry: './dev/main.ts',
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'Bundle',
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
          configFile: 'config/tsconfig.json',
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
