import * as pixi from 'pixi.js';
import * as assets from '../assets.js';
import * as util from '../../../utility.js';
import Entity from './entity.js';

export default class HealthBar {
    // 是否活跃 活跃的充要条件是在视距范围内
    isActive = true;

    container = new pixi.Container();

    asset;

    health = 0;

    maxHealth = 1;

    constructor(entity) {
        this.health = entity.attr.hp;
        this.maxHealth = entity.attr.max_hp;
        this.initAsset(entity);
    }

    /**
     * @param {Entity} entity
     * @returns {void}
     */
    update(entity) {
        console.log(entity.attr.hp)
        this.health = entity.attr.hp;
        this.asset.visible = false;
        this.asset = assets.getAsset(`healthBar`, entity.attr.radius, {
            rectWidth: this.health / this.maxHealth * 240
        });
        this.container.addChild(this.asset);
    }

    // 初始化素材
    initAsset(entity) {

        this.asset = assets.getAsset(`healthBar`, entity.attr.radius, {
            rectWidth: this.health / this.maxHealth * 240
        });
        this.container.addChild(this.asset);
    }
}