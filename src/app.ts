import { Float2 } from "./webGL/float2";
import { Float3 } from "./webGL/float3";
import { Float4 } from "./webGL/float4";
import { Matrix2x2 } from "./webGL/matrix2x2";
import { Matrix3x3 } from "./webGL/matrix3x3";
import { Matrix4x4 } from "./webGL/matrix4x4";

const eye = new Float3(0.0, -6.0, 1.8);
const at = new Float3(0.0, 0.0, 1.5);
const up = new Float3(0.0, 0.0, 1.0);

const camera = Matrix4x4.createLookAtMatrix(eye, at, up);
console.log(camera.toString("Camera"));

const translation = Matrix4x4.createTranslationMatrix(0, 0, 0);
const rotation = Matrix4x4.createRotationMatrix(up, 0.0);
const scale = Matrix4x4.identity; //Matrix4x4.createScaleMatrix(1.0, 1.0, 1.0);

const transform = Matrix4x4.mul(Matrix4x4.mul(translation, rotation), scale);
console.log(transform.toString("Transform"));

const world = Matrix4x4.identity;
console.log(world.toString("World"));

const fov = Math.PI / 3.0; // 60°
const screenWidth = 1920;
const screenHeight = 1080;
const aspectRatio = screenWidth / screenHeight;
const near = 0.1;
const far = 100.0;
const projection = Matrix4x4.createPerspectiveFoVMatrix(fov, aspectRatio, near, far);
console.log(projection.toString("Projection"));

const worldViewProjection = Matrix4x4.mul(Matrix4x4.mul(world, camera), projection);
console.log(worldViewProjection.toString("WorldViewProjection"));

const p1 = new Float3(-0.5, -0.5, 0.0);
console.log(p1.toString("P1"));

const p1a = Matrix4x4.mul(worldViewProjection, p1);
const p1b = worldViewProjection.multiplyPoint(p1);
const p1c = worldViewProjection.multiplyPointFast(p1);
const p1d = worldViewProjection.multiplyVector(p1);
console.log(p1a.toString("P1               (mul)"));
console.log(p1b.toString("P1     (multiplyPoint)"));
console.log(p1c.toString("P1 (multiplyPointFast)"));
console.log(p1d.toString("P1    (multiplyVector)"));

// import { createGame } from "./common";
// import { ApplicationService, IApplicationService } from "./services/applicationService";

// const swPromise: Promise<IApplicationService> = window.navigator.serviceWorker
// 	? ApplicationService.create("sw.js")
// 	: Promise.reject();

// swPromise.then(applicationService => {
// 	// webpack reload
// 	if (process.env.NODE_ENV === "development") {
// 		const socket = require("webpack-dev-server/client/socket");
// 		const onSocketMsg = {
// 			ok: function msgOk() {
// 				applicationService.updateCache();
// 			},
// 			warnings: function msgWarnings() {
// 				applicationService.updateCache();
// 			},
// 			invalid: function msgInvalid() {
// 				console.log("Recompiling…")
// 				// setBusyStateAction("Recompiling…");
// 			},
// 			errors: function msgErrors(data: any) {
// 				console.log("Errors while compiling. Reload prevented.");
// 				// setBusyStateAction(null);
// 				// modalService.addModal({
// 				// 	title: "Errors while compiling. Reload prevented.",
// 				// 	content: (<ShowAnsi ansiText= { data.toString() } />),
// 				// 	buttons: [{
// 				// 		label: "Ok"
// 				// 	}]
// 				// });
// 			}
// 		};
// 		socket("/sockjs-node", onSocketMsg);
// 	}

// 	const appDiv = document.getElementById("app")!;
// 	const canvas = document.createElement("canvas");
// 	canvas.id = "main-canvas";
// 	appDiv.appendChild(canvas);

// 	const progress = document.createElement("div");
// 	progress.id = "main-progress";
// 	appDiv.appendChild(progress);
// 	progress.classList.add("visible");

// 	const onInitializationUpdate = (percent: number) => {
// 		const value = `${percent.toFixed(0)}%`;
// 		progress.textContent = value;
// 		progress.style.backgroundSize = value;
// 		if (percent >= 100) {
// 			progress.classList.remove("visible");
// 		}
// 	}

// 	return createGame(canvas, applicationService, onInitializationUpdate);
// }).then(game => {
// 	game.run();
// }).catch(reason => {
// 	const appDiv = document.getElementById("app")!;

// 	const canvas = document.getElementById("main-canvas");
// 	canvas && appDiv.removeChild(canvas);

// 	const progress = document.getElementById("main-progress");
// 	progress && appDiv.removeChild(progress);

// 	const h1 = document.createElement("h1");
// 	h1.textContent = "Something went wrong!";
// 	const p = document.createElement("p");
// 	p.textContent = reason && reason.message || reason.toString() || "Unknown Reason";
// 	appDiv.appendChild(h1);
// 	appDiv.appendChild(p);
// });
