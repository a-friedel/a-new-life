import { Float3, Float4, Matrix3x3, Quaternion, clamp, format, PRECISION } from ".";

/**
 * A 4x4 column based matrix\
 * m00 m01 m02 m03\
 * m10 m11 m12 m13\
 * m20 m21 m22 m23\
 * m30 m31 m32 m33
 */
export class Matrix4x4 {
	//#region Fields

	// Order: 00, 10, 20, 30, 01, 11, 21, 31, 02, 12, 22, 32, 03, 13, 23, 33.
	private readonly _: Float32Array;
	//#endregion

	//#region Properties
	get m00() { return this._[0]; } set m00(f: number) { this._[0] = f; }
	get m01() { return this._[4]; } set m01(f: number) { this._[4] = f; }
	get m02() { return this._[8]; } set m02(f: number) { this._[8] = f; }
	get m03() { return this._[12]; } set m03(f: number) { this._[12] = f; }
	get m10() { return this._[1]; } set m10(f: number) { this._[1] = f; }
	get m11() { return this._[5]; } set m11(f: number) { this._[5] = f; }
	get m12() { return this._[9]; } set m12(f: number) { this._[9] = f; }
	get m13() { return this._[13]; } set m13(f: number) { this._[13] = f; }
	get m20() { return this._[2]; } set m20(f: number) { this._[2] = f; }
	get m21() { return this._[6]; } set m21(f: number) { this._[6] = f; }
	get m22() { return this._[10]; } set m22(f: number) { this._[10] = f; }
	get m23() { return this._[14]; } set m23(f: number) { this._[14] = f; }
	get m30() { return this._[3]; } set m30(f: number) { this._[3] = f; }
	get m31() { return this._[7]; } set m31(f: number) { this._[7] = f; }
	get m32() { return this._[11]; } set m32(f: number) { this._[11] = f; }
	get m33() { return this._[15]; } set m33(f: number) { this._[15] = f; }

