"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderDrops = renderDrops;
function renderDrops(drops, me) {
  var ctx = getCtx(dropLayer[0]);
  drops.forEach(function (entity) {
    ctx.globalAlpha = 0.88;
    var x = W / 2 + (entity.x - me.x) * hpx;
    var y = H / 2 + (entity.y - me.y) * hpx;
    var asset = getAsset("petals/".concat(entity.type.toLowerCase(), ".svg"));
    var width = asset.naturalWidth,
      height = asset.naturalHeight,
      size = Constants.DROP_SIZE / 2.5 * hpx,
      displayLength = Constants.DROP_SIZE / 2.5 * hpx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(entity.dir);
    ctx.translate(-x, -y);
    var outlineWidth = displayLength * PETAL_OUTLINE_WIDTH_PERCENTAGE;
    ctx.strokeStyle = Constants.RARITY_COLOR_DARKEN[PetalAttributes[entity.type].RARITY];
    ctx.lineWidth = outlineWidth * 10;
    renderRoundRect(x - (displayLength + outlineWidth * 50) / 2, y - (displayLength + outlineWidth * 50) / 2, displayLength + outlineWidth * 50, displayLength + outlineWidth * 50, hpx * 1, true, true, true, true);
    var fillSize = displayLength * 1.6;
    ctx.fillStyle = Constants.RARITY_COLOR[PetalAttributes[entity.type].RARITY];
    ctx.globalAlpha = 0.88;
    ctx.fillRect(x - fillSize, y - fillSize, fillSize * 2, fillSize * 2);
    ctx.drawImage(asset, x - size, y - size / width * height - 2.35, size * 2, size / width * height * 2);
    var name = entity.type.toLowerCase();
    var textOffset = displayLength * 1.5;
    var textFont = displayLength * 0.95;
    renderText(0.88, name.charAt(0).toUpperCase() + name.slice(1), x, y + textOffset, textFont, 'center');
    renderText(0.88, name.charAt(0).toUpperCase() + name.slice(1), x, y + textOffset, textFont, 'center');
    ctx.globalAlpha = 1;
    ctx.restore();
  });
}