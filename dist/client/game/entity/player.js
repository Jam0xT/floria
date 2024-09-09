"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderPlayer = renderPlayer;
function renderPlayer(me, player) {
  // render player itself
  ctx = getCtx(playerLayer[0]);
  var x = player.x,
    y = player.y;
  var playerAsset;
  if (player.username == "Pop!") {
    playerAsset = getAsset('mobs/bubble.svg');
  } else {
    playerAsset = getAsset('player.svg');
  }
  var canvasX = W / 2 + (x - me.x) * hpx;
  var canvasY = H / 2 + (y - me.y) * hpx;
  var renderRadius = player.size * hpx;
  ctx.translate(canvasX, canvasY);
  ctx.drawImage(playerAsset, -renderRadius, -renderRadius, renderRadius * 2, renderRadius * 2);
  var hitboxRadius = player.radius * hpx;
  if (debugOptions[0]) {
    renderHitbox(hitboxRadius);
  }
  if (debugOptions[1]) {
    renderText(1, "hp:".concat(player.hp.toFixed(1)), 0, hpx * 25, hpx * 18, 'center');
  }
  if (debugOptions[2]) {
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
  var healthBarBaseWidth = hpx * 10;
  var healthBarBaseStyle = 'rgb(51, 51, 51)';
  var healthBarBaseLength = renderRadius * 2 + hpx * 20;
  var healthBarOutline = hpx * 3;
  var healthBarWidth = healthBarBaseWidth - healthBarOutline;
  var healthBarStyleNormal = 'rgb(117, 221, 52)';
  var healthBarStyleHurt = 'rgb(221, 52, 52)';
  var healthBarLength = healthBarBaseLength * player.hp / player.maxHp;
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
  player.petals.forEach(function (petal) {
    if (petal.isHide) return;
    var renderRadius = petal.size * hpx;
    var asset = getAsset("petals/".concat(petal.type.toLowerCase(), ".svg"));
    var width = asset.naturalWidth,
      height = asset.naturalHeight;
    ctx.translate(canvasX + (petal.x - player.x) * hpx, canvasY + (petal.y - player.y) * hpx);
    ctx.rotate(petal.dir);
    if (width <= height) {
      ctx.drawImage(asset, -renderRadius, -renderRadius / width * height, renderRadius * 2, renderRadius / width * height * 2);
    } else {
      ctx.drawImage(asset, -renderRadius / height * width, -renderRadius, renderRadius / height * width * 2, renderRadius * 2);
    }
    ctx.rotate(-petal.dir);
    ctx.translate(-(canvasX + (petal.x - player.x) * hpx), -(canvasY + (petal.y - player.y) * hpx));
    ctx = getCtx(petalLayer[1]);
    ctx.translate(canvasX + (petal.x - player.x) * hpx, canvasY + (petal.y - player.y) * hpx);
    var petalHitboxRadius = petal.radius * hpx;
    if (debugOptions[0]) {
      renderHitbox(petalHitboxRadius);
    }
    if (debugOptions[1]) {
      renderText(1, "hp:".concat(petal.hp.toFixed(1)), 0, hpx * 25, hpx * 18, 'center');
    }
    if (debugOptions[2]) {
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