	get elements(): [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] { return Array.from(this._) as [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]; }
	set elements(value: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]) { this._.set(value); }

	get determinant() {
		const tmp = new Matrix3x3();
		return (
			this.m00 * this.getSubmatrix(0, 0, tmp).determinant
			- this.m01 * this.getSubmatrix(0, 1, tmp).determinant
			+ this.m02 * this.getSubmatrix(0, 2, tmp).determinant
			- this.m03 * this.getSubmatrix(0, 3, tmp).determinant);
	}

	get inverse() {
		// https://www.youtube.com/watch?v=T8vHPIJqO3Q
		// 00 01 02 03
		// 10 11 12 13
		// 20 21 22 23
		// 30 31 32 33

		const det = this.determinant;
		if (Math.abs(det) <= PRECISION) {
			return Matrix4x4.zero;
		}

		// Adjunkte berechnen
		const adj = new Matrix4x4(
			this.getSubmatrix(0, 0).determinant, -this.getSubmatrix(0, 1).determinant, this.getSubmatrix(0, 2).determinant, -this.getSubmatrix(0, 3).determinant,
			-this.getSubmatrix(1, 0).determinant, this.getSubmatrix(1, 1).determinant, -this.getSubmatrix(1, 2).determinant, this.getSubmatrix(1, 3).determinant,
			this.getSubmatrix(2, 0).determinant, -this.getSubmatrix(2, 1).determinant, this.getSubmatrix(2, 2).determinant, -this.getSubmatrix(2, 3).determinant,
			-this.getSubmatrix(3, 0).determinant, this.getSubmatrix(3, 1).determinant, -this.getSubmatrix(3, 2).determinant, this.getSubmatrix(3, 3).determinant
		);

		return Matrix4x4.mul(adj, 1.0 / det, adj);
	}

	get transposed() {
		return Matrix4x4.createTransposeMatrix(this);
	}

	static get zero() {
		return new Matrix4x4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	}

	static get identity() {
		return new Matrix4x4();
	}
	//#endregion

	//#region ctor
	constructor();
	constructor(other: Matrix4x4);
	constructor(m00: number, m10: number, m20: number, m30: number, m01: number, m11: number, m21: number, m31: number, m02: number, m12: number, m22: number, m32: number, m03: number, m13: number, m23: number, m33: number);
	constructor() {
		if (arguments.length === 0) this._ = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
		else if (arguments.length === 1) this._ = new Float32Array(arguments[0].elements);
		else this._ = new Float32Array([
			arguments[0], arguments[1], arguments[2], arguments[3],
			arguments[4], arguments[5], arguments[6], arguments[7],
			arguments[8], arguments[9], arguments[10], arguments[11],
			arguments[12], arguments[13], arguments[14], arguments[15]]);
	}
	//#endregion

	//#region Operators

	/**
	 * Multiplies a 4x4 matrix with a scalar value.
	 * @param left The 4x4 matrix.
	 * @param right The scalar value.
	 * @param outMatrix Optional output matrix to write the result to.
	 */
	static mul(left: Matrix4x4, right: number, outMatrix?: Matrix4x4): Matrix4x4;
	/**
	 * Multiplies two 4x4 matrices.
	 * @param left The left 4x4 matrix.
	 * @param right The right 4x4 matrix.
	 * @param outMatrix Optional output matrix to write the result to.
	 */
	static mul(left: Matrix4x4, right: Matrix4x4, outMatrix?: Matrix4x4): Matrix4x4;
	static mul(l: Matrix4x4, r: number | Matrix4x4, out: Matrix4x4 = new Matrix4x4()): Matrix4x4 {
		if (r instanceof Matrix4x4) {
			out._[0] = l._[0] * r._[0] + l._[4] * r._[1] + l._[8] * r._[2] + l._[12] * r._[3];
			out._[1] = l._[1] * r._[0] + l._[5] * r._[1] + l._[9] * r._[2] + l._[13] * r._[3];
			out._[2] = l._[2] * r._[0] + l._[6] * r._[1] + l._[10] * r._[2] + l._[14] * r._[3];
			out._[3] = l._[3] * r._[0] + l._[7] * r._[1] + l._[11] * r._[2] + l._[15] * r._[3];
			out._[4] = l._[0] * r._[4] + l._[4] * r._[5] + l._[8] * r._[6] + l._[12] * r._[7];
			out._[5] = l._[1] * r._[4] + l._[5] * r._[5] + l._[9] * r._[6] + l._[13] * r._[7];
			out._[6] = l._[2] * r._[4] + l._[6] * r._[5] + l._[10] * r._[6] + l._[14] * r._[7];
			out._[7] = l._[3] * r._[4] + l._[7] * r._[5] + l._[11] * r._[6] + l._[15] * r._[7];
			out._[8] = l._[0] * r._[8] + l._[4] * r._[9] + l._[8] * r._[10] + l._[12] * r._[11];
			out._[9] = l._[1] * r._[8] + l._[5] * r._[9] + l._[9] * r._[10] + l._[13] * r._[11];
			out._[10] = l._[2] * r._[8] + l._[6] * r._[9] + l._[10] * r._[10] + l._[14] * r._[11];
			out._[11] = l._[3] * r._[8] + l._[7] * r._[9] + l._[11] * r._[10] + l._[15] * r._[11];
			out._[12] = l._[0] * r._[12] + l._[4] * r._[13] + l._[8] * r._[14] + l._[12] * r._[15];
			out._[13] = l._[1] * r._[12] + l._[5] * r._[13] + l._[9] * r._[14] + l._[13] * r._[15];
			out._[14] = l._[2] * r._[12] + l._[6] * r._[13] + l._[10] * r._[14] + l._[14] * r._[15];
			out._[15] = l._[3] * r._[12] + l._[7] * r._[13] + l._[11] * r._[14] + l._[15] * r._[15];
		} else {
			out._[0] = l._[0] * r;
			out._[1] = l._[1] * r;
			out._[2] = l._[2] * r;
			out._[3] = l._[3] * r;
			out._[4] = l._[4] * r;
			out._[5] = l._[5] * r;
			out._[6] = l._[6] * r;
			out._[7] = l._[7] * r;
			out._[8] = l._[8] * r;
			out._[9] = l._[9] * r;
			out._[10] = l._[10] * r;
			out._[11] = l._[11] * r;
			out._[12] = l._[12] * r;
			out._[13] = l._[13] * r;
			out._[14] = l._[14] * r;
			out._[15] = l._[15] * r;
		}

		return out;
	}
	//#endregion

	//#region Instance Methods
	getColumn(column: 0 | 1 | 2 | 3, out: Float4 = new Float4()) {
		if (column === 0) out.elements = [this.m00, this.m10, this.m20, this.m30];
		else if (column === 1) out.elements = [this.m01, this.m11, this.m21, this.m31];
		else if (column === 2) out.elements = [this.m02, this.m12, this.m22, this.m32];
		else out.elements = [this.m03, this.m13, this.m23, this.m33];
		return out;
	}

	setColumn(column: 0 | 1 | 2 | 3, v: Float4) {
		if (column === 0) {
			this.m00 = v.x;
			this.m10 = v.y;
			this.m20 = v.z;
			this.m30 = v.w;
		} else if (column === 1) {
			this.m01 = v.x;
			this.m11 = v.y;
			this.m21 = v.z;
			this.m31 = v.w;
		} else if (column === 2) {
			this.m02 = v.x;
			this.m12 = v.y;
			this.m22 = v.z;
			this.m32 = v.w;
		} else {
			this.m03 = v.x;
			this.m13 = v.y;
			this.m23 = v.z;
			this.m33 = v.w;
		}
	}

	getRow(row: 0 | 1 | 2 | 3, out: Float4 = new Float4()) {
		if (row === 0) out.elements = [this.m00, this.m01, this.m02, this.m03];
		else if (row === 1) out.elements = [this.m10, this.m11, this.m12, this.m13];
		else if (row === 2) out.elements = [this.m20, this.m21, this.m22, this.m23];
		else out.elements = [this.m30, this.m31, this.m32, this.m33];
		return out;
	}

	setRow(row: 0 | 1 | 2 | 3, v: Float4) {
		if (row === 0) {
			this.m00 = v.x;
			this.m01 = v.y;
			this.m02 = v.z;
			this.m03 = v.w;
		} else if (row === 1) {
			this.m10 = v.x;
			this.m11 = v.y;
			this.m12 = v.z;
			this.m13 = v.w;
		} else if (row === 2) {
			this.m20 = v.x;
			this.m21 = v.y;
			this.m22 = v.z;
			this.m23 = v.w;
		} else {
			this.m30 = v.x;
			this.m31 = v.y;
			this.m32 = v.z;
			this.m33 = v.w;
		}
	}

	getSubmatrix(row: 0 | 1 | 2 | 3, column: 0 | 1 | 2 | 3, out = new Matrix3x3()) {
		if (row === 0) {
			if (column === 0) out.elements = [this.m11, this.m21, this.m31, this.m12, this.m22, this.m32, this.m13, this.m23, this.m33];
			else if (column === 1) out.elements = [this.m10, this.m20, this.m30, this.m12, this.m22, this.m32, this.m13, this.m23, this.m33];
			else if (column === 2) out.elements = [this.m10, this.m20, this.m30, this.m11, this.m21, this.m31, this.m13, this.m23, this.m33];
			else out.elements = [this.m10, this.m20, this.m30, this.m11, this.m21, this.m31, this.m12, this.m22, this.m32];
		} else if (row === 1) {
			if (column === 0) out.elements = [this.m01, this.m21, this.m31, this.m02, this.m22, this.m32, this.m03, this.m23, this.m33];
			else if (column === 1) out.elements = [this.m00, this.m20, this.m30, this.m02, this.m22, this.m32, this.m03, this.m23, this.m33];
			else if (column === 2) out.elements = [this.m00, this.m20, this.m30, this.m01, this.m21, this.m31, this.m03, this.m23, this.m33];
			else out.elements = [this.m00, this.m20, this.m30, this.m01, this.m21, this.m31, this.m02, this.m22, this.m32];
		} else if (row === 2) {
			if (column === 0) out.elements = [this.m01, this.m11, this.m31, this.m02, this.m12, this.m32, this.m03, this.m13, this.m33];
			else if (column === 1) out.elements = [this.m00, this.m10, this.m30, this.m02, this.m12, this.m32, this.m03, this.m13, this.m33];
			else if (column === 2) out.elements = [this.m00, this.m10, this.m30, this.m01, this.m11, this.m31, this.m03, this.m13, this.m33];
			else out.elements = [this.m00, this.m10, this.m30, this.m01, this.m11, this.m31, this.m02, this.m12, this.m32];
		} else {
			if (column === 0) out.elements = [this.m01, this.m11, this.m21, this.m02, this.m12, this.m22, this.m03, this.m13, this.m23];
			else if (column === 1) out.elements = [this.m00, this.m10, this.m20, this.m02, this.m12, this.m22, this.m03, this.m13, this.m23];
			else if (column === 2) out.elements = [this.m00, this.m10, this.m20, this.m01, this.m11, this.m21, this.m03, this.m13, this.m23];
			else out.elements = [this.m00, this.m10, this.m20, this.m01, this.m11, this.m21, this.m02, this.m12, this.m22];
		}
		return out;
	}

	equals(other: Matrix4x4) {
		return (this === other)
			|| (Math.abs(this.m00 - other.m00) <= PRECISION
				&& Math.abs(this.m01 - other.m01) <= PRECISION
				&& Math.abs(this.m02 - other.m02) <= PRECISION
				&& Math.abs(this.m03 - other.m03) <= PRECISION
				&& Math.abs(this.m10 - other.m10) <= PRECISION
				&& Math.abs(this.m11 - other.m11) <= PRECISION
				&& Math.abs(this.m12 - other.m12) <= PRECISION
				&& Math.abs(this.m13 - other.m13) <= PRECISION
				&& Math.abs(this.m20 - other.m20) <= PRECISION
				&& Math.abs(this.m21 - other.m21) <= PRECISION
				&& Math.abs(this.m22 - other.m22) <= PRECISION
				&& Math.abs(this.m23 - other.m23) <= PRECISION
				&& Math.abs(this.m30 - other.m30) <= PRECISION
				&& Math.abs(this.m31 - other.m31) <= PRECISION
				&& Math.abs(this.m32 - other.m32) <= PRECISION
				&& Math.abs(this.m33 - other.m33) <= PRECISION
			);
	}

	toString(name?: string) {
		return `Matrix4x4${name && `: ${name}` || ""}\n|${format(this.m00, 8, 3)}  ${format(this.m01, 8, 3)}  ${format(this.m02, 8, 3)}  ${format(this.m03, 8, 3)}|\n|${format(this.m10, 8, 3)}  ${format(this.m11, 8, 3)}  ${format(this.m12, 8, 3)}  ${format(this.m13, 8, 3)}|\n|${format(this.m20, 8, 3)}  ${format(this.m21, 8, 3)}  ${format(this.m22, 8, 3)}  ${format(this.m23, 8, 3)}|\n|${format(this.m30, 8, 3)}  ${format(this.m31, 8, 3)}  ${format(this.m32, 8, 3)}  ${format(this.m33, 8, 3)}|\n`;
	}
	//#endregion

	//#region Static Methods
	static createLookAtMatrix(eye: Float3, at: Float3, up: Float3, out = new Matrix4x4()) {
		const zAxis = Float3.sub(at, eye).normalized;
		const xAxis = Float3.cross(up, zAxis).normalized;
		const yAxis = Float3.cross(zAxis, xAxis);

		out.elements = [
			xAxis.x, xAxis.y, xAxis.z, -Float3.dot(xAxis, eye),
			yAxis.x, yAxis.y, yAxis.z, -Float3.dot(yAxis, eye),
			zAxis.x, zAxis.y, zAxis.z, -Float3.dot(zAxis, eye),
			0, 0, 0, 1
		];
		return out;
	}

	static createPerspectiveMatrix(width: number, height: number, near: number, far: number, out = new Matrix4x4()) {
		if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(near) || !Number.isFinite(far) || width <= 0 || height <= 0 || near <= 0 || far < near) {
			throw new Error('Invalid Parameter Values.');
		}

		out.elements = [
			2 * near / width, 0, 0, 0,
			0, 2 * near / height, 0, 0,
			0, 0, far / (far - near), near * far / (near - far),
			0, 0, 1, 0
		];
		return out;
	}

	static createPerspectiveFoVMatrix(fov: number, aspectRatio: number, near: number, far: number, out = new Matrix4x4()) {
		if (!Number.isFinite(fov) || !Number.isFinite(aspectRatio) || !Number.isFinite(near) || !Number.isFinite(far) || fov <= 0 || fov >= Math.PI || aspectRatio <= 0 || near <= 0 || far < near) {
			throw new Error('Invalid Parameter Values.');
		}

		const fov2 = fov * 0.5;
		const yScale = 1 / Math.tan(fov2);
		const xScale = yScale / aspectRatio;

		out.elements = [
			xScale, 0, 0, 0,
			0, yScale, 0, 0,
			0, 0, far / (far - near), -near * far / (far - near),
			0, 0, 1, 0
		];
		return out;
	}

	static createOrthographic(left: number, right: number, bottom: number, top: number, near: number, far: number, out = new Matrix4x4()) {
		if (!Number.isFinite(left)
			|| !Number.isFinite(right)
			|| !Number.isFinite(top)
			|| !Number.isFinite(bottom)
			|| !Number.isFinite(near)
			|| !Number.isFinite(far)
			|| Math.abs(left - right) < PRECISION
			|| Math.abs(bottom - top) < PRECISION
			|| Math.abs(near - far) < PRECISION) {
			throw new Error('Invalid Parameter Values.');
		}

		const widthRatio = 1.0 / (right - left);
		const heightRatio = 1.0 / (top - bottom);
		const depthRatio = 1.0 / (far - near);

		const sx = 2 * widthRatio;
		const sy = 2 * heightRatio;
		const sz = -2 * depthRatio;

		const tx = -(right + left) * widthRatio;
		const ty = -(top + bottom) * heightRatio;
		const tz = -(far + near) * depthRatio;

		out.elements = [
			sx, 0, 0, 0,
			0, sx, 0, 0,
			0, 0, sz, 0,
			tx, ty, tz, 1
		];
		return out;
	}

	/**
	 * Creates a 4x4 rotation matrix with given quaternion.
	 * The quaternion should be normalized.
	 * You can put an output matrix to avoid garbage collection of temporary fields.
	 * @param quaternion The rotation quaternion.
	 * @param outMatrix Optional output matrix to write the result to.
	 */
	static createRotationMatrix(quaternion: Quaternion, outMatrix?: Matrix4x4): Matrix4x4;
	/**
	 * Creates a 4x4 rotation matrix with given axis angle rotation.
	 * The axis should be normalized.
	 * You can put an output matrix to avoid garbage collection of temporary fields.
	 * @param axis The rotation axis.
	 * @param angle The rotation angle.
	 * @param outMatrix Optional output matrix to write the result to.
	 */
	static createRotationMatrix(axis: Float3, angle: number, outMatrix?: Matrix4x4): Matrix4x4;
	static createRotationMatrix(axis: Float3 | Quaternion, angle?: number | Matrix4x4, out?: Matrix4x4) {
		if (axis instanceof Quaternion) {
			const { x, y, z, w } = axis;
			const n = 2.0 / (x * x + y * y + z * z + w * w);

			if (angle instanceof Matrix4x4) {
				out = angle;
			} else {
				out = new Matrix4x4();
			}

			out.elements = [
				1 - n * y * y - n * z * z, n * x * y + n * z * w, n * x * z - n * y * w, 0,
				n * x * y - n * z * w, 1 - n * x * x - n * z * z, n * y * z + n * x * w, 0,
				n * x * z + n * y * w, n * y * z - n * x * w, 1 - n * x * x - n * y * y, 0,
				0, 0, 0, 1
			];
		} else {
			const { x, y, z } = axis;
			const sin = Math.sin(angle as number);
			const cos = Math.cos(angle as number);

			if (!out) {
				out = new Matrix4x4();
			}

			out.elements = [
				cos + x * x * (1 - cos), y * x * (1 - cos) + z * sin, z * x * (1 - cos) - y * sin, 0,
				x * y * (1 - cos) - z * sin, cos + y * y * (1 - cos), z * y * (1 - cos) + x * sin, 0,
				x * z * (1 - cos) + y * sin, y * z * (1 - cos) - x * sin, cos + z * z * (1 - cos), 0,
				0, 0, 0, 1
			];
		}

		return out;
	}

	static createScreenSpaceTransformMatrix(width: number, height: number, out = new Matrix4x4()) {
		const halfWidth = (clamp(width, 4096) | 0) * 0.5;
		const halfHeight = (clamp(height, 4096) | 0) * 0.5;

		out.elements = [
			halfWidth, 0, 0, 0,
			0, -halfHeight, 0, 0,
			0, 0, 1, 0,
			halfWidth, halfHeight, 0, 1
		];
		return out;
	}

	/**
	 * Creates a 4x4 translation matrix with given translation.
	 * You can put an output matrix to avoid garbage collection of temporary fields.
	 * @param translation The translation vector
	 * @param outMatrix Optional output matrix to write the result to.
	 */
	static createTranslationMatrix(translation: Float3, outMatrix?: Matrix4x4): Matrix4x4;
	/**
	 * Creates a 4x4 translation matrix with given x, y and z translation.
	 * You can put an output matrix to avoid garbage collection of temporary fields.
	 * @param x The translation on the x-axis. (left/right)
	 * @param y The translation on the y-axis. (back/front)
	 * @param z The translation on the z-axis. (down/up)
	 * @param outMatrix Optional output matrix to write the result to.
	 */
	static createTranslationMatrix(x: number, y: number, z: number, outMatrix?: Matrix4x4): Matrix4x4;
	static createTranslationMatrix(x: number | Float3, y?: number | Matrix4x4, z?: number, out?: Matrix4x4) {
		if (x instanceof Float3) {
			out = y as Matrix4x4 || new Matrix4x4();
			y = x.y;
			z = x.z;
			x = x.x;
		} else {
			out = out || new Matrix4x4();
		}
		out.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y as number, z!, 1
		];
		return out;
	}

	/**
	 * Create a transposed version of the given matrix.
	 * You can put an output matrix to avoid garbage collection of temporary fields.
	 * @param matrix The matrix to transpose.
	 * @param outMatrix Optional output matrix to write the result to.
	 */
	static createTransposeMatrix(matrix: Matrix4x4, outMatrix?: Matrix4x4): Matrix4x4;
	static createTransposeMatrix(matrix: Matrix4x4, out: Matrix4x4 = new Matrix4x4()) {
		const [
			m00, m10, m20, m30,
			m01, m11, m21, m31,
			m02, m12, m22, m32,
			m03, m13, m23, m33
		] = matrix.elements;
		out.elements = [
			m00, m01, m02, m03,
			m10, m11, m12, m13,
			m20, m21, m22, m23,
			m30, m31, m32, m33
		];
		return out;
	}
	//#endregion
}
