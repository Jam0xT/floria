import { getAsset } from './assets';
import { getCurrentState } from './state';
import { startCapturingInput, updateSlotsData, isKeyboardMovement } from './input';
const Constants = require('../shared/constants');
const { MAP_WIDTH, MAP_HEIGHT, RATED_WIDTH, RATED_HEIGHT } = Constants;
const EntityAttributes = require('../../public/entity_attributes');
const PetalAttributes = require('../../public/petal_attributes');

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

const layerCount = 15;

let backgroundLayer = [1],
	dropLayer = [2],
	petalLayer = [3, 4],
	mobLayer = [5],
	playerLayer = [6],
	effectLayer = [7],
	shadeLayer = [8],
	UILayer = [9],
	menuLayer = [10, 11, 12, 13];

let primarySlotDisplayLength = 60, primarySlotHitboxLength = 92, primarySlotCenterY = 850;
let secondarySlotDisplayLength = 45, secondarySlotHitboxLength = 70, secondarySlotCenterY = 930;
let primarySlotCount = Constants.PRIMARY_SLOT_COUNT_BASE;
let secondarySlotCount = Constants.SECONDARY_SLOT_COUNT_BASE;
let selectedSize = 1.2;

// let initPetals = false;

let petalSwing = Math.PI * 0.03;

let cmdLog = [];
let cmdMaxLineCnt = 30;
let cmdColor = 'cyan';
let debugOptions =
	[
		false, // show hitbox
		false, // show hp
	];

export function addCmdLog(log) {
	cmdLog.push(log);
}

let lightningPaths = [];
let diedEntities = [];

let time = 0; //页面运行的时间

export function toggleKeyboardMovement(isKeyboardMovement) {
	keyboardMovement = isKeyboardMovement;
}

class Petal { // the petal item which you can operate on
	constructor(x, y, type) {
		this.x = x;
		this.y = y;
		this.dir = 0;
		this.swing = false;
		this.size = 1;
		this.targetX = x;
		this.targetY = y;
		this.defaultX = x;
		this.defaultY = y;
		this.targetSize = 1;
		this.type = type;
		this.animating = false;
	}

	setTargetPos(x, y) {
		this.targetX = x;
		this.targetY = y;
	}

	setTargetSize(size) {
		this.targetSize = size;
	}
	
	setType(type) {
		this.type = type;
	}

