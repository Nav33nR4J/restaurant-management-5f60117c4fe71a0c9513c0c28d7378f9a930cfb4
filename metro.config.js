// Polyfill for Array.prototype.toReversed() (ES2023)
// This must be loaded BEFORE expo/metro-config is required
// because Metro internally uses toReversed() during config loading
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return this.slice().reverse();
  };
}

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent metro from trying to bundle wasm files as JavaScript
const originalGetSourceExts = config.resolver.getSourceExts;
config.resolver.getSourceExts = function () {
  const exts = originalGetSourceExts.apply(this, arguments);
  // Remove wasm from source extensions so it's treated as an asset
  return exts.filter(ext => ext !== 'wasm');
};

// Make sure wasm files are treated as asset extensions
if (!config.resolver.assetExts) {
  config.resolver.assetExts = [];
}
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

module.exports = config;

