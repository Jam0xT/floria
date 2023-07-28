import { getAsset } from './assets';
import { getCurrentState } from './state';
const Constants = require('../shared/constants');
const { MAP_WIDTH, MAP_HEIGHT, RATED_WIDTH, RATED_HEIGHT } = Constants;
const EntityAttributes = require('../../public/entity_attributes');
const PetalAttributes = require('../../public/petal_attributes');

const layerCount = 10;
let canvas = [];
let ctx;
let W, H, wpx, hpx;
let alphaConnecting = 0;
let alphaInputBox = 0;
let alphaBlack = 1;
let textConnectingPos = 0, textConnectingVelocity = 0;
let inputBoxPos = 600, inputBoxVelocity = 65;
let connected = false;
let startup = true;
let gameRadiusOnEnter = 0;
let deltaGameRadiusOnEnter = 5;
let backgroundLayer = 1, playerLayer = 3, petalLayer = 2, shadeLayer = 4, mobLayer = 2, UILayer = 5;

export function renderStartup () {
	for (let i = 0; i < layerCount; i ++ ) {
		let newCanvas = document.createElement('canvas');
		newCanvas.id = `canvas-${i}`;
		document.body.append(newCanvas);
		canvas.push(document.getElementById(`canvas-${i}`));
		canvas[i].classList.add('canvas');
		canvas[i].style['z-index'] = i + 2;
	}
	setCanvasDimensions();
	for (let i = 0; i < layerCount; i ++ ) {
		ctx = canvas[i].getContext('2d');
		ctx.clearRect(0, 0, W, H);
	}
	let inputBox = document.getElementById('username-input');
	inputBox.addEventListener('beforeinput', (event) => {
		let inputCur = inputBox.value;
		let input = event.data;
		if ( input ) {
			if ( new Blob([inputCur + input]).size >= 15 ) {
				event.preventDefault();
			}
		}
	});
	alphaBlack = 1;
	document.getElementById("text").classList.add('hidden');
}

export function renderInit() {
	alphaConnecting = 0;
	alphaInputBox = 0;
	alphaBlack = 1;
	textConnectingPos = 0;
	textConnectingVelocity = 0;
	inputBoxPos = 600;
	inputBoxVelocity = 65;
	connected = false;
	gameRadiusOnEnter = 0;
	deltaGameRadiusOnEnter = 5;
	for (let i = 0; i < layerCount; i ++ ) {
		ctx = getCtx(i);
		ctx.clearRect(0, 0, W, H);
	}
}

window.addEventListener('resize', setCanvasDimensions);

let animationFrameRequestId;

function setCanvasDimensions() {
	const innerRatio = window.innerWidth / window.innerHeight;
	const ratedWidth = RATED_WIDTH;
	const ratedHeight = RATED_HEIGHT;
	const ratedRatio = ratedWidth / ratedHeight;
	if ( ratedRatio > innerRatio ) {
		W = ratedHeight * innerRatio;
		H = ratedHeight;
	} else {
		W = ratedWidth;
		H =  ratedWidth / innerRatio;
	}
	wpx = W / 1000;
	hpx = H / 1000;
	for ( let i = 0; i < layerCount; i ++ ) {
		canvas[i].width = W;
		canvas[i].height = H;
	}
}

