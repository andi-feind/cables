const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const glMatrix = require("gl-matrix");

module.exports = (isProduction) =>
{
    return {
        "mode": isProduction ? "production" : "development",
        "entry": [
            path.join(__dirname, "src", "core", "index.js"),
        ],
        "devtool": isProduction ? "source-map" : "eval-cheap-module-source-map",
        "output": {
            "path": path.join(__dirname, "build"),
            "filename": isProduction ? "cables.min.js" : "cables.max.js",
            "library": "CABLES",
            "libraryExport": "default",
            "libraryTarget": "var",
            "globalObject": "window",
        },
        "stats": isProduction,
        "optimization": { "minimize": isProduction },
        "module": {
            "rules": [
                {
                    "test": /\.frag/,
                    "use": "raw-loader",
                },
                {
                    "test": /\.vert/,
                    "use": "raw-loader",
                },
                {
                    "test": /\.wgsl/,
                    "use": "raw-loader",
                }
            ].filter(Boolean),
        },
        "externals": ["CABLES.UI", ...Object.keys(glMatrix), "gl-matrix"],
        "resolve": {
            "extensions": [".json", ".js", ".jsx"],
        },
        "plugins": [
            isProduction
            && new BundleAnalyzerPlugin({
                "analyzerMode": "disabled",
                "generateStatsFile": true,
            })
        ].filter(Boolean),
    };
};
