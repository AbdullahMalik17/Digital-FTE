const {getDefaultConfig, mergeConfig} = require('expo/metro-config');
const {withNativeWind} = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add resolver to handle platform-specific native modules
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, "bin", "node"],
  sourceExts: [...config.resolver.sourceExts, "cjs"],
};

// Transformer options
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Platform-specific extensions
config.resolver.platforms = ['android', 'ios', 'native'];

const mergedConfig = withNativeWind(config, { input: "./global.css" });

module.exports = mergedConfig;