function renderGame() {
	for ( let i = 0; i < layerCount; i ++ ) {
		ctx = getCtx(i);
		ctx.clearRect(0, 0, W, H);
	}
	if ( gameRadiusOnEnter < hpx * 1800 ) {
		fillBackground(0, "#1EA761");
		renderText(0, 1, "florr.cn", W / 2, H / 2 - hpx * 220, hpx * 85, 'center');
		renderText(0, 1, "How to play", W / 2, H / 2 + hpx * 100, hpx * 30, 'center');
		renderText(0, 1, "Use Mouse or [W] [S] [A] [D] to move", W / 2, H / 2 + hpx * 140, hpx * 15, 'center');
		renderText(0, 1, "Left click or [Space] to attack", W / 2, H / 2 + hpx * 165, hpx * 15, 'center');
		renderText(0, 1, "Right click or [LShift] to defend", W / 2, H / 2 + hpx * 190, hpx * 15, 'center');
		gameRadiusOnEnter += deltaGameRadiusOnEnter;
		deltaGameRadiusOnEnter *= 1.05;
	}
	const { me, others, mobs, leaderboard, playerCount, rankOnLeaderboard } = getCurrentState();
	if ( me ) {
		renderBackground(me.x, me.y);
		renderPlayer(me, me);
		others.forEach(renderPlayer.bind(null, me));
		mobs.forEach(mob => {
			renderMob(me, mob);
		});
		renderText(UILayer, 0.7, "florr.cn", W - hpx * 80, H - hpx * 20, hpx * 40, 'center');
		renderLeaderboard(leaderboard, playerCount, me, rankOnLeaderboard);
	}
	
	if ( gameRadiusOnEnter < hpx * 1800 ) {
		for ( let i = 1; i <= 5; i ++ ) {
			ctx = getCtx(i);
			ctx.globalCompositeOperation = 'destination-in';
			ctx.beginPath();
			ctx.arc(W / 2, H / 2, gameRadiusOnEnter, 0, 2 * Math.PI, false);
			ctx.closePath();
			ctx.fillStyle = 'rgb(0, 0, 0)';
			ctx.fill();
			ctx.globalCompositeOperation = 'source-over';
		}
		ctx = getCtx(9);
		ctx.beginPath();
		ctx.arc(W / 2, H / 2, gameRadiusOnEnter, 0, 2 * Math.PI, false);
		ctx.closePath();
		ctx.strokeStyle = 'rgb(0, 0, 0)';
		ctx.lineWidth = hpx * 5;
		ctx.stroke();
	}
	render(renderGame);
}

function renderBackground(x, y) {
	ctx = getCtx(backgroundLayer);
	ctx.fillStyle = 'rgb(28, 154, 89)';
	ctx.fillRect(0, 0, W, H);

	ctx.fillStyle = 'rgb(30, 167, 97)';
	ctx.fillRect(W / 2 - x, H / 2 - y, MAP_WIDTH, MAP_HEIGHT);

	const gridInterval = hpx * 50;

	const startX = ( W / 2 - x ) % gridInterval;
	const startY = ( H / 2 - y ) % gridInterval;

	const gridLineWidth = hpx * 0.5;
	const gridLineStyle = 'rgb(23, 128, 74)';

	for ( let ix = startX; ix < W; ix += gridInterval) {
		ctx.beginPath();
		ctx.moveTo(ix, 0);
		ctx.lineTo(ix, H);
		ctx.strokeStyle = gridLineStyle;
		ctx.lineWidth = gridLineWidth;
		ctx.stroke();
		ctx.closePath();
	}

	for ( let iy = startY; iy < H; iy += gridInterval) {
		ctx.beginPath();
		ctx.moveTo(0, iy);
		ctx.lineTo(W, iy);
		ctx.strokeStyle = gridLineStyle;
		ctx.lineWidth = gridLineWidth;
		ctx.stroke();
		ctx.closePath();
	}
}

function renderPlayer(me, player) {
	// render player itself
	ctx = getCtx(playerLayer);
	const { x, y } = player;
	const canvasX = W / 2 + x - me.x;
	const canvasY = H / 2 + y - me.y;
	const renderRadius = EntityAttributes.PLAYER.RENDER_RADIUS;
	if ( player.username == "Pop!" ) {
		ctx.drawImage(
			getAsset('mobs/bubble.svg'),
			canvasX - renderRadius,
			canvasY - renderRadius,
			renderRadius * 2,
			renderRadius * 2,
		);
	} else {
		ctx.drawImage(
			getAsset('player.svg'),
			canvasX - renderRadius,
			canvasY - renderRadius,
			renderRadius * 2,
			renderRadius * 2,
		);
	}

	// render username and hp
	renderText(backgroundLayer, 1, player.username, canvasX, canvasY - 35, hpx * 20, 'center');
	// renderText(backgroundLayer, 1, `${Math.floor(player.hp)}`, canvasX, canvasY + 65, hpx * 18, 'center');

	// render health bar
	ctx = getCtx(backgroundLayer);

	const healthBarBaseWidth = hpx * 10;
	const healthBarBaseStyle = 'rgb(51, 51, 51)';
	const healthBarBaseLength = EntityAttributes.PLAYER.RADIUS * 2 + hpx * 20;

	const healthBarOutline = hpx * 3;
	const healthBarWidth = healthBarBaseWidth - healthBarOutline;
	const healthBarStyleNormal = 'rgb(117, 221, 52)';
	const healthBarStyleHurt = 'rgb(221, 52, 52)';
	const healthBarLength = healthBarBaseLength * player.hp / player.maxHp ;

	ctx.beginPath();
	ctx.lineWidth = healthBarBaseWidth;
	ctx.moveTo(canvasX - healthBarBaseLength / 2, canvasY + hpx * 45);
	ctx.lineTo(canvasX + healthBarBaseLength / 2, canvasY + hpx * 45);
	ctx.strokeStyle = healthBarBaseStyle;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.lineWidth = healthBarWidth;
	ctx.moveTo(canvasX - healthBarBaseLength / 2, canvasY + hpx * 45);
	ctx.lineTo(canvasX - healthBarBaseLength / 2 + healthBarLength, canvasY + hpx * 45);
	ctx.strokeStyle = healthBarStyleNormal;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	// render petals
	ctx = getCtx(petalLayer);

	player.petals.forEach(petal => {
		const renderRadius = PetalAttributes[petal.type].RENDER_RADIUS;
		const asset = getAsset(`petals/${petal.type.toLowerCase()}.svg`);
		const width = asset.naturalWidth, height = asset.naturalHeight;

		ctx.translate(canvasX + petal.x - player.x, canvasY + petal.y - player.y);
		ctx.rotate(petal.dir);
		if ( width <= height ) {
			ctx.drawImage(
				asset,
				- renderRadius,
				- renderRadius / width * height,
				renderRadius * 2,
				renderRadius / width * height * 2,
			);
		} else {
			ctx.drawImage(
				asset,
				- renderRadius / height * width,
				- renderRadius,
				renderRadius / height * width * 2,
				renderRadius * 2,
			);
		}
		ctx.rotate(-petal.dir);
		ctx.translate(-(canvasX + petal.x - player.x), -(canvasY + petal.y - player.y));
	});
}

