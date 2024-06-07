import { W, H, unitLength } from './canvas.js';

export default class Length {
	constructor(W_, H_, unitLength_ = 0) {
		this.w = W_;
		this.h = H_;
		this.unitLength = unitLength_;
	}

	parse() {
		return this.w * W + this.h * H + this.unitLength * unitLength;
	}

	static parseVal(val) {
		return Length.u(val / unitLength);
	}

	static parseAll(arr) {
		return arr.map(l => l.parse());
	}

	static u(unitLength_ = 0) {
		return new Length(0, 0, unitLength_);
	}
	
	static w(W_, unitLength_ = 0) {
		return new Length(W_, 0, unitLength_);
	}

	static h(H_, unitLength_ = 0) {
		return new Length(0, H_, unitLength_);
	}

	add(l) {
		return new Length(this.w + l.w, this.h + l.h, this.unitLength + l.unitLength);
	}

	sub(l) {
		return new Length(this.w - l.w, this.h - l.h, this.unitLength - l.unitLength);
	}

	mul(k) {
		return new Length(this.w * k, this.h * k, this.unitLength * k);
	}
}