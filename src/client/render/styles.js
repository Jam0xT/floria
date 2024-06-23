export default {
	background: {
		menu: "#1EA761",
	},
	
	selectbox: {
		default: {
			fill: 'rgb(196, 196, 196)', // 一种灰色
			outline: 'rgb(100, 100, 100)', // 深灰色
			hover: 'rgb(196, 196, 196)', // 浅一点的灰色
			click: 'rgb(196, 196, 196)', // 有点深的灰色
			selection: 'rgb(255, 255, 255)',
			selectionBase: 'rgb(139, 139, 139)',
			selectionSize: 9,
			selectionBaseSize: 12,
			outline_width: 3, // 单位：u
			arcRadius: 2, // 单位：u
		},
	},
	
	inputbox: {
		default: {
			fill: 'rgb(255, 255, 255)',
			outline: 'rgb(100, 100, 100)', // 深灰色
			hover: 'rgb(210, 210, 210)', // 浅一点的灰色
			click: 'rgb(150, 150, 150)', // 有点深的灰色
			outline_width: 3, // 单位：u
			arcRadius: 2, // 单位：u
		},
		green: {
			fill: 'rgb(48, 255, 165)',
			outline: 'rgb(100, 100, 100)', // 深灰色
			hover: 'rgb(54, 217, 146)', // 浅一点的灰色
			click: 'rgb(37, 161, 107)', // 有点深的灰色
			outline_width: 3, // 单位：u
			arcRadius: 2, // 单位：u
		},
	},

	button: {
		default: {
			fill: 'rgb(196, 196, 196)', // 一种灰色
			outline: 'rgb(100, 100, 100)', // 深灰色
			hover: 'rgb(210, 210, 210)', // 浅一点的灰色
			click: 'rgb(150, 150, 150)', // 有点深的灰色
			outline_width: 3, // 单位：u
			arcRadius: 2, // 单位：u
		},
	},

	menu: {
		default: { // 半透明黑
			fill: 'rgba(0, 0, 0, 0.7)',
			outline: 'rgb(0, 0, 0)',
			outline_width: 0, // 单位：u
			arcRadius: 3, // 单位：u
		},
		invisible: {
			fill: 'rgba(0, 0, 0, 0)',
			outline: 'rgb(0, 0, 0)',
			outline_width: 0, // 单位：u
			arcRadius: 0, // 单位：u
		}
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