function renderMob(me, mob) {
	ctx = getCtx(mobLayer);
	const {x, y} = mob;
	const canvasX = W / 2 + x - me.x;
	const canvasY = H / 2 + y - me.y;

	ctx.translate(canvasX, canvasY);
	const renderRadius = EntityAttributes[mob.type].RENDER_RADIUS;
	const asset = getAsset(`mobs/${mob.type.toLowerCase()}.svg`);
	const width = asset.naturalWidth, height = asset.naturalHeight;
	// ctx.rotate(mob.dir);
	if ( width <= height ) {
		ctx.drawImage(
			asset,
			- renderRadius,
			- renderRadius / width * height,
			renderRadius * 2,
			renderRadius / width * height * 2,
		);
	} else {
		ctx.drawImage(
			asset,
			- renderRadius / height * width,
			- renderRadius,
			renderRadius / height * width * 2,
			renderRadius * 2,
		);
	}
	// ctx.rotate(-mob.dir);
	ctx.translate(-canvasX, -canvasY);

	renderText(UILayer, 1, mob.id, canvasX, canvasY - hpx * 35, hpx * 20, 'center');
	renderText(UILayer, 1, `hp:${mob.hp}`, canvasX, canvasY + hpx * 65, hpx * 18, 'center');
}

function renderLeaderboardRank(rank, leaderboardRankBaseLength, leaderboardRankOutlineWidth, leaderboardRankBaseWidth, rankTopScore,
	leaderboardHeadHeight, leaderboardHeightPerPlayer, rankOnLeaderboard, leaderboardRank, baseX, baseY) { // render the current rank on leaderboard

	ctx = getCtx(UILayer);

	baseX += 0;
	baseY += leaderboardHeadHeight + rank * leaderboardHeightPerPlayer;
	
	ctx.beginPath();
	ctx.lineWidth = leaderboardRankBaseWidth;
	ctx.moveTo(baseX - leaderboardRankBaseLength / 2, baseY + 0);
	ctx.lineTo(baseX + leaderboardRankBaseLength / 2, baseY + 0);
	if ( rank == rankOnLeaderboard ) {
		ctx.strokeStyle = 'rgb(200, 200, 200)';
	} else {
		ctx.strokeStyle = 'rgb(65, 65, 65)';
	}
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	const leaderboardRankLength = leaderboardRankBaseLength * leaderboardRank.score / rankTopScore;

	ctx.beginPath();
	ctx.lineWidth = leaderboardRankBaseWidth - leaderboardRankOutlineWidth * 2;
	ctx.moveTo(baseX - leaderboardRankBaseLength / 2, baseY + hpx * 0);
	ctx.lineTo(baseX - leaderboardRankBaseLength / 2 + leaderboardRankLength, baseY + hpx * 0);
	ctx.strokeStyle = 'rgb(255, 252, 97)';
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	var score = leaderboardRank.score;
	score = getNumberDisplay(score);

	const leaderboardDisplay = `${leaderboardRank.username} - ${score}`;

	renderText(UILayer, 1, leaderboardDisplay, baseX + hpx * 0, baseY + hpx * 5, hpx * 15, 'center');
}

