export default {
	startScreen: {
		background: "#1EA761",
	},

	button: {
		default: {
			fill: 'rgb(196, 196, 196)', // 一种灰色
			outline: 'rgb(100, 100, 100)', // 深灰色
			hover: 'rgb(210, 210, 210)', // 浅一点的灰色
			click: 'rgb(150, 150, 150)', // 有点深的灰色
			outline_width: 5, // 单位：u
			arcRadius: 5, // 单位：u
		},
	},

	menu: {
		black: { // 半透明黑
			fill: 'rgba(0, 0, 0, 0.7)',
			outline: 'rgb(0, 0, 0)',
			outline_width: 0, // 单位：u
			arcRadius: 3, // 单位：u
		},
	},

	rarity_color: [ // 稀有度颜色
		'rgb(126, 239, 109)', // common
		'rgb(255, 230, 93)', // unusual
		'rgb(77, 82, 227)', // rare
		'rgb(134, 31, 222)', // epic
		'rgb(222, 31, 31)', // legendary
		'rgb(31, 219, 222)', // mythic
		'rgb(255, 43, 117)', // unique
	],

	rarity_color_darkened: [ // 稀有度颜色深色版
		'rgb(102, 194, 88)',
		'rgb(207, 186, 75)',
		'rgb(62, 66, 184)',
		'rgb(109, 25, 180)',
		'rgb(180, 25, 25)',
		'rgb(25, 177, 180)',
		'rgb(207, 35, 95)',
	],
};