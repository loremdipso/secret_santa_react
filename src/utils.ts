import { notification } from "antd";

export function showToast(message: string) {
	notification.open({
		message: message,
		placement: "bottomRight"
	});
}

export function showErrorToast(message: string) {
	notification.open({
		message: "Error",
		description: message,
		placement: "bottomRight"
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