function renderLeaderboard(leaderboard, playerCount, me, rankOnLeaderboard) {
	ctx = getCtx(UILayer);
	const leaderboardOutlineWidth = hpx * 5;

	const leaderboardBorderGap = hpx * 20;

	const leaderboardRoundCornerRadius = hpx * 5;

	const leaderboardHeadHeight = hpx * 40;
	const leaderboardHeightPerPlayer = hpx * 20;

	const leaderboardWidth = hpx * 200;
	const leaderboardHeight = leaderboardHeadHeight + leaderboardHeightPerPlayer * (Constants.LEADERBOARD_LENGTH + hpx * 1);

	const position = {
		x: W - leaderboardBorderGap - leaderboardWidth,
		y: leaderboardBorderGap,
	}
	
	ctx.fillStyle = "rgb(85, 85, 85)";
	ctx.fillRect(position.x + leaderboardOutlineWidth / 2, position.y + leaderboardOutlineWidth / 2,
	leaderboardWidth - leaderboardOutlineWidth / 2, leaderboardHeight - leaderboardOutlineWidth / 2);
	
	renderRoundRect(UILayer, position.x, position.y, leaderboardWidth, leaderboardHeight, leaderboardRoundCornerRadius, hpx * 1, hpx * 1, hpx * 1, hpx * 1);
	ctx.lineWidth = leaderboardOutlineWidth;
	ctx.strokeStyle = "rgb(69, 69, 69)";
	ctx.stroke();

	ctx.fillStyle = "rgb(85, 187, 85)";
	ctx.fillRect(position.x + leaderboardOutlineWidth / 2, position.y + leaderboardOutlineWidth / 2, 
	leaderboardWidth - leaderboardOutlineWidth / 2, leaderboardHeadHeight - leaderboardOutlineWidth / 2);
	
	renderRoundRect(UILayer, position.x, position.y, leaderboardWidth, leaderboardHeadHeight, leaderboardRoundCornerRadius, hpx * 1, hpx * 1, hpx * 0, hpx * 0);
	ctx.lineWidth = leaderboardOutlineWidth;
	ctx.strokeStyle = "rgb(69, 151, 69)";
	ctx.stroke();

	var baseX = position.x + leaderboardWidth / 2;
	var baseY = position.y;

	if ( playerCount > 1 ) {
		renderText(UILayer, 1, `${playerCount} Flowers`, baseX + hpx * 0, baseY + leaderboardHeadHeight / 2 + leaderboardOutlineWidth, hpx * 18, 'center');
	} else {
		renderText(UILayer, 1, '1 Flower', baseX + hpx * 0, baseY + leaderboardHeadHeight / 2 + leaderboardOutlineWidth, hpx * 18, 'center');
	}
	const rankTopScore = leaderboard[1].score;

	const leaderboardRankBaseLength = leaderboardWidth - leaderboardOutlineWidth - 30;
	const leaderboardRankOutlineWidth = 2;
	const leaderboardRankBaseWidth = leaderboardHeightPerPlayer - 1;

	const leaderboardLength = Math.min(Constants.LEADERBOARD_LENGTH, leaderboard.length - 1);

	for(var i = 1;i <= leaderboardLength - 1; i++) {
		renderLeaderboardRank(i, leaderboardRankBaseLength, leaderboardRankOutlineWidth, leaderboardRankBaseWidth, rankTopScore,
			leaderboardHeadHeight, leaderboardHeightPerPlayer, rankOnLeaderboard, leaderboard[i], baseX, baseY);
	}

	if ( rankOnLeaderboard <= leaderboardLength ) { // if I should be on leaderboard
		renderLeaderboardRank(leaderboardLength, leaderboardRankBaseLength, leaderboardRankOutlineWidth, leaderboardRankBaseWidth, rankTopScore,
			leaderboardHeadHeight, leaderboardHeightPerPlayer, rankOnLeaderboard, leaderboard[leaderboardLength], baseX, baseY);
	} else { // if not
		renderLeaderboardRank(leaderboardLength, leaderboardRankBaseLength, leaderboardRankOutlineWidth, leaderboardRankBaseWidth, rankTopScore,
			leaderboardHeadHeight, leaderboardHeightPerPlayer, leaderboardLength, {score: me.score, id: me.id, username: me.username}, baseX, baseY);
	}
}