	render(length) {
		if ( this.type != 'NONE' ) {
			const followSpeed = 0.2;

			this.x += (this.targetX - this.x) * followSpeed;
			if ( Math.abs(this.targetX - this.x) < 0.5 ) {
				this.x = this.targetX;
			}

			this.y += (this.targetY - this.y) * followSpeed;
			if ( Math.abs(this.targetY - this.y) < 0.5 ) {
				this.y = this.targetY;
			}
			
			if ( this.animating ) {
				if ( this.x == this.targetX && this.x == this.defaultX && this.y == this.targetY && this.y == this.defaultY && (!this.swing) && this.dir == 0 ){
					this.animating = false;
				}
			}

			this.size += (this.targetSize - this.size) * 0.3;
			if ( Math.abs(this.targetSize - this.size) < 0.02 ) {
				this.size = this.targetSize;
			}

			if ( this.swing ) {
				if ( petalSwing > this.dir ) {
					this.dir += Math.min(0.015, Math.min(petalSwing - this.dir, this.dir + petalSwing) * 0.25);
				} else {
					this.dir += Math.max(-0.015, Math.max(petalSwing - this.dir, this.dir + petalSwing) * 0.25);

				}
				if ( Math.abs(petalSwing - this.dir) < 0.01) {
					petalSwing = -petalSwing;
				}
			} else {
				this.dir -= this.dir * 0.1;
				if ( Math.abs(this.dir) < 0.001 ) {
					this.dir = 0;
				}
			}
			
			let petalAlpha = 0.88;
			ctx.translate(this.x, this.y);
			ctx.rotate(this.dir);
			ctx.globalAlpha = petalAlpha;
			let displayLength = length * this.size;
			let outlineWidth = displayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE;
			renderRoundRect(- displayLength / 2 - outlineWidth, - displayLength / 2 - outlineWidth, 
			displayLength + outlineWidth * 2, displayLength + outlineWidth * 2, hpx * 1, true, true, true, true);
			ctx.strokeStyle = Constants.RARITY_COLOR_DARKEN[PetalAttributes[this.type].RARITY];
			ctx.lineWidth = outlineWidth * 2;
			
			if (this.type == `EMPTY`) {
				ctx.globalAlpha = 0;
				petalAlpha = 0;
			};

			ctx.globalCompositeOperation = 'destination-out';
			ctx.stroke();

			ctx.globalCompositeOperation = 'source-over';
			ctx.stroke();

			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillRect(- displayLength / 2, - displayLength / 2, displayLength, displayLength);

			ctx.globalCompositeOperation = 'source-over';
			ctx.fillStyle = Constants.RARITY_COLOR[PetalAttributes[this.type].RARITY];
			ctx.fillRect(- displayLength / 2, - displayLength / 2, displayLength, displayLength);
			
			ctx.globalCompositeOperation = 'destination-out';
			
			const renderRadius = displayLength * 0.2;
			const asset = getAsset(`petals/${this.type.toLowerCase()}.svg`);
			const width = asset.naturalWidth, height = asset.naturalHeight;
			const offset = displayLength * 0.08;
			
			let offsetX = 0,
				offsetY = 0;
			if (PetalAttributes[this.type].MULTIPLE) {
				let baseAngle = Math.PI / 2;
				for (let i = 0; i < PetalAttributes[this.type].COUNT; i++) {
					offsetX = (renderRadius + 1) * Math.sin(baseAngle + i / PetalAttributes[this.type].COUNT * 2 * Math.PI);
					offsetY = (renderRadius + 1) * Math.cos(baseAngle + i / PetalAttributes[this.type].COUNT * 2 * Math.PI);
					
					if ( width <= height ) {
						ctx.drawImage(
							asset,
							- renderRadius + offsetX,
							- renderRadius / width * height - offset + offsetY,
							renderRadius * 2,
							renderRadius / width * height * 2,
						);
						
						ctx.globalCompositeOperation = 'source-over';
						ctx.drawImage(
							asset,
							- renderRadius + offsetX,
							- renderRadius / width * height - offset + offsetY,
							renderRadius * 2,
							renderRadius / width * height * 2,
						);
					} else {
						ctx.drawImage(
							asset,
							- renderRadius / height * width + offsetX,
							- renderRadius - offset + offsetY,
							renderRadius / height * width * 2,
							renderRadius * 2,
						);
					
						ctx.globalCompositeOperation = 'source-over';
						ctx.drawImage(
							asset,
							- renderRadius / height * width + offsetX,
							- renderRadius - offset + offsetY,
							renderRadius / height * width * 2,
							renderRadius * 2,
						);
					}
				}
			} else {
				if ( width <= height ) {
					ctx.drawImage(
						asset,
						- renderRadius + offsetX,
						- renderRadius / width * height - offset + offsetY,
						renderRadius * 2,
						renderRadius / width * height * 2,
					);
						
					ctx.globalCompositeOperation = 'source-over';
					ctx.drawImage(
						asset,
						- renderRadius + offsetX,
						- renderRadius / width * height - offset + offsetY,
						renderRadius * 2,
						renderRadius / width * height * 2,
					);
				} else {
					ctx.drawImage(
						asset,
						- renderRadius / height * width + offsetX,
						- renderRadius - offset + offsetY,
						renderRadius / height * width * 2,
						renderRadius * 2,
					);
					
					ctx.globalCompositeOperation = 'source-over';
					ctx.drawImage(
						asset,
						- renderRadius / height * width + offsetX,
						- renderRadius - offset + offsetY,
						renderRadius / height * width * 2,
						renderRadius * 2,
					);
				}
			}
			
			let name = this.type.toLowerCase();
			let textOffset = displayLength * 0.35;
			let textFont = displayLength * 0.25;
			
			ctx.globalCompositeOperation = 'destination-out';
			renderText(petalAlpha, name.charAt(0).toUpperCase() + name.slice(1), 0, textOffset, textFont, 'center');

			ctx.globalCompositeOperation = 'source-over';
			renderText(petalAlpha, name.charAt(0).toUpperCase() + name.slice(1), 0, textOffset, textFont, 'center');

			ctx.rotate(-this.dir);
			ctx.translate(-this.x, -this.y);
			ctx.globalAlpha = 1;
		}
	}
}

let primaryPetals = [];
let secondaryPetals = [];

export function select(isPrimary, slot, x, y) {
	let petal;
	if ( isPrimary ) {
		petal = primaryPetals[slot];
	} else {
		petal = secondaryPetals[slot];
	}
	petal.animating = true;
	petal.swing = true;
	petal.setTargetPos(x, y);
	petal.setTargetSize(selectedSize);
}

export function deSelect(isPrimary, slot) {
	let petal;
	let slotHitboxLength, slotCount, slotCenterY;

	if ( isPrimary ) {
		petal = primaryPetals[slot];
		slotHitboxLength = primarySlotHitboxLength;
		slotCount = primarySlotCount;
		slotCenterY = primarySlotCenterY;
	} else {
		petal = secondaryPetals[slot];
		slotHitboxLength = secondarySlotHitboxLength;
		slotCount = secondarySlotCount;
		slotCenterY = secondarySlotCenterY;
	}

	petal.swing = false;
	petal.setTargetPos(W / 2 - slotHitboxLength * hpx * (slotCount / 2 - 0.5) + slot * slotHitboxLength * hpx, slotCenterY * hpx);
	petal.setTargetSize(1);
}

export function target(isPrimary, slot, targetIsPrimary, targetSlot) {
	let petal;
	let slotHitboxLength, slotCount, slotCenterY;
	let defaultSize, targetSize;

	if ( isPrimary ) {
		petal = primaryPetals[slot];
		defaultSize = primarySlotDisplayLength;
	} else {
		petal = secondaryPetals[slot];
		defaultSize = secondarySlotDisplayLength;
	}

	if ( targetIsPrimary ) {
		slotHitboxLength = primarySlotHitboxLength;
		slotCount = primarySlotCount;
		slotCenterY = primarySlotCenterY;
		targetSize = primarySlotDisplayLength;
	} else {
		slotHitboxLength = secondarySlotHitboxLength;
		slotCount = secondarySlotCount;
		slotCenterY = secondarySlotCenterY;
		targetSize = secondarySlotDisplayLength;
	}

	petal.swing = false;
	petal.setTargetPos(W / 2 - slotHitboxLength * hpx * (slotCount / 2 - 0.5) + targetSlot * slotHitboxLength * hpx, slotCenterY * hpx);
	petal.setTargetSize(targetSize / defaultSize);
}

