import { getPairId } from "../index";
import { Button, Card, Space, Table } from "antd";
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
	toggleShowResults,
}: {
	players: IPlayer[];
	exclusions: IPair[];
	toggleShowResults: Function;
}) {
	const [failed, setFailed] = useState(false);
	const [matchups, setMatchups] = useState([] as IResultPair[]);
	const [showAll, setShowAll] = useState(false);

	const toggleShowAll = () => {
		setShowAll(!showAll);
	};

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
		<>
			<Card>
				<Button
					onClick={() => {
						toggleShowResults();
					}}
				>
					Edit
				</Button>
				<Button onClick={toggleShowAll}>
					{showAll ? "Hide all" : "Show all"}
				</Button>

				<Button
					onClick={() => {
						for (let matchup of matchups) {
							sendEmail(players, matchup);
						}
					}}
				>
					Email All
				</Button>
			</Card>
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

							<a onClick={() => sendEmail(players, pair)}>Email</a>
						</Space>
					)}
				/>
			</Table>
		</>
	);
}

function sendEmail(players: IPlayer[], pair: IResultPair) {
	let a = findPlayer(players, pair.a);
	let b = findPlayer(players, pair.b);
	let email = encodeURIComponent(a.email);
	let subject = encodeURIComponent("Secret Santa");
	let body = encodeURIComponent(getBody(b.name, b.address));

	let message = `mailto:${email}?subject=${subject}&body=${body}`;
	window.location.href = message;
}

function getBody(recipientName: string, recipientAddress?: string) {
	let body = `Give your gift to ${recipientName}, or else!`;
	if (recipientAddress) {
		body += `\nThey live at: ${recipientAddress}`;
	}
	return body;
}

function HiddenField({ player, show }: { player: IPlayer; show: boolean }) {
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
