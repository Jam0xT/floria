import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');

const { MAP_WIDTH, MAP_HEIGHT, RATED_WIDTH, RATED_HEIGHT } = Constants;

const EntityAttributes = require('../../public/entity_attributes');
const PetalAttributes = require('../../public/petal_attributes');

const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
setCanvasDimensions();

function setCanvasDimensions() {
	const innerRatio = window.innerWidth / window.innerHeight;
	const ratedWidth = RATED_WIDTH;
	const ratedHeight = RATED_HEIGHT;
	const ratedRatio = ratedWidth / ratedHeight;
	if ( ratedRatio > innerRatio ) {
		canvas.width = ratedHeight * innerRatio;
		canvas.height = ratedHeight;
	} else {
		canvas.width = ratedWidth;
		canvas.height = ratedWidth / innerRatio;
	}
}

window.addEventListener('resize', setCanvasDimensions);

let animationFrameRequestId;

function renderGame() {
	const { me, others, mobs, leaderboard, playerCount, rankOnLeaderboard } = getCurrentState();
	if ( me ) {
		renderBackground(me.x, me.y);
		renderPlayer(me, me);
		others.forEach(renderPlayer.bind(null, me));
		mobs.forEach(mob => {
			renderMob(me, mob);
		})
		renderText('florr.cn', 20, 40, 30, 'start');
		renderLeaderboard(leaderboard, playerCount, me, rankOnLeaderboard);
	}
	animationFrameRequestId = requestAnimationFrame(renderGame);
}

function renderBackground(x, y) {
	context.fillStyle = "#1C9A59";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "#1EA761";
	context.fillRect(canvas.width / 2 - x, canvas.height / 2 - y, MAP_WIDTH, MAP_HEIGHT);

	const gridInterval = 50;

	const startX = ( canvas.width / 2 - x ) % gridInterval;
	const startY = ( canvas.height / 2 - y ) % gridInterval;

	const gridLineWidth = 0.5;
	const gridLineStyle = '#17804A';

	for ( let ix = startX; ix < canvas.width; ix += gridInterval) {
		context.beginPath();
		context.moveTo(ix, 0);
		context.lineTo(ix, canvas.height);
		context.strokeStyle = gridLineStyle;
		context.lineWidth = gridLineWidth;
		context.stroke();
		context.closePath();
	}

	for ( let iy = startY; iy < canvas.height; iy += gridInterval) {
		context.beginPath();
		context.moveTo(0, iy);
		context.lineTo(canvas.width, iy);
		context.strokeStyle = gridLineStyle;
		context.lineWidth = gridLineWidth;
		context.stroke();
		context.closePath();
	}
}

function renderPlayer(me, player) {
	const { x, y } = player;
	const canvasX = canvas.width / 2 + x - me.x;
	const canvasY = canvas.height / 2 + y - me.y;

	context.save();

	context.translate(canvasX, canvasY);
	const renderRadius = EntityAttributes.PLAYER.RADIUS * 1.05;
	if ( player.username == "Pop!" ) {
		context.drawImage(
			getAsset('mobs/bubble.svg'),
			- renderRadius,
			- renderRadius,
			renderRadius * 2,
			renderRadius * 2,
		);
	} else {
		context.drawImage(
			getAsset('player.svg'),
			- renderRadius,
			- renderRadius,
			renderRadius * 2,
			renderRadius * 2,
		);
	}

	renderText(player.username, 0, -35, 20, 'center');
	renderText(Math.floor(Math.sqrt((player.x - me.x) * (player.x - me.x) + (player.y - me.y) * (player.y - me.y))), 0, -60);
	renderText(`(${Math.floor(player.x)} , ${Math.floor(player.y)})`, 0, -85);
	renderText(`${Math.floor(player.hp)}`, 0, 65);

	const healthBarBaseWidth = 10;
	const healthBarBaseStyle = 'rgb(51, 51, 51)';
	const healthBarBaseLength = EntityAttributes.PLAYER.RADIUS * 2 + 20;

	const healthBarOutline = 3;
	const healthBarWidth = healthBarBaseWidth - healthBarOutline;
	const healthBarStyleNormal = 'rgb(117, 221, 52)';
	const healthBarStyleHurt = 'rgb(221, 52, 52)';
	const healthBarLength = healthBarBaseLength * player.hp / player.maxHp ;

	context.save();

	context.translate(0, 45);

	context.beginPath();
	context.lineWidth = healthBarBaseWidth;
	context.moveTo(- healthBarBaseLength / 2, 0);
	context.lineTo(healthBarBaseLength / 2, 0);
	context.strokeStyle = healthBarBaseStyle;
	context.lineCap = 'round';
	context.stroke();
	context.closePath();

	context.beginPath();
	context.lineWidth = healthBarWidth;
	context.moveTo(- healthBarBaseLength / 2, 0);
	context.lineTo(- healthBarBaseLength / 2 + healthBarLength, 0);
	context.strokeStyle = healthBarStyleNormal;
	context.lineCap = 'round';
	context.stroke();
	context.closePath();

	context.restore();

	player.petals.forEach(petal => {
		context.save();

		context.translate(petal.x - player.x, petal.y - player.y);

		context.rotate(petal.dir);

		const renderRadius = (PetalAttributes[petal.type].RADIUS + 2);

		const asset = getAsset(`petals/${petal.type.toLowerCase()}.svg`);

		const width = asset.naturalWidth, height = asset.naturalHeight;

		if ( width <= height ) {
			context.drawImage(
				asset,
				- renderRadius,
				- renderRadius / width * height,
				renderRadius * 2,
				renderRadius / width * height * 2,
			);
		} else {
			context.drawImage(
				asset,
				- renderRadius / height * width,
				- renderRadius,
				renderRadius / height * width * 2,
				renderRadius * 2,
			);
		}
	
		// renderText(petal.id, 0, -35, 20, 'center');
	
		context.restore();
	});
	
	context.restore();

}

