const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Custom Expo Config Plugin to automatically inject the CMake short path workaround
 * for the Windows 260 character path limit when compiling React Native C++ files.
 * This runs automatically when someone generates the android folder using `npx expo prebuild`.
 */
module.exports = function withCmakeShortPath(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const buildGradle = config.modResults.contents;
      
      // Prevent adding it multiple times if it's already there
      if (buildGradle.includes('buildStagingDirectory')) {
        return config;
      }
      
      // The block to insert to shorten the C++ compilation path
      const replacement = `\n    externalNativeBuild {\n        cmake {\n            buildStagingDirectory "C:/tmp/cxx"\n        }\n    }\n`;
      
      // Inject it right inside the 'android {' block
      config.modResults.contents = buildGradle.replace(
        /android\s*\{/,
        `android {${replacement}`
      );
    }
    return config;
  });
};
