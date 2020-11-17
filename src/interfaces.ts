
export interface IPlayer {
	name: string;
	email: string;
	address?: string;
	id: number;
}

export interface IPair {
	a: number;
	b: number;
	id: number;
}


export interface IImportFile {
	version: number,
	people: IPlayer[],
	bad_pairs: string[][]
	previous_matchups: string[][]
}