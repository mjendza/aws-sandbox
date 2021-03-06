const path = require('path');
const glob = require('glob');

// Credits: https://hackernoon.com/webpack-creating-dynamically-named-outputs-for-wildcarded-entry-files-9241f596b065
const entryArray = glob.sync('./src/**/index.ts');

const entryObject = entryArray.reduce((acc, item) => {
    let name = path.dirname(item.replace('./src/', ''))
    // conforms with Webpack entry API
    // Example: { ingest: './src/ingest/index.ts' }
    acc[name] = item
    return acc;
}, {});
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: entryObject,
    target: "node",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: false, // Set to true if you are using fork-ts-checker-webpack-plugin
                        projectReferences: true
                    }
                }
            }
        ]
    },
    resolve: {
        modules: [
            "node_modules",
            path.resolve(__dirname)
        ],
        extensions: [".js", ".ts", ".tsx"],
    },
    context: __dirname,
    externals: [/aws-sdk/],
    devtool: "nosources-source-map",
    mode: 'production',
    // mode: "development",
    // optimization: {
    //     minimize: false,
    //     usedExports: true,
    // },
    // plugins: [
    //     new BundleAnalyzerPlugin()
    // ],
    // Output directive will generate build/<function-name>/index.js
    output: {
        filename: '[name]/index.js',
        path: path.resolve(__dirname, 'dist'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        // Credit to Richard Buggy!!
        libraryTarget: 'commonjs2'
    }
};
