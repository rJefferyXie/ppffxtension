const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  webpack: function (config, env) {
    // Ensure CSS files are processed correctly and extracted into the build folder
    config.module.rules = config.module.rules.map(rule => {
      if (rule.oneOf) {
        rule.oneOf = rule.oneOf.map(loader => {
          // Check for the rule that processes .css files
          if (loader.test && loader.test.toString().includes('.css')) {
            loader.use = [
              MiniCssExtractPlugin.loader, // Extract CSS into separate file
              'css-loader'
            ];
          }
          return loader;
        });
      }
      return rule;
    });

    // Modify the output filename for CSS
    config.plugins = config.plugins.map(plugin => {
      if (plugin.constructor.name === 'MiniCssExtractPlugin') {
        plugin.options.filename = 'static/css/[name].css';  // Output CSS to static/css/
        plugin.options.chunkFilename = 'static/css/[name].chunk.css';
      }
      return plugin;
    });

    // Add MiniCssExtractPlugin if it's not already added
    if (!config.plugins.some(plugin => plugin instanceof MiniCssExtractPlugin)) {
      config.plugins.push(
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].css',
          chunkFilename: 'static/css/[name].chunk.css',
        })
      );
    }

    // Ensure the dev server watches for changes in your source files
    config.devServer = {
      watchFiles: ['src/**/*'],
    };

    // Set the output for the JS and CSS
    config.output = {
      ...config.output,
      filename: 'static/js/content.js',
      path: path.resolve(__dirname, 'build'),
    };

    return config;
  },
};
