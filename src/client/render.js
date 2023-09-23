import { getAsset } from './assets';
import { getCurrentState } from './state';
import { startCapturingInput, updateSlotsData, switchInput, enable } from './input';
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

let primarySlotDisplayLength = 60, primarySlotHitboxLength = 92, primarySlotCenterY = 850;
let secondarySlotDisplayLength = 45, secondarySlotHitboxLength = 70, secondarySlotCenterY = 930;
let primarySlotCount = Constants.PRIMARY_SLOT_COUNT_BASE;
let secondarySlotCount = Constants.SECONDARY_SLOT_COUNT_BASE;
let selectedSize = 1.2;

let initPetals = false;

let petalSwing = Math.PI * 0.03;
let selectedPetal = undefined, targetedPetal = undefined;

let keyboardMovement = false;

let lightningPaths = [];
let diedEntities = [];

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
			this.x += (this.targetX - this.x) * 0.15;
			if ( Math.abs(this.targetX - this.x) < 0.5 ) {
				this.x = this.targetX;
			}

			this.y += (this.targetY - this.y) * 0.15;
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
			let outlineWidth = displayLength * Constants.PETAL_OUTLINE_WIDTH_PERCENTAGE;
			renderRoundRect(UILayer, - displayLength / 2 - outlineWidth, - displayLength / 2 - outlineWidth, 
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
			renderText(UILayer, petalAlpha, name.charAt(0).toUpperCase() + name.slice(1), 0, textOffset, textFont, 'center');

			ctx.globalCompositeOperation = 'source-over';
			renderText(UILayer, petalAlpha, name.charAt(0).toUpperCase() + name.slice(1), 0, textOffset, textFont, 'center');

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
	selectedPetal = {
		isPrimary: isPrimary,
		slot: slot,
	};
	targetedPetal = {
		isPrimary: targetIsPrimary,
		slot: targetSlot,
	};

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
	for (let i = 0; i < layerCount; i ++ ) {
		let newCanvas = document.createElement('canvas');
		newCanvas.id = `canvas-${i}`;
		document.body.append(newCanvas);
		canvas.push(document.getElementById(`canvas-${i}`));
		canvas[i].classList.add('canvas');
		canvas[i].style['z-index'] = i + 2;
	}
	
	//闪电路径图层
	let newCanvas = document.createElement('canvas');
	newCanvas.id = `canvas-SE`;
	newCanvas.classList.add('canvas');
	newCanvas.style['z-index'] = layerCount * 2 + 2;
	newCanvas.width = window.innerWidth;
	newCanvas.height = window.innerHeight;
	document.body.append(newCanvas);
	
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
	W = window.innerWidth;
	H = window.innerHeight;
	wpx = W / 1000;
	hpx = H / 1000;
	for ( let i = 0; i < layerCount; i ++ ) {
		canvas[i].width = W;
		canvas[i].height = H;
	}
	let canvas_SE = document.getElementById('canvas-SE');
	canvas_SE.width = W;
	canvas_SE.height = H;
}

