import { getAsset } from './assets';
import { getCurrentState } from './state';
import { updateSlotsData } from './input';
const Constants = require('../shared/constants');

import * as mob from './render/entity/mob.js';
import * as drops from './render/entity/drops.js';
import * as background from './render/background.js';
import * as player from './render/entity/player.js';
import * as ui from './render/ui/ui.js';
import * as dfoe from './render/deathFadeOutEffect.js';
import * as leaderboard from './render/ui/leaderboard.js';
import * as effect from './render/effect.js';

let canvas = [0];
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

const PETAL_OUTLINE_WIDTH_PERCENTAGE = 0.05;

let primarySlotDisplayLength = 60, primarySlotHitboxLength = 92, primarySlotCenterY = 850;
let secondarySlotDisplayLength = 45, secondarySlotHitboxLength = 70, secondarySlotCenterY = 930;
let primarySlotCount = Constants.PRIMARY_SLOT_COUNT_BASE;
let secondarySlotCount = Constants.SECONDARY_SLOT_COUNT_BASE;
let selectedSize = 1.2;

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
	for (let i = 1; i <= layerCount; i ++ ) {
		ctx = getCtx(i);
		ctx.clearRect(0, 0, W, H);
	}
	primaryPetals = [];
	secondaryPetals = [];
	for (let i = 0; i < primarySlotCount; i ++ ) {
		primaryPetals.push(new Petal(W / 2 - primarySlotHitboxLength * hpx * (primarySlotCount / 2 - 0.5) + i * primarySlotHitboxLength * hpx, primarySlotCenterY * hpx, 'NONE'));
	}
	for (let i = 0; i < secondarySlotCount; i ++ ) {
		secondaryPetals.push(new Petal(W / 2 - secondarySlotHitboxLength * hpx * (secondarySlotCount / 2 - 0.5) + i * secondarySlotHitboxLength * hpx, secondarySlotCenterY * hpx, 'NONE'));
	}
}

