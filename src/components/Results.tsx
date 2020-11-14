import { getPairId } from "../index";
import { Card, Space, Table } from "antd";
import Column from "antd/lib/table/Column";
import { findPlayer, playerIsEmpty } from "helpers";
import { IPair, IPlayer } from "interfaces";
import React, { useEffect, useState } from "react";
import shuffle from "shuffle-array";
import { validateLocaleAndSetLanguage } from "typescript";

interface IResultPair extends IPair {
	visible?: boolean;
}

export default function Results({
	players,
	exclusions,
	showAll,
}: {
	players: IPlayer[];
	exclusions: IPair[];
	showAll: boolean;
}) {
	const [failed, setFailed] = useState(false);
	const [matchups, setMatchups] = useState([] as IResultPair[]);

	useEffect(() => {
		let matchups = getMatchups(
			players.filter((player) => !playerIsEmpty(player)),
			exclusions
		);
		setMatchups(matchups);
		setFailed(matchups.length === 0);
	}, [players, exclusions]);

	return failed ? (
		<Card>
			<span>Failed :(</span>
		</Card>
	) : (
		<Table dataSource={matchups} pagination={false} rowKey="id">
			<Column
				title="Gifter"
				width="50%"
				render={(pair: IResultPair) => {
					let player = findPlayer(players, pair.a);
					return (
						<div key={player.id}>
							<div>{player.name}</div>
						</div>
					);
				}}
			/>

			<Column
				title="Giftee"
				width="50%"
				render={(pair: IResultPair) => (
					<HiddenField
						player={findPlayer(players, pair.b)}
						show={showAll || pair.visible}
					/>
				)}
			/>

			<Column
				title=""
				align="right"
				width="120px"
				render={(pair: IResultPair) => (
					<Space>
						{showAll ? null : (
							<a
								onClick={() =>
									helper(matchups, setMatchups, pair, {
										...pair,
										visible: !pair.visible,
									})
								}
							>
								{pair.visible ? "Hide" : "Show"}
							</a>
						)}

						{/* TODO: this */}
						<a>Email</a>
					</Space>
				)}
			/>

			{/* <Column
				title=""
				align="right"
				render={(player, _, index) =>
					index < players.length - 1 ? (
						<Button type="primary">Remove</Button>
					) : (
						""
					)
				}
			/> */}
		</Table>
	);
}

function HiddenField({ player, show }: { player: IPlayer; show: boolean }) {
	// const [shouldShow, setShouldShow] = useState(false);
	// useEffect(() => {
	// 	if (shouldShow !== show) {
	// 		setShouldShow(show);
	// 	}
	// }, [show]);

	return (
		<div key={player.id}>
			{show ? <span>{player.name}</span> : <span>######</span>}
		</div>
	);
}

function helper<T>(
	arr: T[],
	setter: (arr: T[]) => any,
	element: T,
	newElement: T
) {
	setter(arr.map((el) => (el === element ? newElement : el)));
}

function getMatchups(players: IPlayer[], exclusions: IPair[]): IResultPair[] {
	if (players.length < 2) {
		return [];
	}

	let permutations = getPermutations(players);
	shuffle(permutations);
	for (const tempPlayers of permutations) {
		let matchups = playersToMatchups(tempPlayers);
		if (validMatchups(matchups, exclusions)) {
			return matchups.sort((a, b) => a.a - b.a);
		}
	}

	return [];
}

function playersToMatchups(players: IPlayer[]): IResultPair[] {
	let matchups: IResultPair[] = [];
	for (let i = 0; i < players.length - 1; i++) {
		matchups.push({
			a: players[i].id,
			b: players[i + 1].id,
			id: getPairId(),
		});
	}

	matchups.push({
		a: players[players.length - 1].id,
		b: players[0].id,
		id: getPairId(),
	});

	return matchups;
}

function validMatchups(matchups: IResultPair[], exclusions: IPair[]) {
	for (let matchup of matchups) {
		let exclusion = exclusions.find(
			(exclusion) =>
				(matchup.a === exclusion.a && matchup.b === exclusion.b) ||
				(matchup.a === exclusion.b && matchup.b === exclusion.a)
		);

		if (exclusion) {
			return false;
		}
	}
	return true;
}

// thanks SO: https://stackoverflow.com/a/60136724/13707438
function getPermutations<T>(arr: T[], perms: T[][] = [], len = arr.length) {
	if (len === 1) perms.push(arr.slice(0));

	for (let i = 0; i < len; i++) {
		getPermutations(arr, perms, len - 1);

		len % 2 // parity dependent adjacent elements swap
			? ([arr[0], arr[len - 1]] = [arr[len - 1], arr[0]])
			: ([arr[i], arr[len - 1]] = [arr[len - 1], arr[i]]);
	}

	return perms;
}
