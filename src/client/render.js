import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, MAP_WIDTH, MAP_HEIGHT, RATED_WIDTH, RATED_HEIGHT, PLAYER_MAX_HP} = Constants;

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
	const { me, others } = getCurrentState();
	if ( me ) {
		renderBackground(me.x, me.y);
		renderPlayer(me, me);
		others.forEach(renderPlayer.bind(null, me));
	}
	animationFrameRequestId = requestAnimationFrame(renderGame);
}

function renderBackground(x, y) {
	context.fillStyle = "#1C9A59";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "#1EA761";
	context.fillRect(canvas.width / 2 - x, canvas.height / 2 - y, MAP_WIDTH, MAP_HEIGHT);

	const gridInterval = 45;

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

	context.save();

	context.textAlign = "start"

	context.lineWidth = 30 / 8;
	context.font = "30px Ubuntu";

	context.strokeStyle = "black";
	context.strokeText("florr.cn", 20, 40);

	context.fillStyle = "rgb(221, 239, 230)";
	context.fillText("florr.cn", 20, 40);

	context.restore();
}

function renderPlayer(me, player) {
	const { x, y } = player;
	const canvasX = canvas.width / 2 + x - me.x;
	const canvasY = canvas.height / 2 + y - me.y;

	context.save();

	context.translate(canvasX, canvasY);
	const renderRadius = PLAYER_RADIUS + 2;
	context.drawImage(
		getAsset('player.svg'),
		- renderRadius,
		- renderRadius,
		renderRadius * 2,
		renderRadius * 2,
	);

	context.lineWidth = 20 / 8;
	context.font = "20px Ubuntu";

	context.textAlign = "center"

	context.strokeStyle = "black";
	context.strokeText(player.username, 0, -35);

	context.fillStyle = "white";
	context.fillText(player.username, 0, -35);

	context.strokeStyle = "black";
	context.strokeText(Math.floor(Math.sqrt((player.x - me.x) * (player.x - me.x) + (player.y - me.y) * (player.y - me.y))), 0, -60);

	context.fillStyle = "white";
	context.fillText(Math.floor(Math.sqrt((player.x - me.x) * (player.x - me.x) + (player.y - me.y) * (player.y - me.y))), 0, -60);

	context.strokeStyle = "black";
	context.strokeText(`(${Math.floor(me.x)} , ${Math.floor(me.y)})`, 0, -85);

	context.fillStyle = "white";
	context.fillText(`(${Math.floor(me.x)} , ${Math.floor(me.y)})`, 0, -85);

	const healthBarBaseWidth = 10;
	const healthBarBaseStyle = 'rgb(51, 51, 51)';
	const healthBarBaseLength = PLAYER_RADIUS * 2 + 20;

	const healthBarOutline = 3;
	const healthBarWidth = healthBarBaseWidth - healthBarOutline;
	const healthBarStyleNormal = 'rgb(117, 221, 52)';
	const healthBarStyleHurt = 'rgb(221, 52, 52)';
	const healthBarLength = healthBarBaseLength * player.hp / PLAYER_MAX_HP;

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