let gameRadiusOnEnter = 0;
let deltaGameRadiusOnEnter = 5;

export function renderGameEnter() {
	menuLayer.forEach(layer => {
		ctx = getCtx(layer);
		ctx.clearRect(0, 0, W, H);
	});
	
	ctx = getCtx(menuLayer[0]);
	fillBackground("#1EA761");
	renderText(1, "floria.io", W / 2, H / 2 - hpx * 220, hpx * 85, 'center');
	renderText(1, "How to play", W / 2, H / 2 + hpx * 100, hpx * 30, 'center');
	renderText(1, "Use Mouse or [W] [S] [A] [D] to move", W / 2, H / 2 + hpx * 140, hpx * 15, 'center');
	renderText(1, "Left click or [Space] to attack", W / 2, H / 2 + hpx * 165, hpx * 15, 'center');
	renderText(1, "Right click or [LShift] to defend", W / 2, H / 2 + hpx * 190, hpx * 15, 'center');
	renderText(1, "Press [K] to toggle keyboard movement", W / 2, H / 2 + hpx * 215, hpx * 15, 'center');

	if ( textConnectingPos >= -1000 ) {
		if ( connected ) {
			textConnectingVelocity += 5;
			textConnectingPos -= textConnectingVelocity;
		}
		ctx = getCtx(menuLayer[1]);
		renderText(alphaConnecting, "Connecting...", W / 2, H / 2 + hpx * textConnectingPos, hpx * 50, 'center');
	}

	if ( inputBoxPos <= 1000 ) {
		inputBoxVelocity += 5;
		inputBoxPos += inputBoxVelocity;
		alphaInputBox -= 0.01;
		renderInputBox(menuLayer[2], alphaInputBox);
	}

	if ( startup ) {
		alphaBlack -= 0.04;
		alphaBlack = Math.max(0, alphaBlack);
		if ( alphaBlack <= 0 ) {
			alphaBlack = 0;
			startup = false;
		}
		ctx = getCtx(menuLayer[3]);
		ctx.globalAlpha = alphaBlack;
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, W, H);
	}

	if ( (textConnectingPos < -1000) && (inputBoxPos > 1000) && (!startup) ) {
		menuLayer.forEach(layer => {
			ctx = getCtx(layer);
			ctx.globalAlpha = 1;
		});
		render(renderGame);
		startCapturingInput();
	} else {
		render(renderGameEnter);
	}
}