function renderMob(me, mob) {
	const {x, y} = mob;
	const canvasX = canvas.width / 2 + x - me.x;
	const canvasY = canvas.height / 2 + y - me.y;

	context.save();

	context.translate(canvasX, canvasY);
	const renderRadius = EntityAttributes[mob.type].RADIUS + 2;

	context.drawImage(
		getAsset(`mobs/${mob.type.toLowerCase()}.svg`),
		- renderRadius,
		- renderRadius,
		renderRadius * 2,
		renderRadius * 2,
	);

	renderText(mob.id, 0, -35, 20, 'center');
	renderText(`hp:${mob.hp}`, 0, 65);

	context.restore();
}

function renderEntity(x, y, entity, direction) {
	
}

function renderLeaderboardRank(rank, leaderboardRankBaseLength, leaderboardRankOutlineWidth, leaderboardRankBaseWidth, rankTopScore,
	leaderboardHeadHeight, leaderboardHeightPerPlayer, rankOnLeaderboard, leaderboardRank, baseX, baseY) { // render the current rank on leaderboard

	context.save();

	baseX += 0;
	baseY += leaderboardHeadHeight + rank * leaderboardHeightPerPlayer;
	
	context.beginPath();
	context.lineWidth = leaderboardRankBaseWidth;
	context.moveTo(baseX - leaderboardRankBaseLength / 2, baseY + 0);
	context.lineTo(baseX + leaderboardRankBaseLength / 2, baseY + 0);
	if ( rank == rankOnLeaderboard ) {
		context.strokeStyle = 'rgb(200, 200, 200)';
	} else {
		context.strokeStyle = 'rgb(65, 65, 65)';
	}
	context.lineCap = 'round';
	context.stroke();
	context.closePath();

	const leaderboardRankLength = leaderboardRankBaseLength * leaderboardRank.score / rankTopScore;

	context.beginPath();
	context.lineWidth = leaderboardRankBaseWidth - leaderboardRankOutlineWidth * 2;
	context.moveTo(baseX - leaderboardRankBaseLength / 2, baseY + 0);
	context.lineTo(baseX - leaderboardRankBaseLength / 2 + leaderboardRankLength, baseY + 0);
	context.strokeStyle = 'rgb(255, 252, 97)';
	context.lineCap = 'round';
	context.stroke();
	context.closePath();

	var score = leaderboardRank.score;
	score = getNumberDisplay(score);

	const leaderboardDisplay = `${leaderboardRank.username} - ${score}`;

	renderText(leaderboardDisplay, baseX + 0, baseY + 5, 15, 'center');

	context.restore();
}