export function startRenderingMenu() { // render menu
	cancelAnimationFrame(animationFrameRequestId);
	document.getElementById("username-input").classList.remove('hidden');
	alphaConnecting = 1;
	alphaInputBox = 0.6;
	render(renderMainMenu);
}

function renderMainMenu() {
	for (let i = 0; i <= 3; i ++ ) {
		ctx = getCtx(i);
		ctx.clearRect(0, 0, W, H);
	}

	alphaConnecting -= 0.01;
	alphaConnecting = Math.max(0, alphaConnecting);
	alphaInputBox += 0.01;
	alphaInputBox = Math.min(1, alphaInputBox);
	if ( startup ) {
		alphaBlack -= 0.04;
		alphaBlack = Math.max(0, alphaBlack);
		if ( alphaBlack <= 0 ) {
			alphaBlack = 0;
			startup = false;
		}
	}

	fillBackground(0, "#1EA761");
	renderText(0, 1, "florr.cn", W / 2, H / 2 - hpx * 220, hpx * 85, 'center');
	renderText(0, 1, "How to play", W / 2, H / 2 + hpx * 100, hpx * 30, 'center');
	renderText(0, 1, "Use Mouse or [W] [S] [A] [D] to move", W / 2, H / 2 + hpx * 140, hpx * 15, 'center');
	renderText(0, 1, "Left click or [Space] to attack", W / 2, H / 2 + hpx * 165, hpx * 15, 'center');
	renderText(0, 1, "Right click or [LShift] to defend", W / 2, H / 2 + hpx * 190, hpx * 15, 'center');
	
	if ( textConnectingPos >= -1000 ) { // connecting... text animation
		if ( connected ) {
			textConnectingVelocity += 5;
			textConnectingPos -= textConnectingVelocity;
		}
		renderText(1, alphaConnecting, "Connecting...", W / 2, H / 2 + hpx * textConnectingPos, hpx * 50, 'center');
	}

	if ( connected ) { // handle input box animation
		inputBoxVelocity *= 0.9;
		if ( inputBoxVelocity <= 0.5 ) {
			inputBoxVelocity = 0;
		}
		inputBoxPos -= inputBoxVelocity;
		inputBoxPos = Math.max(0, inputBoxPos);
		renderInputBox(2, alphaInputBox);
	}

	if ( startup ) {
		ctx = getCtx(3);
		ctx.globalAlpha = alphaBlack;
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, W, H);
	}

	render(renderMainMenu);
}

export function startRenderGameEnter() {
	cancelAnimationFrame(animationFrameRequestId);
	inputBoxVelocity = 0;
	render(renderGameEnter);
}

function renderGameEnter() {
	for (let i = 0; i <= 3; i ++ ) {
		ctx = getCtx(i);
		ctx.clearRect(0, 0, W, H);
	}
	
	fillBackground(0, "#1EA761");
	renderText(0, 1, "florr.cn", W / 2, H / 2 - hpx * 220, hpx * 85, 'center');
	renderText(0, 1, "How to play", W / 2, H / 2 + hpx * 100, hpx * 30, 'center');
	renderText(0, 1, "Use Mouse or [W] [S] [A] [D] to move", W / 2, H / 2 + hpx * 140, hpx * 15, 'center');
	renderText(0, 1, "Left click or [Space] to attack", W / 2, H / 2 + hpx * 165, hpx * 15, 'center');
	renderText(0, 1, "Right click or [LShift] to defend", W / 2, H / 2 + hpx * 190, hpx * 15, 'center');

	if ( textConnectingPos >= -1000 ) {
		if ( connected ) {
			textConnectingVelocity += 5;
			textConnectingPos -= textConnectingVelocity;
		}
		renderText(1, alphaConnecting, "Connecting...", W / 2, H / 2 + hpx * textConnectingPos, hpx * 50, 'center');
	}

	if ( inputBoxPos <= 1000 ) {
		inputBoxVelocity += 5;
		inputBoxPos += inputBoxVelocity;
		alphaInputBox -= 0.01;
		renderInputBox(2, alphaInputBox);
	}

	if ( startup ) {
		alphaBlack -= 0.04;
		alphaBlack = Math.max(0, alphaBlack);
		if ( alphaBlack <= 0 ) {
			alphaBlack = 0;
			startup = false;
		}
		ctx = getCtx(3);
		ctx.globalAlpha = alphaBlack;
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, W, H);
	}

	if ( (textConnectingPos < -1000) && (inputBoxPos > 1000) && (!startup) ) {
		for(let i = 0; i <= 3; i ++ ) {
			ctx = getCtx(i);
			ctx.globalAlpha = 1;
		}
		render(renderGame);
	} else {
		render(renderGameEnter);
	}
}

