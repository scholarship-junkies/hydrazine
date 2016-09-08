module.exports = {
  entry: `${__dirname}/main.jsx`,
  output: {
    path: __dirname,
    filename: 'main.bundle.js',
    publicPath: '/',
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015'],
        },
        include: __dirname,
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  devServer: {
    contentBase: __dirname,
    proxy: {
      '*': {
        bypass: () => 'index.html',
        secure: false,
      },
    },
  },
};
