import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const entry = {
	game: './src/client/index.js',
};
export const output = {
	filename: '[name].[contenthash].js',
	path: resolve(__dirname, 'dist'),
};
export const module = {
	rules: [
		{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: "babel-loader",
				options: {
					presets: ['@babel/preset-env'],
				},
			},
		},
		{
			test: /\.css$/,
			use: [
				{
					loader: MiniCssExtractPlugin.loader,
				},
				'css-loader',
			],
		},
	],
};
export const plugins = [
	new MiniCssExtractPlugin({
		filename: '[name].[contenthash].css',
	}),
	new HtmlWebpackPlugin({
		filename: 'index.html',
		template: 'src/client/html/index.html',
	}),
];