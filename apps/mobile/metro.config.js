const path = require('path');
const https = require('https');
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const { withNativeWind } = require('nativewind/metro');
const { mergeConfig } = require('@react-native/metro-config');

const projectDir = __dirname;
const monorepoRoot = path.resolve(projectDir, '../..');
const defaultConfig = getDefaultConfig(projectDir);

const monorepoPackages = {
  '@lactalink/api': path.resolve(monorepoRoot, 'packages/api'),
  '@lactalink/enums': path.resolve(monorepoRoot, 'packages/enums'),
  '@lactalink/types': path.resolve(monorepoRoot, 'packages/types'),
  '@lactalink/form-schemas': path.resolve(monorepoRoot, 'packages/form-schemas'),
  '@lactalink/utilities': path.resolve(monorepoRoot, 'packages/utilities'),
  '@lactalink/eslint-config': path.resolve(monorepoRoot, 'packages/eslint-config'),
  '@lactalink/typescript-config': path.resolve(monorepoRoot, 'packages/typescript-config'),
};

/** @type {import('expo/metro-config').MetroConfig} */
const monorepoConfig = {
  watchFolders: [...defaultConfig.watchFolders, ...Object.values(monorepoPackages)],
  cacheStores: [
    new FileStore({
      root: path.join(projectDir, 'node_modules', '.cache', 'metro'),
    }),
  ],
  server: {
    enhanceMiddleware: (middleware) => (req, res, next) => {
      if (!req.url?.startsWith('/api/')) {
        return middleware(req, res, next);
      }

      const target = new URL(req.url, 'https://vercel.lactalink.com');
      const headers = { ...req.headers, host: target.host };
      delete headers.origin;

      const proxyRequest = https.request(
        target,
        { method: req.method, headers },
        (proxyResponse) => {
          res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
          proxyResponse.pipe(res);
        }
      );

      proxyRequest.on('error', (error) => {
        console.error('Local API proxy failed:', error.message);
        if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Local API proxy failed.' }));
      });

      req.pipe(proxyRequest);
    },
  },
};

/** @type {import('expo/metro-config').MetroConfig} */
const svgConfig = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg'), 'lottie'],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    blockList: [
      ...defaultConfig.resolver.blockList,
      new RegExp(
        `${path.resolve(monorepoRoot, 'apps/web').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      ),
    ],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
    getTransformOptions: async (_entryPoints, { platform }) => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: platform !== 'web',
      },
    }),
  },
};

/**
 * Merging configs do not deeply merge arrays/functions. Keep this in mind to not
 * override important properties. Order matters!
 *
 * @see https://metrobundler.dev/docs/configuration/#merging-configurations
 */
const finalConfig = mergeConfig(defaultConfig, monorepoConfig, svgConfig);

/**
 * Nativewind config must come last! Internally it uses withCssInterop to
 * resolve css imports. If this is overridden, Nativewind will not work.
 *
 * @see https://github.com/nativewind/nativewind/issues/972#issuecomment-2329660147
 */
module.exports = withNativeWind(finalConfig, {
  input: path.join(projectDir, './global.css'),
  configPath: path.join(projectDir, './tailwind.config.js'),
});
