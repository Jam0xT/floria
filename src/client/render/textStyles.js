import * as pixi from 'pixi.js';

const textStyles = {
	'default': function(fontSize, color = '#ffffff') {
		return new pixi.TextStyle({
			fontFamily: 'Ubuntu',
			fontWeight: 700,
			fontSize: fontSize,
			fill: color,
			stroke: {
				color: '#000000',
				width: fontSize / 8,
			},
		});
	}
}

export default textStyles;