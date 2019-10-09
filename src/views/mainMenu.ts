import { IGameService, View } from "../services/gameService";
import { Float3 } from "../webGL/float3";
import { Matrix4x4 } from "../webGL/matrix4x4";

export function createMainMenu(gameService: IGameService) {
	const { graphicService, inputService } = gameService;
	const { meshCache } = graphicService;

	const fMesh = meshCache.get("f");
	fMesh.updateBuffer((attributeInfo, buffer) => {
		buffer.set(attributeInfo.rawBufferData);
		return true;
	});
		// updateUniform: ((uniformInfo, buffer) => {
		// 	const float32Array = buffer as Float32Array;
		// 	switch (uniformInfo.uniformName) {
		// 		case "u_Transform":
		// 			float32Array.set(Matrix4x4.identity.elements);
		// 			break;
		// 		case "u_Color":
		// 			float32Array.set([0.95, 0.0, 0.05, 1.0]);
		// 			break;
		// 	}
		// })

	let cameraPos = new Float3(0, -10, 3.5);
	let cameraLookAt = new Float3(0, 0, 3.5);
	let cameraUp = new Float3(0, 0, 1);
	let camera: Matrix4x4;
	const fInstance = fMesh.createInstance(Matrix4x4.identity, true);

	inputService.keyboardState.addMapping("Escape");

	const mainMenu: View = Object.create(null, {
		onUpdateLogic: { enumerable: true, configurable: false, writable: false, value: onUpdateLogic },
		onUpdateGraphic: { enumerable: true, configurable: false, writable: false, value: onUpdateGraphic },
		onResize: { enumerable: true, configurable: false, writable: false, value: onResize },

		requestPause: { enumerable: true, configurable: false, writable: false, value: requestPause }
	});

	return mainMenu;

	function onUpdateLogic(totalTime: number, deltaTime: number, isFrontView: boolean) {
		if (!isFrontView) {
			return true;
		}

		if (inputService.keyboardState.isPressed("Escape")) {
			return false;
		}

		const { x: mx, y: my } = inputService.mouseState.relativePos;
		camera = Matrix4x4.createLookAtMatrix(Float3.add(cameraPos, new Float3(mx || 0, 0, my || 0)), cameraLookAt, cameraUp);
		fInstance.updateTransformMatrix(Matrix4x4.createRotationMatrix(new Float3(0, 0, 1), totalTime * 0.001));

		return true;
	}

	function onUpdateGraphic(isFrontView: boolean) {
		if (!isFrontView) {
			return;
		}

		fInstance.render(camera);
	}

	function onResize(newWidth: number, newHeight: number) {
	}

	function requestPause() {
		return false;
	}
}
