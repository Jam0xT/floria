"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDistance = getDistance;
exports.getNewUUID = getNewUUID;
exports.random = random;
exports.randomInt = randomInt;
// 公用方法

function random(l, r) {
  // [l, r) 范围内的随机数
  return Math.random() * (r - l) + l;
}
function randomInt(l, r) {
  // [l, r] 范围内的随机整数
  return Math.floor(random(l, r + 1));
}
function getNewUUID() {
  // 生成新的 crypto UUID
  var newUUID = crypto.randomUUID();
  return newUUID;
}
function getDistance(cord1, cord2) {
  // 求两个坐标之间的欧式几何距离 坐标是包含 x 和 y 的 obj
  var dx = cord1.x - cord2.x;
  var dy = cord1.y - cord2.y;
  var d = Math.sqrt(dx * dx + dy * dy);
  return d;
}