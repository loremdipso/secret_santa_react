import { Card, Table } from "antd";
import Column from "antd/lib/table/Column";
import { findPlayer } from "helpers";
import { IPair, IPlayer } from "interfaces";
import React from "react";

export default function Results({
	players,
	pairs,
}: {
	players: IPlayer[];
	pairs: IPair[];
}) {
	return (
		<Card title="Pairs">
			{pairs.map((pair) => (
				<Card>
					<div>{findPlayer(players, pair.a).name}</div>
					<div>{findPlayer(players, pair.b).name}</div>
				</Card>
			))}
		</Card>
	);
}