function renderGame() {
	for ( let i = 0; i < layerCount; i ++ ) {
		ctx = getCtx(i);
		ctx.clearRect(0, 0, W, H);
	}
	let canvas_SE = document.getElementById('canvas-SE');
	let ctx = canvas_SE.getContext(`2d`);
	ctx.clearRect(0, 0, W, H);
	
	if ( gameRadiusOnEnter < hpx * 1800 ) {
		fillBackground(0, "#1EA761");
		renderText(0, 1, "florr.cn", W / 2, H / 2 - hpx * 220, hpx * 85, 'center');
		renderText(0, 1, "How to play", W / 2, H / 2 + hpx * 100, hpx * 30, 'center');
		renderText(0, 1, "Use Mouse or [W] [S] [A] [D] to move", W / 2, H / 2 + hpx * 140, hpx * 15, 'center');
		renderText(0, 1, "Left click or [Space] to attack", W / 2, H / 2 + hpx * 165, hpx * 15, 'center');
		renderText(0, 1, "Right click or [LShift] to defend", W / 2, H / 2 + hpx * 190, hpx * 15, 'center');
		renderText(0, 1, "Press [K] to toggle keyboard movement", W / 2, H / 2 + hpx * 215, hpx * 15, 'center');
		gameRadiusOnEnter += deltaGameRadiusOnEnter;
		deltaGameRadiusOnEnter *= 1.05;
	}
	const { me, others, mobs, drops, leaderboard, playerCount, rankOnLeaderboard, lightningPath, diedEntities } = getCurrentState();
	
	updateSlotsData(W, hpx, primarySlotHitboxLength, primarySlotDisplayLength + 4 * primarySlotDisplayLength * Constants.PETAL_OUTLINE_WIDTH_PERCENTAGE, primarySlotCenterY, primarySlotCount,
		secondarySlotHitboxLength, secondarySlotDisplayLength + 4 * secondarySlotDisplayLength * Constants.PETAL_OUTLINE_WIDTH_PERCENTAGE, secondarySlotCenterY, secondarySlotCount);

	if ( me ) {
		renderBackground(me.x, me.y);
		renderPlayer(me, me);
		others.forEach(renderPlayer.bind(null, me));
		mobs.forEach(mob => {
			renderMob(me, mob);
		});
		renderDrops(drops, me);
		renderLightningPath(lightningPath, me);
		renderDiedEntities(diedEntities, me);
		renderText(UILayer, 0.7, "florr.cn", W - hpx * 80, H - hpx * 20, hpx * 40, 'center');
		renderLeaderboard(leaderboard, playerCount, me, rankOnLeaderboard);
		renderUI(me);
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

let expBarLength = 0;

function renderUI(me) {
	ctx = getCtx(UILayer);

	// exp bar

	// ctx.globalAlpha = 0.85;

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

	ctx.globalCompositeOperation = 'desitination-out'; // clip
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
	renderText(UILayer, 1, `Lvl ${Math.floor(me.level)} flower`, hpx * 100, expBarYPos + hpx * 5, hpx * 18, 'left');
	renderText(UILayer, 0.9, me.username, hpx * 150, expBarYPos - hpx * 40, hpx * 30, 'center');

	// movement helper

	if ( !keyboardMovement ) {
		// render movement helper
	}

	// petals

	// primary slots

	if ( !initPetals ) {
		if ( !me.switched ) {
			switchInput(-1, -1);
		} else {
			initPetals = true;
		}
	}

	if ( me.switched ) {
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
	let petalOutlineWidth = slotDisplayLength * Constants.PETAL_OUTLINE_WIDTH_PERCENTAGE;
	for (let i = 0; i < slotCount; i ++ ) {
		let centerX = W / 2 - slotHitboxLength * (slotCount / 2 - 0.5) + i * slotHitboxLength;
		renderRoundRect(UILayer, centerX - slotDisplayLength / 2 - petalOutlineWidth, centerY - slotDisplayLength / 2 - petalOutlineWidth, 
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

	if ( me.switched ) {
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
	petalOutlineWidth = slotDisplayLength * Constants.PETAL_OUTLINE_WIDTH_PERCENTAGE;
	for (let i = 0; i < slotCount; i ++ ) {
		let centerX = W / 2 - slotHitboxLength * (slotCount / 2 - 0.5) + i * slotHitboxLength;
		renderRoundRect(UILayer, centerX - slotDisplayLength / 2 - petalOutlineWidth, centerY - slotDisplayLength / 2 - petalOutlineWidth, 
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

	// petals

	// for (let i = 0; i < primarySlotCount; i ++ ) {
	// 	if ( primaryPetals[i].type != me.primaryPetals[i] && (!primaryPetals[i].animating) ) {
	// 		primaryPetals[i].type = me.primaryPetals[i];
	// 		primaryPetals[i].setTargetPos(W / 2 - primarySlotHitboxLength * hpx * (primarySlotCount / 2 - 0.5) + i * primarySlotHitboxLength * hpx, primarySlotCenterY * hpx);
	// 	}
	// }
	
	// for (let i = 0; i < secondarySlotCount; i ++ ) {
	// 	if ( secondaryPetals[i].type != me.secondaryPetals[i] && (!secondaryPetals[i].animating) ) {
	// 		secondaryPetals[i].type = me.secondaryPetals[i];
	// 		secondaryPetals[i].setTargetPos(W / 2 - secondarySlotHitboxLength * hpx * (secondarySlotCount / 2 - 0.5) + i * secondarySlotHitboxLength * hpx, secondarySlotCenterY * hpx);
	// 	}
	// }

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
			if ( me.switched ) {
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
			if ( me.switched )
				secondaryPetals[i].setType(me.secondaryPetals[i]);
			secondaryPetals[i].render(slotDisplayLength);
		}
	}
	for (let i = 0; i < slotCount; i ++ ) {
		if ( secondaryPetals[i].animating ) {
			secondaryPetals[i].render(slotDisplayLength);
		}
	}

	if ( selectedPetal && targetedPetal ) {
		let petalA, petalB;
		if ( selectedPetal.isPrimary ) {
			petalA = primaryPetals[selectedPetal.slot];
		} else {
			petalA = secondaryPetals[selectedPetal.slot];
		}
		if ( targetedPetal.isPrimary ) {
			petalB = primaryPetals[targetedPetal.slot];
		} else {
			petalB = secondaryPetals[targetedPetal.slot];
		}
		if ( (!petalA.animating) && (!petalB.animating) ) {
			switchInput(selectedPetal, targetedPetal);
			if ( selectedPetal.isPrimary ) {
				enable(selectedPetal.slot);
			}
			if ( targetedPetal.isPrimary ) {
				enable(targetedPetal.slot);
			}
			selectedPetal = undefined;
			targetedPetal = undefined;
		}
	}
}

function renderBackground(x, y) {
	ctx = getCtx(backgroundLayer);
	ctx.fillStyle = 'rgb(28, 154, 89)';
	ctx.fillRect(0, 0, W, H);

	ctx.fillStyle = 'rgb(30, 167, 97)';
	ctx.fillRect(W / 2 - x * hpx, H / 2 - y * hpx, MAP_WIDTH, MAP_HEIGHT);

	const gridInterval = hpx * 50;

	const startX = ( W / 2 - x * hpx ) % gridInterval;
	const startY = ( H / 2 - y * hpx ) % gridInterval;

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
	const canvasX = W / 2 + (x - me.x) * hpx;
	const canvasY = H / 2 + (y - me.y) * hpx;
	const renderRadius = EntityAttributes.PLAYER.RENDER_RADIUS * hpx;
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

	// render username
	renderText(backgroundLayer, 1, player.username, canvasX, canvasY - 35, hpx * 20, 'center');

	// render health bar
	ctx = getCtx(backgroundLayer);

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
	ctx = getCtx(petalLayer);

	player.petals.forEach(petal => {
		if (petal.isHide) return;
		
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
	ctx.save();
	ctx.translate(canvasX, canvasY);
	const renderRadius = EntityAttributes[mob.type].RENDER_RADIUS;
	const asset = getAsset(`mobs/${mob.type.toLowerCase()}.svg`);
	const width = asset.naturalWidth, height = asset.naturalHeight;
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
	// ctx.rotate(-mob.dir);
	ctx.translate(-canvasX, -canvasY);
	ctx.restore();

	renderText(mobLayer, 1, mob.id, canvasX, canvasY - hpx * 35, hpx * 20, 'center');
	renderText(mobLayer, 1, `hp:${mob.hp}`, canvasX, canvasY + hpx * 65, hpx * 18, 'center');
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
	
	renderRoundRect(UILayer, position.x, position.y, leaderboardWidth, leaderboardHeight, leaderboardRoundCornerRadius, true, true, true, true);
	ctx.lineWidth = leaderboardOutlineWidth;
	ctx.strokeStyle = "rgb(69, 69, 69)";
	ctx.stroke();

	ctx.fillStyle = "rgb(85, 187, 85)";
	ctx.fillRect(position.x + leaderboardOutlineWidth / 2, position.y + leaderboardOutlineWidth / 2, 
	leaderboardWidth - leaderboardOutlineWidth / 2, leaderboardHeadHeight - leaderboardOutlineWidth / 2);
	
	renderRoundRect(UILayer, position.x, position.y, leaderboardWidth, leaderboardHeadHeight, leaderboardRoundCornerRadius, true, true, false, false);
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
	renderText(0, 1, "Press [K] to toggle keyboard movement", W / 2, H / 2 + hpx * 215, hpx * 15, 'center');
	
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
	renderText(0, 1, "Press [K] to toggle keyboard movement", W / 2, H / 2 + hpx * 215, hpx * 15, 'center');

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

function renderRoundRectSE(x, y, w, h, r, r4, r1, r2, r3) { // r1 -> r4 clockwise, r1: top right | NOTE: path ONLY, no STROKE
	let canvas = document.getElementById(`canvas-SE`);
	let ctx = canvas.getContext('2d');
	ctx.globalAlpha = 0.88;
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
	ctx.stroke();
}

function renderText(layer, alpha, text, x, y, fontSize, textAlign) {
	ctx = getCtx(layer);
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

function renderTextSE(alpha, text, x, y, fontSize, textAlign) {
	let canvas = document.getElementById(`canvas-SE`);
	let ctx = canvas.getContext('2d');
	if ( fontSize ) {
		ctx.lineWidth = fontSize * 0.125;
		ctx.font = `${fontSize}px Ubuntu`;

		ctx.textAlign = textAlign;
	}

	ctx.globalAlpha = alpha;
	ctx.strokeStyle = "black";
	ctx.strokeText(text, x, y);

	if (alpha == 0) {
		ctx.globalAlpha = alpha;
	} else {
		ctx.globalAlpha = 1;
	}
	ctx.fillStyle = "white";
	ctx.fillText(text, x, y);

	ctx.globalAlpha = alpha;
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

function renderLightningPath(newPaths,me) {
	newPaths.forEach((path) => {
		lightningPaths.push([path,1]);
	})
	
	let canvas = document.getElementById(`canvas-SE`);
	let context = canvas.getContext('2d');

	context.lineWidth = 1;
	context.strokeStyle = `White`;
	
	lightningPaths.forEach(([path,alpha],index) => {
		context.globalAlpha = alpha;
		lightningPaths[index][1] -= 0.05;
		if (lightningPaths[index][1] <= 0) {
			lightningPaths.splice(index,1);
			return;
		}
		
		context.beginPath();
		let oldx = canvas.width / 2 + path[0].x - me.x;
		let oldy = canvas.height / 2 + path[0].y - me.y;
		context.moveTo(oldx,oldy);
		
		path.forEach((position) => {
			let x = canvas.width / 2 + position.x - me.x;
			let y = canvas.height / 2 + position.y - me.y;
			context.lineTo((oldx + x) / 2 + random(-70,70),(oldy + y) / 2 + random(-70,70));
			context.lineTo(x,y);
			oldx = canvas.width / 2 + position.y - me.y;
			oldy = canvas.height / 2 + position.y - me.y;
		})
		context.stroke();
	})
}

function renderDiedEntities(entities,me) {
	entities.forEach((entity) => {
		diedEntities.push([entity,1]);
	})
	
	let canvas = document.getElementById(`canvas-SE`);
	let context = canvas.getContext('2d');
	
	diedEntities.forEach(([entity,alpha],index) => {
		context.globalAlpha = alpha;
		diedEntities[index][1] -= diedEntities[index][1] * 0.25;
		if (diedEntities[index][1] <= 0.1) {
			diedEntities.splice(index,1);
			return;
		}
		
		let x = canvas.width / 2 + entity.x - me.x;
		let y = canvas.height / 2 + entity.y - me.y;
		
		let asset;
		if (entity.type == `player`) {
			asset = getAsset(`${entity.type.toLowerCase()}.svg`);
			entity.size *= 0.25;
			entity.x += entity.size;
			entity.y += entity.size;
		} else if (entity.isMob) {
			asset = getAsset(`mobs/${entity.type.toLowerCase()}.svg`);
		} else{
			asset = getAsset(`petals/${entity.type.toLowerCase()}.svg`);
		}
		
		context.save()
		context.translate(x, y);
		context.rotate(entity.dir);
		context.translate(-x, -y);
		
		const width = asset.naturalWidth, 
			  height = asset.naturalHeight;
		context.drawImage(asset, x - entity.size, y - entity.size / width * height, entity.size * 2, entity.size / width * height * 2);
		
		context.restore();

		entity.x += Math.min(100,entity.movement.speed) * 0.025 * Math.sin(entity.movement.direction);
		entity.y += Math.min(100,entity.movement.speed) * 0.025 * Math.cos(entity.movement.direction);
		entity.size += entity.size * 0.0125;
	})
}

function renderDrops(drops,me) {
	let canvas = document.getElementById(`canvas-SE`);
	let context = canvas.getContext('2d');
	
	drops.forEach((entity) => {
		context.globalAlpha = 0.88;
		
		let x = canvas.width / 2 + entity.x - me.x;
		let y = canvas.height / 2 + entity.y - me.y;

		let asset = getAsset(`petals/${entity.type.toLowerCase()}.svg`);
		
		const width = asset.naturalWidth,
			  height = asset.naturalHeight,
			  size = Constants.DROP_SIZE / 2.5,
			  displayLength = Constants.DROP_SIZE / 2.5;
		
		context.save()
		context.translate(x, y);
		context.rotate(entity.dir);
		context.translate(-x, -y);
		
		let outlineWidth = displayLength * Constants.PETAL_OUTLINE_WIDTH_PERCENTAGE;
		context.strokeStyle = Constants.RARITY_COLOR_DARKEN[PetalAttributes[entity.type].RARITY];
		context.lineWidth = outlineWidth * 10;
		renderRoundRectSE(x - (displayLength + outlineWidth * 50) / 2,y - (displayLength + outlineWidth * 50) / 2,
		displayLength + outlineWidth * 50, displayLength + outlineWidth * 50, hpx * 1, true, true, true, true);
		
		let fillSize = displayLength * 1.6

		context.fillStyle = Constants.RARITY_COLOR[PetalAttributes[entity.type].RARITY];
		context.globalAlpha = 0.88;
		context.fillRect(x - fillSize, y - fillSize, fillSize * 2, fillSize * 2);
		
		context.drawImage(asset, x - size, y - size / width * height - 2.35, size * 2, size / width * height * 2);
		
		let name = entity.type.toLowerCase();
		let textOffset = displayLength * 1.5;
		let textFont = displayLength * 0.95;

		renderTextSE(0.88, name.charAt(0).toUpperCase() + name.slice(1), x, y + textOffset, textFont, 'center');

		renderTextSE(0.88, name.charAt(0).toUpperCase() + name.slice(1), x, y + textOffset, textFont, 'center');

		context.globalAlpha = 1;
		
		context.restore();
	})
}

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}