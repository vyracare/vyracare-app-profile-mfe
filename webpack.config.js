const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  output: { uniqueName: "[name-generic]", publicPath: "auto" },
  optimization: { runtimeChunk: false },
  plugins: [
    new ModuleFederationPlugin({
      name: "[name-generic]",
      filename: "remoteEntry.js",
      exposes: {
        './App': './src/app/app.ts'
      },
      shared: ["@angular/core", "@angular/common", "@angular/router"]
    })
  ],
};

