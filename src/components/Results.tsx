import { getPairId } from "../index";
import { Button, Card, Space, Table } from "antd";
import Column from "antd/lib/table/Column";
import {
	findExclusionsForPlayer,
	findPlayer,
	findPlayers,
	playerIsEmpty,
} from "helpers";
import { IPair, IPlayer } from "interfaces";
import React, { useEffect, useState } from "react";
import Player from "./Player";
import { addEmitHelper } from "typescript";

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
		// TODO: calculate matchups
		let matchups: IResultPair[] = [];

		players = players.filter((player) => !playerIsEmpty(player));
		if (players.length > 0) {
			for (let i = 0; i < players.length - 1; i += 2) {
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
		}

		setMatchups(matchups);
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
