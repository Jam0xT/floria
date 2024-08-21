import * as pixi from 'pixi.js';

class textStyles {
	static default(fontSize, color = '#000000') {
		return new pixi.TextStyle({
			fontFamily: 'Ubuntu',
			fontWeight: 700,
			fontSize: fontSize,
			fill: '#ffffff',
			stroke: {
				color: color,
				width: fontSize / 8,
			},
		});
	}
}

export default textStyles;