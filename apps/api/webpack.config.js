// Minimal valid webpack config to satisfy Nx's webpack plugin for the API
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  // You can customize the webpack config for the API here if ever needed
  return config;
});