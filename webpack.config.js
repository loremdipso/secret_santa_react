const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


module.exports = {
	entry: "./src/index.tsx",

	target: "web",
	mode: "development",

	output: {
		path: path.resolve(__dirname, "docs"),
		filename: 'bundle.js',

		// it's weird why this is necessary, but w/e
		publicPath: "./"
	},

	devServer: {
		compress: true,
		publicPath: "/",
		contentBase: path.join(__dirname, 'src', 'public'),

		stats: {
			warnings: false
		},
		port: 9000
	},

	plugins: [new HtmlWebpackPlugin({
		template: "src/public/index.html",

		// use hash here instead of in the actual generated filename
		// for version control sanity, mostly
		hash: true
	})],

	resolve: {
		extensions: [".json", ".ts", ".tsx", ".js", ".jsx", ".css", ".scss"],
		plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
	},

	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(ts|tsx)$/,
				loader: "babel-loader",
				exclude: /node_modules/,
				options: {
					plugins: [
						// ['import', { libraryName: "antd", style: true }]
						["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }, "ant"],
						["import", {
							"libraryName": "@ant-design/icons",
							"libraryDirectory": "es/icons",
							"camel2DashComponentName": false
						}, "ant-design-icons"],

						// ['import', {
						// 	libraryName: '@ant-design/icons',
						// 	libraryDirectory: '',
						// 	camel2DashComponentName: false
						// }]

						// ['import',
						// 	{
						// 		"libraryName": "@ant-design/icons",
						// 		"libraryDirectory": "es/icons",
						// 		"camel2DashComponentName": false
						// 	},
						// 	"@ant-design/icons"
						// ],
					]
				},
			},
			{
				test: /\.(png|svg|ico|jpe?g|gif)$/i,
				use: [
					'file-loader',
				],
			},
		],
	},
};