export function drag(isPrimary, slot, x, y) {
	let petal;
	if ( isPrimary ) {
		petal = primaryPetals[slot];
	} else {
		petal = secondaryPetals[slot];
	}
	petal.setTargetPos(x, y);
	if ( !petal.swing ) {
		petal.swing = true;
		petal.setTargetSize(selectedSize);
	}
}

export function switchPetals(isPrimary, slot, targetIsPrimary, targetSlot) {

	let petalA, petalB;

	if ( isPrimary ) {
		petalA = primaryPetals[slot];
	} else {
		petalA = secondaryPetals[slot];
	}
	
	if ( targetIsPrimary ) {
		petalB = primaryPetals[targetSlot];
	} else {
		petalB = secondaryPetals[targetSlot];
	}

	petalA.animating = true;
	petalB.animating = true;

	petalA.swing = false;
	petalB.swing = false;
	
	petalA.setTargetPos(petalA.defaultX, petalA.defaultY);
	petalB.setTargetPos(petalB.defaultX, petalB.defaultY);

	petalA.targetSize = 1;
	petalB.targetSize = 1;

	let tmp = petalA.type;
	petalA.type = petalB.type;
	petalB.type = tmp;

	tmp = petalA.x;
	petalA.x = petalB.x;
	petalB.x = tmp;
	tmp = petalA.y;
	petalA.y = petalB.y;
	petalB.y = tmp;
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

export function renderInit() {
	// initPetals = false;
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

window.addEventListener('resize', setCanvasDimensions);

let animationFrameRequestId;

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

let lastUpdateTime = Date.now();
		
function renderGame() {
	const now = Date.now();
	const deltaT = (now - lastUpdateTime) / 1000;
	lastUpdateTime = now;
	time += deltaT;
	
	for ( let i = 1; i <= layerCount; i ++ ) {
		ctx = getCtx(i);
		ctx.clearRect(0, 0, W, H);
	}
	
	const { info, me, others, mobs, drops, leaderboard, playerCount, rankOnLeaderboard, lightningPath } = getCurrentState();
	
	updateSlotsData(W, hpx, primarySlotHitboxLength, primarySlotDisplayLength + 4 * primarySlotDisplayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE, primarySlotCenterY, primarySlotCount,
		secondarySlotHitboxLength, secondarySlotDisplayLength + 4 * secondarySlotDisplayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE, secondarySlotCenterY, secondarySlotCount);

	if ( me ) {
		renderBackground(me.x, me.y);
		renderPlayer(me, me);
		others.forEach(renderPlayer.bind(null, me));
		mobs.forEach(mob => {
			const mobDecorates = EntityAttributes[mob.type].DECORATES;
			const renderArray = [];
			const layerArray = [];
			if (mobDecorates) {
				renderArray.push(mob);
				layerArray.push(0)
				Object.values(mobDecorates).forEach((decorate) => {
					renderArray.push(decorate);
					layerArray.push(decorate.LAYER);
				})
				const indexArray = layerArray.sortIndex();
				for (let i = 0; i < renderArray.length; i++) {
					const entityLayer = layerArray[indexArray[i]];
					const entity = renderArray[indexArray[i]]
					if (entityLayer == 0) {
						renderMob(me, entity)
					} else {
						renderDecorate(me, entity, mob);
					}
				}
			} else {
				renderMob(me, mob);
			}
		});
		renderDrops(drops, me);
		renderLightningPath(lightningPath, me);
		renderDiedEntities(me);
		renderLeaderboard(leaderboard, playerCount, me, rankOnLeaderboard);
		renderUI(me);
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

let expBarLength = 0;

function renderUI(me) {
	ctx = getCtx(UILayer);

	renderExpBar(me); // exp bar

	if ( !isKeyboardMovement() ) { // render movement helper
		renderMovementHelper();
	}

	renderSlots(me); // slots

	renderCmdLog();
}

function renderExpBar(me) {
	const expBarYPos = hpx * 900;
	const expBarBaseLength = hpx * 300;
	const expBarBaseWidth = hpx * 45;
	const expBarBaseStyle = 'rgba(51, 51, 51, 0.85)';
	const expBarExpectedLength = expBarBaseLength * me.exp / me.currentExpForLevel;
	expBarLength += (expBarExpectedLength - expBarLength) * 0.3;
	if ( Math.abs(expBarExpectedLength - expBarLength) <= 1 ) {
		expBarLength = expBarExpectedLength;
	}
	const expBarWidth = expBarBaseWidth - hpx * 5;
	const expBarStyle = 'rgba(255, 255, 110, 0.95)'
	
	ctx.beginPath();
	ctx.moveTo(0, expBarYPos);
	ctx.lineTo(expBarBaseLength, expBarYPos);
	ctx.lineWidth = expBarBaseWidth;
	ctx.strokeStyle = expBarBaseStyle;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	ctx.globalCompositeOperation = 'desitination-out';
	ctx.beginPath();
	ctx.moveTo(0, expBarYPos);
	ctx.lineTo(expBarLength, expBarYPos);
	ctx.lineWidth = expBarWidth;
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.moveTo(0, expBarYPos);
	ctx.lineTo(expBarLength, expBarYPos);
	ctx.lineWidth = expBarWidth;
	ctx.strokeStyle = expBarStyle;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	ctx.globalCompositeOperation = 'source-over';

	ctx.globalAlpha = 1;
	renderText(1, `Lvl ${Math.floor(me.level)} flower`, hpx * 100, expBarYPos + hpx * 5, hpx * 18, 'left');
	renderText(0.9, me.username, hpx * 150, expBarYPos - hpx * 40, hpx * 30, 'center');
}

function renderMovementHelper() {
	// ...
}

function renderSlots(me) {
	// primary slots
	if ( me.petalSync ) {
		if ( primarySlotCount < me.primaryPetals.length ) {
			primarySlotCount = me.primaryPetals.length;
		}
		while ( primaryPetals.length < me.primaryPetals.length ) {
			let p = new Petal(0, 0, me.primaryPetals[primaryPetals.length].type);
			primaryPetals.push(p);
		}
	}

	let slotCount = primarySlotCount;
	let slotDisplayLength = primarySlotDisplayLength * hpx;
	let slotHitboxLength = primarySlotHitboxLength * hpx;
	let centerY = primarySlotCenterY * hpx;
	let petalOutlineWidth = slotDisplayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE;
	for (let i = 0; i < slotCount; i ++ ) {
		let centerX = W / 2 - slotHitboxLength * (slotCount / 2 - 0.5) + i * slotHitboxLength;
		renderRoundRect(centerX - slotDisplayLength / 2 - petalOutlineWidth, centerY - slotDisplayLength / 2 - petalOutlineWidth, 
			slotDisplayLength + petalOutlineWidth * 2, slotDisplayLength + petalOutlineWidth * 2, hpx * 1, true, true, true, true);
		ctx.strokeStyle = 'rgba(207, 207, 207, 0.7)';
		ctx.lineWidth = petalOutlineWidth * 2;
		ctx.stroke();

		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillRect(centerX - slotDisplayLength / 2, centerY - slotDisplayLength / 2, slotDisplayLength, slotDisplayLength);

		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
		ctx.fillRect(centerX - slotDisplayLength / 2, centerY - slotDisplayLength / 2, slotDisplayLength, slotDisplayLength);
	}

	// secondary slots

	if ( me.petalSync ) {
		if ( secondarySlotCount < me.secondaryPetals.length ) {
			secondarySlotCount = me.secondaryPetals.length;
		}
		while ( secondaryPetals.length < me.secondaryPetals.length ) {
			let p = new Petal(0, 0, me.secondaryPetals[secondaryPetals.length].type);
			secondaryPetals.push(p);
		}
	}

	slotCount = secondarySlotCount;
	slotDisplayLength = secondarySlotDisplayLength * hpx;
	slotHitboxLength = secondarySlotHitboxLength * hpx;
	centerY = secondarySlotCenterY * hpx;
	petalOutlineWidth = slotDisplayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE;
	for (let i = 0; i < slotCount; i ++ ) {
		let centerX = W / 2 - slotHitboxLength * (slotCount / 2 - 0.5) + i * slotHitboxLength;
		renderRoundRect(centerX - slotDisplayLength / 2 - petalOutlineWidth, centerY - slotDisplayLength / 2 - petalOutlineWidth, 
			slotDisplayLength + petalOutlineWidth * 2, slotDisplayLength + petalOutlineWidth * 2, hpx * 1, true, true, true, true);
		ctx.strokeStyle = 'rgba(207, 207, 207, 0.7)';
		ctx.lineWidth = petalOutlineWidth * 2;
		ctx.stroke();

		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillRect(centerX - slotDisplayLength / 2, centerY - slotDisplayLength / 2, slotDisplayLength, slotDisplayLength);

		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
		ctx.fillRect(centerX - slotDisplayLength / 2, centerY - slotDisplayLength / 2, slotDisplayLength, slotDisplayLength);
	}

	// primary

	slotCount = primarySlotCount;
	slotDisplayLength = primarySlotDisplayLength * hpx;
	slotHitboxLength = primarySlotHitboxLength * hpx;
	centerY = primarySlotCenterY * hpx;
	for (let i = 0; i < slotCount; i ++ ) {
		let centerX = W / 2 - slotHitboxLength * (slotCount / 2 - 0.5) + i * slotHitboxLength;
		if ( !primaryPetals[i].animating ) {
			primaryPetals[i].setTargetPos(centerX, centerY);
			primaryPetals[i].setTargetSize(1);
			if ( me.petalSync ) {
				primaryPetals[i].setType(me.primaryPetals[i]);
			}
			primaryPetals[i].render(slotDisplayLength);
		}
	}

	for (let i = 0; i < slotCount; i ++ ) {
		if ( primaryPetals[i].animating ) {
			primaryPetals[i].render(slotDisplayLength);
		}
	}

	// secondary

	slotCount = secondarySlotCount;
	slotDisplayLength = secondarySlotDisplayLength * hpx;
	slotHitboxLength = secondarySlotHitboxLength * hpx;
	centerY = secondarySlotCenterY * hpx;
	for (let i = 0; i < slotCount; i ++ ) {
		let centerX = W / 2 - slotHitboxLength * (slotCount / 2 - 0.5) + i * slotHitboxLength;
		if ( !secondaryPetals[i].animating ) {
			secondaryPetals[i].setTargetPos(centerX, centerY);
			secondaryPetals[i].setTargetSize(1);
			if ( me.petalSync )
				secondaryPetals[i].setType(me.secondaryPetals[i]);
			secondaryPetals[i].render(slotDisplayLength);
		}
	}
	for (let i = 0; i < slotCount; i ++ ) {
		if ( secondaryPetals[i].animating ) {
			secondaryPetals[i].render(slotDisplayLength);
		}
	}
}

function renderCmdLog() {
	let len = cmdLog.length;
	let rightAlign = 990 * wpx;
	let fontSize = 15 * hpx;
	let spaceBetween = 5 * hpx;
	let alpha = 0.9;

	ctx.lineWidth = fontSize * 0.125;
	ctx.font = `${fontSize}px Ubuntu`;
	ctx.textAlign = "right";
	ctx.globalAlpha = alpha;

	for (let i = len - 1; i >= Math.max(0, len - cmdMaxLineCnt); i -- ) {
		// ctx.strokeText(cmdLog[i], rightAlign, (900 - (len - i) * (spaceBetween + fontSize)) * hpx, fontSize);
		let text = cmdLog[i];
		let x = rightAlign;
		let y = (900 * hpx - (len - i) * (spaceBetween + fontSize));
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = cmdColor;
		ctx.fillText(text, x, y);
	}
	ctx.globalAlpha = 1;
}

function renderInfo(info) {
	ctx = getCtx(UILayer[0]);
	renderText(0.7, "floria.io", hpx * 85, hpx * 45, hpx * 40, 'center');
	renderText(1, `MSPT: ${info.mspt}`, W - hpx * 10, H - hpx * 15, hpx * 10, 'right');
	renderText(1, `Mob Count: ${info.mobCount}`, W - hpx * 10, H - hpx * 30, hpx * 10, 'right');
	renderText(1, `Mob Volume Taken: ${info.mobVol}`, W - hpx * 10, H - hpx * 45, hpx * 10, 'right');
}

function renderBackground(x, y) {
	ctx = getCtx(backgroundLayer[0]);
	
	const gridInterval = hpx * 50;
	
	const startX = ( W / 2 - x * hpx ) % gridInterval;
	const startY = ( H / 2 - y * hpx ) % gridInterval;
	
	const gridLineWidth = hpx * 0.5;

	Object.values(Constants.MAP_AREAS).forEach((attribute, count, maps) => {
		if (count == 0) {
			ctx.fillStyle = attribute.BACKGROUND_COLOR_DARKEN;
			ctx.fillRect(0, 0, W, H);
		} else if (count == maps.length - 1) {
			ctx.fillStyle = attribute.BACKGROUND_COLOR_DARKEN;
			ctx.fillRect(W / 2 - x * hpx + attribute.START_WIDTH * hpx, 0, W * 5, H);
		} else {
			ctx.fillStyle = attribute.BACKGROUND_COLOR_DARKEN;
			ctx.fillRect(W / 2 - x * hpx + attribute.START_WIDTH * hpx, 0, attribute.WIDTH * hpx, H);
		}
		ctx.fillStyle = attribute.BACKGROUND_COLOR;
		ctx.fillRect(W / 2 - x * hpx + attribute.START_WIDTH * hpx, H / 2 - y * hpx, attribute.WIDTH * hpx, attribute.HEIGHT * hpx);
	})

	const gridLineStyle = `rgba(0, 0, 0, 0.3)`;
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
	ctx = getCtx(playerLayer[0]);
	const { x, y } = player;
	let playerAsset;
	if ( player.username == "Pop!") {
		playerAsset = getAsset('mobs/bubble.svg');
	} else {
		playerAsset = getAsset('player.svg');
	}
	const canvasX = W / 2 + (x - me.x) * hpx;
	const canvasY = H / 2 + (y - me.y) * hpx;
	const renderRadius = player.size * hpx;
	ctx.translate(canvasX, canvasY);

	ctx.drawImage(
		playerAsset,
		- renderRadius,
		- renderRadius,
		renderRadius * 2,
		renderRadius * 2,
	);
	
	const hitboxRadius = player.radius * hpx;

	if ( debugOptions[0] ) {
		renderHitbox(hitboxRadius);
	}
	
	if ( debugOptions[1] ) {
		renderText(1, `hp:${player.hp.toFixed(1)}`, 0, hpx * 25, hpx * 18, 'center');
	}

	if ( debugOptions[2] ) {
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(hitboxRadius * Math.sin(player.dir), -hitboxRadius * Math.cos(player.dir));
		ctx.closePath();
		ctx.strokeStyle = '#fc0f5e';
		ctx.lineWidth = hpx * 1;
		ctx.stroke();
	}

	ctx.translate(-canvasX, -canvasY);

	ctx = getCtx(backgroundLayer[0]);

	// render username
	renderText(1, player.username, canvasX, canvasY - hpx * 35, hpx * 20, 'center');

	// render health bar
	const healthBarBaseWidth = hpx * 10;
	const healthBarBaseStyle = 'rgb(51, 51, 51)';
	const healthBarBaseLength = renderRadius * 2 + hpx * 20;

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
	ctx = getCtx(petalLayer[0]);

	player.petals.forEach(petal => {
		if (petal.isHide) return;
		
		const renderRadius = petal.size * hpx;
		const asset = getAsset(`petals/${petal.type.toLowerCase()}.svg`);
		const width = asset.naturalWidth, height = asset.naturalHeight;

		ctx.translate(canvasX + (petal.x - player.x) * hpx, canvasY + (petal.y - player.y) * hpx);
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
		ctx.translate(-(canvasX + (petal.x - player.x) * hpx), -(canvasY + (petal.y - player.y) * hpx));
		ctx = getCtx(petalLayer[1]);
		ctx.translate(canvasX + (petal.x - player.x) * hpx, canvasY + (petal.y - player.y) * hpx);

		const petalHitboxRadius = petal.radius * hpx;

		if ( debugOptions[0] ) {
			renderHitbox(petalHitboxRadius);
		}

		if ( debugOptions[1] ) {
			renderText(1, `hp:${petal.hp.toFixed(1)}`, 0, hpx * 25, hpx * 18, 'center');
		}

		if ( debugOptions[2] ) {
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(petalHitboxRadius * Math.sin(petal.dir), -petalHitboxRadius * Math.cos(petal.dir));
			ctx.closePath();
			ctx.strokeStyle = '#fc0f5e';
			ctx.lineWidth = hpx * 1;
			ctx.stroke();
		}

		ctx.translate(-(canvasX + (petal.x - player.x) * hpx), -(canvasY + (petal.y - player.y) * hpx));
		ctx = getCtx(petalLayer[0]);
	});
}

function renderMob(me, mob) {
	ctx = getCtx(mobLayer[0]);
	ctx.globalAlpha = 1;
	const {x, y} = mob;
	const canvasX = W / 2 + (x - me.x) * hpx;
	const canvasY = H / 2 + (y - me.y) * hpx;
	ctx.translate(canvasX, canvasY);
	const renderRadius = mob.size * hpx;
	const asset = getAsset(`mobs/${mob.type.toLowerCase()}.svg`);
	const width = asset.naturalWidth, height = asset.naturalHeight;
	if ( mob.type == "CENTIPEDE" || mob.type == "CENTIPEDE_EVIL") {
		let offset = 0.24;
		ctx.rotate(mob.dir);
		ctx.translate(0, renderRadius * -offset);
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
		ctx.translate(0, -renderRadius * -offset);
		ctx.rotate(-mob.dir);
	} else {
		ctx.rotate(mob.dir);
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
		ctx.rotate(-mob.dir);
	}

	const hitboxRadius = mob.radius * hpx;
	
	if ( debugOptions[0] ) {
		renderHitbox(hitboxRadius);
	}

	if ( debugOptions[1] ) {
		renderText(1, `hp:${mob.hp.toFixed(1)}`, 0, hpx * 25, hpx * 18, 'center');
	}

	if ( debugOptions[2] ) {
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(hitboxRadius * Math.sin(mob.dir), -hitboxRadius * Math.cos(mob.dir));
		ctx.closePath();
		ctx.strokeStyle = '#fc0f5e';
		ctx.lineWidth = hpx * 1;
		ctx.stroke();
	}

	ctx.translate(-canvasX, -canvasY);
}

function renderDecorate(me, decorate, mob) { // 大粪，有待重写
	const ctx = getCtx(mobLayer);
	ctx.globalAlpha = 1;
	const canvasX = W / 2 + (mob.x - me.x) * hpx;
	const canvasY = H / 2 + (mob.y - me.y) * hpx;
	const renderRadius = decorate.RENDER_RADIUS * hpx;
	const asset = getAsset(`decorates/${decorate.TYPE.toLowerCase()}.svg`);
	const width = asset.naturalWidth, height = asset.naturalHeight;
	const animation = decorate.ANIMATION;
	let offsetX = 0, offsetY = 0, offsetRotate = 0;
	if (animation) {
		if (animation.ROTATE) {
			//const rotation = animation.ROTATE;
			//offsetX = rotation.X;
			//offsetY = rotation.Y;
			//offsetRotate = getNumberInRangeByTime([rotation.MIN, rotation.MAX], rotation.SPEED, true);
		}
	}
	ctx.save();
	ctx.translate(canvasX + offsetX, canvasY + offsetY);
	ctx.rotate(decorate.DIRECTION + mob.dir + offsetRotate);
	if ( width <= height ) {
		ctx.drawImage(
			asset,
			- renderRadius + decorate.X - offsetX,
			- renderRadius / width * height + decorate.Y - offsetY,
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
	
	ctx.restore();
}

function renderLeaderboardRank(rank, leaderboardRankBaseLength, leaderboardRankOutlineWidth, leaderboardRankBaseWidth, rankTopScore,
	leaderboardHeadHeight, leaderboardHeightPerPlayer, rankOnLeaderboard, leaderboardRank, baseX, baseY) { // render the current rank on leaderboard

	ctx = getCtx(UILayer[0]);

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

	renderText(1, leaderboardDisplay, baseX + hpx * 0, baseY + hpx * 5, hpx * 15, 'center');
}

function renderLeaderboard(leaderboard, playerCount, me, rankOnLeaderboard) {
	ctx = getCtx(UILayer[0]);
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
	
	renderRoundRect(position.x, position.y, leaderboardWidth, leaderboardHeight, leaderboardRoundCornerRadius, true, true, true, true);
	ctx.lineWidth = leaderboardOutlineWidth;
	ctx.strokeStyle = "rgb(69, 69, 69)";
	ctx.stroke();

	ctx.fillStyle = "rgb(85, 187, 85)";
	ctx.fillRect(position.x + leaderboardOutlineWidth / 2, position.y + leaderboardOutlineWidth / 2, 
	leaderboardWidth - leaderboardOutlineWidth / 2, leaderboardHeadHeight - leaderboardOutlineWidth / 2);
	
	renderRoundRect(position.x, position.y, leaderboardWidth, leaderboardHeadHeight, leaderboardRoundCornerRadius, true, true, false, false);
	ctx.lineWidth = leaderboardOutlineWidth;
	ctx.strokeStyle = "rgb(69, 151, 69)";
	ctx.stroke();

	var baseX = position.x + leaderboardWidth / 2;
	var baseY = position.y;

	if ( playerCount > 1 ) {
		renderText(1, `${playerCount} Flowers`, baseX + hpx * 0, baseY + leaderboardHeadHeight / 2 + leaderboardOutlineWidth, hpx * 18, 'center');
	} else {
		renderText(1, '1 Flower', baseX + hpx * 0, baseY + leaderboardHeadHeight / 2 + leaderboardOutlineWidth, hpx * 18, 'center');
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

function renderGameEnter() {
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

function fillBackground(fillStyle) {
	ctx.fillStyle = fillStyle;
	ctx.fillRect(0, 0, W, H);
}

function renderRoundRect(x, y, w, h, r, r4, r1, r2, r3) { // r1 -> r4 clockwise, r4: top left | NOTE: path ONLY, no STROKE
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

function renderText(alpha, text, x, y, fontSize, textAlign) {
	if ( fontSize ) {
		ctx.lineWidth = fontSize * 0.125;
		ctx.font = `${fontSize}px Ubuntu`;

		ctx.textAlign = textAlign;
	}

	ctx.globalAlpha = alpha;
	ctx.globalCompositeOperation = 'source-over';
	ctx.strokeStyle = "black";
	ctx.strokeText(text, x, y);

	if (alpha == 0) {
		ctx.globalAlpha = alpha;
	} else {
		ctx.globalAlpha = 1;
	}
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

function renderLightningPath(newPaths, me) {
	newPaths.forEach((path) => {
		lightningPaths.push([path, 1]);
	})
	
	let ctx = getCtx(effectLayer);

	ctx.lineWidth = 1 * hpx;
	ctx.strokeStyle = `White`;
	
	lightningPaths.forEach(([path,alpha], index) => {
		ctx.globalAlpha = alpha;
		lightningPaths[index][1] -= 0.05;
		if (lightningPaths[index][1] <= 0) {
			lightningPaths.splice(index, 1);
			return;
		}
		
		ctx.beginPath();
		let oldx = W / 2 + (path[0].x - me.x) * hpx;
		let oldy = H / 2 + (path[0].y - me.y) * hpx;
		ctx.moveTo(oldx, oldy);
		
		path.forEach((position) => {
			let x = W / 2 + (position.x - me.x) * hpx;
			let y = H / 2 + (position.y - me.y) * hpx;
			ctx.lineTo((oldx + x) / 2 + random(-70, 70) * hpx, (oldy + y) / 2 + random(-70, 70) * hpx);
			ctx.lineTo(x,y);
			oldx = W / 2 + (position.x - me.x) * hpx;
			oldy = H / 2 + (position.y - me.y) * hpx;
		})

		ctx.closePath();

		ctx.stroke();
	})
}

export function addDiedEntities(entities) {
	entities.forEach((entity) => {
		diedEntities.push([entity, 1, 1]);
	});
}

function renderDiedEntities(me) {
	let ctx = getCtx(mobLayer);
	
	diedEntities.forEach(([entity, alpha, size], index) => {
		ctx.globalAlpha = alpha;
		const sz = entity.size * size;

		diedEntities[index][1] *= 0.75;
		diedEntities[index][2] *= 1.05;
		if (diedEntities[index][1] <= 0.05) {
			diedEntities.splice(index, 1);
			return ;
		}

		entity.x += Math.cos(entity.vdir) * (10 / Constants.TICK_PER_SECOND);
		entity.y += Math.sin(entity.vdir) * (10 / Constants.TICK_PER_SECOND);
		let x = W / 2 + (entity.x - me.x) * hpx;
		let y = H / 2 + (entity.y - me.y) * hpx;
		
		let asset;
		if (entity.type == `player`) {
			asset = getAsset(`${entity.type.toLowerCase()}.svg`);
			// entity.size *= 0.25;
			// entity.x += entity.size;
			// entity.y += entity.size;
		} else if (entity.isMob) {
			asset = getAsset(`mobs/${entity.type.toLowerCase()}.svg`);
		} else {
			asset = getAsset(`petals/${entity.type.toLowerCase()}.svg`);
		}
		
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(entity.dir);
		
		const width = asset.naturalWidth, 
			  height = asset.naturalHeight;

		ctx.drawImage(
			asset,
			- sz,
			- sz / width * height,
			sz * 2,
			sz / width * height * 2,
		);

		ctx.restore();
	});

	ctx.globalAlpha = 1;
}

function renderDrops(drops,me) {
	let ctx = getCtx(dropLayer[0]);
	
	drops.forEach((entity) => {
		ctx.globalAlpha = 0.88;
		
		let x = W / 2 + (entity.x - me.x) * hpx;
		let y = H / 2 + (entity.y - me.y) * hpx;

		let asset = getAsset(`petals/${entity.type.toLowerCase()}.svg`);
		
		const width = asset.naturalWidth,
			  height = asset.naturalHeight,
			  size = Constants.DROP_SIZE / 2.5 * hpx,
			  displayLength = Constants.DROP_SIZE / 2.5 * hpx;
		
		ctx.save()
		ctx.translate(x, y);
		ctx.rotate(entity.dir);
		ctx.translate(-x, -y);
		
		let outlineWidth = displayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE;
		ctx.strokeStyle = Constants.RARITY_COLOR_DARKEN[PetalAttributes[entity.type].RARITY];
		ctx.lineWidth = outlineWidth * 10;
		renderRoundRect(x - (displayLength + outlineWidth * 50) / 2, y - (displayLength + outlineWidth * 50) / 2,
		displayLength + outlineWidth * 50, displayLength + outlineWidth * 50, hpx * 1, true, true, true, true);
		
		let fillSize = displayLength * 1.6;

		ctx.fillStyle = Constants.RARITY_COLOR[PetalAttributes[entity.type].RARITY];
		ctx.globalAlpha = 0.88;
		ctx.fillRect(x - fillSize, y - fillSize, fillSize * 2, fillSize * 2);
		
		ctx.drawImage(asset, x - size, y - size / width * height - 2.35, size * 2, size / width * height * 2);
		
		let name = entity.type.toLowerCase();
		let textOffset = displayLength * 1.5;
		let textFont = displayLength * 0.95;

		renderText(0.88, name.charAt(0).toUpperCase() + name.slice(1), x, y + textOffset, textFont, 'center');

		renderText(0.88, name.charAt(0).toUpperCase() + name.slice(1), x, y + textOffset, textFont, 'center');

		ctx.globalAlpha = 1;
		
		ctx.restore();
	})
}

function renderWarning(me) {
	const ctx = getCtx(UILayer[0]);
	if (getAreaNameByEntityPosition(me.x, me.y) == `OCEAN`) {
		ctx.fillStyle = `black`
		ctx.globalAlpha = 0.5;
		renderRoundRect(W / 2 - 200, H / 4 - 100, 400, 150, 16, true, true, true, true);
		ctx.fill();
		ctx.stroke();
		ctx.globalAlpha = 1;
		renderText(0.88, `Warning: suffocate`, W / 2 - 100, H / 4 - 65, 16, 'left');
		renderText(0.88, `in water, you will keep losing air`, W / 2 - 100, H / 4 - 35, 16, 'left');
		renderText(0.88, `when air is empty,`, W / 2 - 100, H / 4 - 5, 16, 'left');
		renderText(0.88, `you will keep reciving damage`, W / 2 - 100, H / 4 + 25, 16, 'left');
		let asset = getAsset(`player_suffocate.svg`);
		ctx.drawImage(asset, W / 2 - 170, H / 4 - 60, asset.naturalWidth / 2.6, asset.naturalHeight / 2.6);
	}
}

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAreaNameByEntityPosition(x, y) {
	const areasArray = Object.entries(Constants.MAP_AREAS);
	const result = areasArray.find(([name, attribute]) => {
		return attribute.START_WIDTH <= x && x <= attribute.START_WIDTH + attribute.WIDTH && attribute.START_HEIGHT <= y && y <= attribute.START_HEIGHT + attribute.HEIGHT;
	});
	return result[0]
}

function getNumberInRangeByTime([ min, max ], speed, isLoop) {
	const length = max - min;
	if (isLoop) {
		const newRange = [min, max * 2 - min];
		const result = getNumberInRangeByTime(newRange, speed, false);
		if (result > max) {
			return max * 2 - result;
		} else {
			return result;
		}
	} else {
		const result = (time * speed) % length + min;
		return result;
	}
}

Array.prototype.sortIndex = function() {
	const arrayClone = JSON.parse(JSON.stringify(this));
	const indexArray = [];
	for (let i = 0; i < arrayClone.length; i++) {
		const min = Math.min(...arrayClone);
		const index = arrayClone.indexOf(min);
		indexArray.push(index)
		arrayClone[index] = Infinity;
	}
	return indexArray
}

export function setCmdLayer() {
	document.getElementById("cmd-input").style['z-index'] = UILayer[0];
}

export function setCmdColor(color) {
	cmdColor = color;
}

export function clearCmdLog() {
	cmdLog = [];
}

export function toggleDebugOption(optionID, value) {
	debugOptions[optionID] = value;
}

function renderHitbox(radius) {
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.strokeStyle = '#242424';
	ctx.lineWidth = hpx * 1;
	ctx.stroke();
}