export function renderStartup () {
	for (let i = 1; i <= layerCount; i ++ ) {
		let newCanvas = document.createElement('canvas');
		newCanvas.id = `canvas-${i}`;
		document.body.append(newCanvas);
		canvas.push(document.getElementById(`canvas-${i}`));
		canvas[i].classList.add('canvas');
		canvas[i].style['z-index'] = i;
	}
	
	setCanvasDimensions();
	for (let i = 1; i <= layerCount; i ++ ) {
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
}

window.addEventListener('resize', setCanvasDimensions);

function setCanvasDimensions() {
	let devicePixelRatio = window.devicePixelRatio || 1;
	W = window.innerWidth * devicePixelRatio;
	H = window.innerHeight * devicePixelRatio;
	wpx = W / 1000;
	hpx = H / 1000;
	for ( let i = 1; i <= layerCount; i ++ ) {
		canvas[i].width = W;
		canvas[i].height = H;
		canvas[i].style.width = window.innerWidth + `px`;
		canvas[i].style.height = window.innerHeight + `px`;
	}

	if ( primaryPetals[0] ) {
		for (let i = 0; i < primarySlotCount; i ++ ) {
			primaryPetals[i].defaultX = W / 2 - primarySlotHitboxLength * hpx * (primarySlotCount / 2 - 0.5) + i * primarySlotHitboxLength * hpx;
			primaryPetals[i].defaultY = primarySlotCenterY * hpx;
		}
		for (let i = 0; i < secondarySlotCount; i ++ ) {
			secondaryPetals[i].defaultX = W / 2 - secondarySlotHitboxLength * hpx * (secondarySlotCount / 2 - 0.5) + i * secondarySlotHitboxLength * hpx;
			secondaryPetals[i].defaultY = secondarySlotCenterY * hpx;
		}
	}
}

let animationFrameRequestId;

let lastUpdateTime = Date.now();
		
function renderGame() {
	const now = Date.now();
	const deltaT = (now - lastUpdateTime) / 1000;
	lastUpdateTime = now;
	
	for ( let i = 1; i <= layerCount; i ++ ) {
		ctx = getCtx(i);
		ctx.clearRect(0, 0, W, H);
	}
	
	// const { info, me, others, mobs, drops, leaderboard, playerCount, rankOnLeaderboard, lightningPath } = getCurrentState();
	const state = getCurrentState();
	
	updateSlotsData(W, hpx, primarySlotHitboxLength, primarySlotDisplayLength + 4 * primarySlotDisplayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE, primarySlotCenterY, primarySlotCount,
		secondarySlotHitboxLength, secondarySlotDisplayLength + 4 * secondarySlotDisplayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE, secondarySlotCenterY, secondarySlotCount);

	if ( state.me ) {
		background.renderBackground(state.me.x, state.me.y);
		player.renderPlayer(state.me, state.me);
		state.others.forEach(player.renderPlayer.bind(null, state.me));
		state.mobs.forEach(mob.renderMob.bind(null, state.me));
		drops.renderDrops(state.drops, state.me);
		effect.renderLightningPath(state.lightningPath, me);
		dfoe.renderDiedEntities(me);
		leaderboard.renderLeaderboard(leaderboard, playerCount, me, rankOnLeaderboard);
		ui.renderUI(me);
		renderInfo(info);
		renderWarning(me);
	}
	
	if ( gameRadiusOnEnter < hpx * 1800 ) {
		ctx = getCtx(menuLayer[0]);
		fillBackground("#1EA761");
		renderText(1, "floria.io", W / 2, H / 2 - hpx * 220, hpx * 85, 'center');
		renderText(1, "How to play", W / 2, H / 2 + hpx * 100, hpx * 30, 'center');
		renderText(1, "Use Mouse or [W] [S] [A] [D] to move", W / 2, H / 2 + hpx * 140, hpx * 15, 'center');
		renderText(1, "Left click or [Space] to attack", W / 2, H / 2 + hpx * 165, hpx * 15, 'center');
		renderText(1, "Right click or [LShift] to defend", W / 2, H / 2 + hpx * 190, hpx * 15, 'center');
		renderText(1, "Press [K] to toggle keyboard movement", W / 2, H / 2 + hpx * 215, hpx * 15, 'center');
		gameRadiusOnEnter += deltaGameRadiusOnEnter;
		deltaGameRadiusOnEnter *= 1.05;

		ctx = getCtx(menuLayer[0]);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.beginPath();
		ctx.arc(W / 2, H / 2, gameRadiusOnEnter, 0, 2 * Math.PI, false);
		ctx.closePath();
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fill();
		ctx.globalCompositeOperation = 'source-over';
		ctx.strokeStyle = 'rgb(0, 0, 0)';
		ctx.lineWidth = hpx * 5;
		ctx.stroke();
	}
	render(renderGame);
}

export function startRenderingMenu() { // render menu
	cancelAnimationFrame(animationFrameRequestId);
	document.getElementById("username-input").classList.remove('hidden');
	alphaConnecting = 1;
	alphaInputBox = 0.6;
	render(renderMainMenu);
}

function renderMainMenu() {
	menuLayer.forEach(layer => {
		ctx = getCtx(layer);
		ctx.clearRect(0, 0, W, H);
	});

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

	ctx = getCtx(menuLayer[0]);
	fillBackground("#1EA761");
	renderText(1, "floria.io", W / 2, H / 2 - hpx * 220, hpx * 85, 'center');
	renderText(1, "How to play", W / 2, H / 2 + hpx * 100, hpx * 30, 'center');
	renderText(1, "Use Mouse or [W] [S] [A] [D] to move", W / 2, H / 2 + hpx * 140, hpx * 15, 'center');
	renderText(1, "Left click or [Space] to attack", W / 2, H / 2 + hpx * 165, hpx * 15, 'center');
	renderText(1, "Right click or [LShift] to defend", W / 2, H / 2 + hpx * 190, hpx * 15, 'center');
	renderText(1, "Press [K] to toggle keyboard movement", W / 2, H / 2 + hpx * 215, hpx * 15, 'center');
	
	if ( textConnectingPos >= -1000 ) { // connecting... text animation
		if ( connected ) {
			textConnectingVelocity += 5;
			textConnectingPos -= textConnectingVelocity;
		}
		ctx = getCtx(menuLayer[1]);
		renderText(alphaConnecting, "Connecting...", W / 2, H / 2 + hpx * textConnectingPos, hpx * 50, 'center');
	}

	if ( connected ) { // handle input box animation
		inputBoxVelocity *= 0.9;
		if ( inputBoxVelocity <= 0.5 ) {
			inputBoxVelocity = 0;
		}
		inputBoxPos -= inputBoxVelocity;
		inputBoxPos = Math.max(0, inputBoxPos);
		renderInputBox(menuLayer[2], alphaInputBox);
	}

	if ( startup ) {
		ctx = getCtx(menuLayer[3]);
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

function renderInputBox(layer, alpha) {
	ctx = getCtx(layer);
	ctx.globalAlpha = alpha;
	let textOffset = -45;
	let textFontSize = 20;
	renderText(alpha, "This pretty little flower is called...", W / 2, H / 2 + hpx * (textOffset - inputBoxPos), hpx * textFontSize, 'center');

	let inputBox = document.getElementById("username-input");
	inputBox.style['z-index'] = layer;
	inputBox.style['top'] = `${(H / 2 - hpx * inputBoxPos - hpx * 10) / H * window.innerHeight}px`;
	inputBox.style['outline-color'] = `rgba(0, 0, 0, ${alpha})`;
	inputBox.style['backgroundColor'] = `rgba(238, 238, 238, ${alpha})`;
	inputBox.focus();

	textOffset = 32;
	textFontSize = 13;
	renderText(alpha, "(press [Enter] to spawn)", W / 2, H / 2 + hpx * (textOffset - inputBoxPos), hpx * textFontSize, 'center');
}

export function renderConnected() { // called when connected to server
	connected = true;
}

function render(renderFunction) {
	animationFrameRequestId = requestAnimationFrame(renderFunction);
}

function getCtx(layer) {
	return canvas[layer].getContext('2d');
}