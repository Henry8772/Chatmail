// config-overrides.js
const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    'react-native$': 'react-native-web'
  }),
  (config) => {
    // Find the Babel loader within the oneOf array.
    const oneOfRule = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;
    const babelLoader = oneOfRule.find(loader => 
      loader.loader && loader.loader.includes('babel-loader')
    );
    
    if (babelLoader) {
      // Ensure babelLoader.include is an array, then add the wouter package path.
      if (!babelLoader.include) {
        babelLoader.include = [];
      } else if (!Array.isArray(babelLoader.include)) {
        babelLoader.include = [babelLoader.include];
      }
      babelLoader.include.push(path.resolve("node_modules", "wouter"));
    }
    return config;
  }
);