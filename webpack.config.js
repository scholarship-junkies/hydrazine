module.exports = {
  entry: `${__dirname}/src/index.js`,
  output: {
    library: 'hydrazine',
    libraryTarget: 'umd',
    filename: `${__dirname}/dist/index.js`,
  },
  externals: [/*
    {
      react: {
        root: 'react',
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react'
      },
    },
  */],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: `${__dirname}/node_modules`,
        // WARNING: v6.15.0 of the Babel runtime transform does not complete the regenerator
        // transform. To fix, replace '_regeneratorRuntime.mark' with '_regenerator.mark' in the
        // bundled code.
        loader: 'babel',
      },
    ],
  },
};
