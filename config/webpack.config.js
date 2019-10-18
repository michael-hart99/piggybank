var path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: './dev/main.ts',
    test: './dev/test/testCases.ts'
  },
  output: {
    path: path.join(__dirname, '../build'),
    filename: '[name]-bundle.js',
    libraryTarget: 'var',
    library: 'Bundle_[name]',
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
