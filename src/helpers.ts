import { IPair, IPlayer } from "interfaces";

export function findExclusionsForPlayer(players: IPlayer[], exclusions: IPair[], id: number): number[] {
	const toExclude = [];
	for (const exclusion of exclusions) {
		if (exclusion.a === id) {
			toExclude.push(exclusion.b);
		} else if (exclusion.b === id) {
			toExclude.push(exclusion.a);
		}
	}

	// since the list of exclusions isn't always in sync with the list of players, make sure
	// that the player exists for the exclusion we've found
	return toExclude.filter((idToRemove) => findPlayer(players, idToRemove));
}

export function findPlayer(players: IPlayer[], id: number) {
	return players.find((player) => player.id === id);
}

export function findPlayers(players: IPlayer[], exclusions: IPair[], id: number) {
	if (playerIsEmpty(findPlayer(players, id))) {
		return [];
	}

	let playerExclusions = findExclusionsForPlayer(players, exclusions, id);
	return players.filter((player) => player.id !== id && !playerIsEmpty(player) && !playerExclusions.find((exclusionId) => exclusionId === player.id));
}

export function playerIsEmpty(player: IPlayer) {
	return (!player) || (!player.name && !player.email);
}