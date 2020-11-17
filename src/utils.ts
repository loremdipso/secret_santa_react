import { notification } from "antd";

export function showToast(message: string) {
	notification.open({
		message: message
	});
}

export function showErrorToast(message: string) {
	notification.open({
		message: "Error",
		description: message,
	});
}


export const getPairId = (() => {
	let pairId = 0;
	return () => {
		return pairId++;
	};
})();

export const getPlayerId = (() => {
	let playerId = 0;
	return () => {
		return playerId++;
	};
})();