function renderLeaderboard(leaderboard, playerCount, me, rankOnLeaderboard) {
	context.save();

	const leaderboardOutlineWidth = 5;

	const leaderboardBorderGap = 20;

	const leaderboardRoundCornerRadius = 5;

	const leaderboardHeadHeight = 40;
	const leaderboardHeightPerPlayer = 20;

	const leaderboardWidth = 200;
	const leaderboardHeight = leaderboardHeadHeight + leaderboardHeightPerPlayer * (Constants.LEADERBOARD_LENGTH + 1);

	const position = {
		x: canvas.width - leaderboardBorderGap - leaderboardWidth,
		y: leaderboardBorderGap,
	}
	
	context.fillStyle = "rgb(85, 85, 85)";
	context.fillRect(position.x + leaderboardOutlineWidth / 2, position.y + leaderboardOutlineWidth / 2,
	leaderboardWidth - leaderboardOutlineWidth / 2, leaderboardHeight - leaderboardOutlineWidth / 2);
	
	renderRoundRect(position.x, position.y, leaderboardWidth, leaderboardHeight, leaderboardRoundCornerRadius, 1, 1, 1, 1);
	context.lineWidth = leaderboardOutlineWidth;
	context.strokeStyle = "rgb(69, 69, 69)";
	context.stroke();

	context.fillStyle = "rgb(85, 187, 85)";
	context.fillRect(position.x + leaderboardOutlineWidth / 2, position.y + leaderboardOutlineWidth / 2, 
	leaderboardWidth - leaderboardOutlineWidth / 2, leaderboardHeadHeight - leaderboardOutlineWidth / 2);
	
	renderRoundRect(position.x, position.y, leaderboardWidth, leaderboardHeadHeight, leaderboardRoundCornerRadius, 1, 1, 0, 0);
	context.lineWidth = leaderboardOutlineWidth;
	context.strokeStyle = "rgb(69, 151, 69)";
	context.stroke();

	var baseX = position.x + leaderboardWidth / 2;
	var baseY = position.y;

	context.textAlign = "center";	
	context.lineWidth = 18 / 8;
	context.font = "18px Ubuntu";

	context.textAlign = "center"

	if ( playerCount > 1 ) {
		renderText(`${playerCount} Flowers`, baseX + 0, baseY + leaderboardHeadHeight / 2 + leaderboardOutlineWidth);
	} else {
		renderText('1 Flower', baseX + 0, baseY + leaderboardHeadHeight / 2 + leaderboardOutlineWidth);
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
	
	context.restore();
}

function renderMainMenu() {
	context.fillStyle = "#1EA761";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	context.textAlign = "center";

	context.lineWidth = 80 / 8;
	context.font = "80px Ubuntu";

	context.strokeStyle = "black";
	context.strokeText("florr.cn", canvas.width / 2, canvas.height / 2 - 200);

	context.fillStyle = "white";
	context.fillText("florr.cn", canvas.width / 2, canvas.height / 2 - 200);

	context.lineWidth = 20 / 8;
	context.font = "20px Ubuntu";

	context.strokeStyle = "black";
	context.strokeText("This pretty little flower is called...", canvas.width / 2, canvas.height / 2 - 40);

	context.fillStyle = "white";
	context.fillText("This pretty little flower is called...", canvas.width / 2, canvas.height / 2 - 40);

	render(renderMainMenu);
}

function render(renderFunction) {
	animationFrameRequestId = requestAnimationFrame(renderFunction);
}

export function startRenderingMainMenu() {
	cancelAnimationFrame(animationFrameRequestId);
	render(renderMainMenu);
}

export function startRenderingGame() {
	cancelAnimationFrame(animationFrameRequestId);
	render(renderGame);
}

function renderRoundRect(x, y, w, h, r, r4, r1, r2, r3) {
	if ( w < 2 * r ) {
		w = 2 * r;
	}
	if ( h < 2 * r ) {
		h = 2 * r;
	}
	context.beginPath();
	context.moveTo(x+r, y);
	if ( r1 ) {
	    context.arcTo(x+w, y, x+w, y+h, r);
	} else {
		context.lineTo(x+w, y);
	}
	if ( r2 ) {
   		context.arcTo(x+w, y+h, x, y+h, r);
	} else {
		context.lineTo(x+w, y+h);
	}
	if ( r3 ) {
    	context.arcTo(x, y+h, x, y, r);
	} else {
		context.lineTo(x, y+h);
	}
	if ( r4 ) {
    	context.arcTo(x, y, x+w, y, r);
	} else {
		context.lineTo(x, y);
	}
	context.closePath();
}

function renderText(text, x, y, fontSize, textAlign) {
	if ( fontSize ) {
		context.lineWidth = fontSize / 8;
		context.font = `${fontSize}px Ubuntu`;

		context.textAlign = textAlign
	}
	context.strokeStyle = "black";
	context.strokeText(text, x, y);

	context.fillStyle = "white";
	context.fillText(text, x, y);
}

function getNumberDisplay(x) {
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