module.exports = {
	context: __dirname + "/src",
	entry: "./TSService.ts",
	output: {
		path: __dirname + "/lib",
		libraryTarget: "amd",
		filename: "tsserver-client-bundle.js",
//		library: "small-client"
	},
	resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
  	extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { 
				test: /\.tsx?$/,
				exclude:  ["./driver/StdIODriver.ts"],
				loader: 'ts-loader' }
    ]
  }
}