function renderInputBox(layer, alpha) {
	ctx = getCtx(layer);
	ctx.globalAlpha = alpha;
	let textOffset = -45;
	let textFontSize = 20;
	renderText(2, alpha, "This pretty little flower is called...", W / 2, H / 2 + hpx * (textOffset - inputBoxPos), hpx * textFontSize, 'center');

	let inputBox = document.getElementById("username-input");
	inputBox.style['top'] = `${(H / 2 - hpx * inputBoxPos - hpx * 10) / H * window.innerHeight}px`;
	inputBox.style['outline-color'] = `rgba(0, 0, 0, ${alpha})`;
	inputBox.style['backgroundColor'] = `rgba(238, 238, 238, ${alpha})`;
	inputBox.focus();

	textOffset = 32;
	textFontSize = 13;
	renderText(2, alpha, "(press [Enter] to spawn)", W / 2, H / 2 + hpx * (textOffset - inputBoxPos), hpx * textFontSize, 'center');
}

export function renderConnected() { // called when connected to server
	connected = true;
}

function fillBackground(layer, fillStyle) {
	ctx = getCtx(layer);
	ctx.fillStyle = fillStyle;
	ctx.fillRect(0, 0, W, H);
}

function renderRoundRect(layer, x, y, w, h, r, r4, r1, r2, r3) { // r1 -> r4 clockwise, r1: top right | NOTE: path ONLY, no STROKE
	ctx = getCtx(layer);
	if ( w < 2 * r ) {
		w = 2 * r;
	}
	if ( h < 2 * r ) {
		h = 2 * r;
	}
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	if ( r1 ) {
	    ctx.arcTo(x+w, y, x+w, y+h, r);
	} else {
		ctx.lineTo(x+w, y);
	}
	if ( r2 ) {
		ctx.arcTo(x+w, y+h, x, y+h, r);
	} else {
		ctx.lineTo(x+w, y+h);
	}
	if ( r3 ) {
    	ctx.arcTo(x, y+h, x, y, r);
	} else {
		ctx.lineTo(x, y+h);
	}
	if ( r4 ) {
    	ctx.arcTo(x, y, x+w, y, r);
	} else {
		ctx.lineTo(x, y);
	}
	ctx.closePath();
}

function renderText(layer, alpha, text, x, y, fontSize, textAlign) {
	ctx = getCtx(layer);
	if ( fontSize ) {
		ctx.lineWidth = Math.max(fontSize * 0.125, hpx * 2.5);
		ctx.font = `${fontSize}px Ubuntu`;

		ctx.textAlign = textAlign;
	}

	ctx.globalAlpha = alpha;
	ctx.globalCompositeOperation = 'source-over';
	ctx.strokeStyle = "black";
	ctx.strokeText(text, x, y);

	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = "white";
	ctx.fillText(text, x, y);

	ctx.globalAlpha = alpha;
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = "white";
	ctx.fillText(text, x, y);

	ctx.globalAlpha = 1;
}

function getNumberDisplay(x) { // 1000 -> 1.0k etc.
	if ( x >= 10**10 ) {
		const digitNumber = Math.floor(Math.log10(x));
		x = Math.floor(x / 10**(digitNumber - 1)) / 10;
		x = x.toFixed(1) + 'e+' + digitNumber;
	} else if ( x >= 10**9 ) {
		x = Math.floor(x / 10**8) / 10;
		x = x.toFixed(1) + 'b';
	} else if ( x >= 10**6 ) {
		x = Math.floor(x / 10**5) / 10;
		x = x.toFixed(1) + 'm';
	} else if ( x >= 1000 ) {
		x = Math.floor(x / 100) / 10;
		x = x.toFixed(1) + 'k';
	}
	return x;
}

function render(renderFunction) {
	animationFrameRequestId = requestAnimationFrame(renderFunction);
}

function getCtx(layer) {
	return canvas[layer].getContext('2d');
}