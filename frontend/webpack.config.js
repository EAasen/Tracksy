/**
 * Webpack optimization configuration for the Tracksy application
 */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = (env = {}) => {
  const isDev = process.env.NODE_ENV !== 'production';
  return {
    mode: isDev ? 'development' : 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].chunk.js',
      publicPath: '/',
      clean: true
    },
    // Development server configuration (used when running `webpack serve`)
    devServer: {
      port: process.env.PORT || 3001,
      historyApiFallback: true,
      hot: true,
      compress: true,
      static: { directory: path.join(__dirname, 'public') },
      client: { overlay: true, logging: 'info' },
      allowedHosts: 'all'
    },
    module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-syntax-dynamic-import'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb - smaller files will be inlined as base64
          }
        }
      }
    ]
  },
    optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.logs in production
          },
          output: {
            comments: false, // Remove comments
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000, // Minimum size in bytes to create a chunk
      maxSize: 244000, // Try to split chunks bigger than maxSize
      minChunks: 1, // Minimum number of chunks that must share a module
      maxAsyncRequests: 30, // Maximum number of parallel requests when loading chunks on demand
      maxInitialRequests: 30, // Maximum number of parallel requests at initial page load
      automaticNameDelimiter: '~',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name: 'vendors'
        },
        // Separate React libraries into their own chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
          priority: 20
        },
        // Group charting libraries
        charts: {
          test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
          name: 'chart-vendor',
          chunks: 'all',
          priority: 15
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: 'single' // Create a single runtime chunk
  },
    plugins: [
      // React Fast Refresh only in dev
      ...(isDev ? [new ReactRefreshWebpackPlugin({ overlay: false })] : []),
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
        analyzerPort: 8888,
      })
    ],
    resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      // Add aliases for common imports to shorten import paths
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  },
  // Cache webpack modules
    cache: {
      type: 'filesystem',
      buildDependencies: { config: [__filename] }
    }
  };
};
