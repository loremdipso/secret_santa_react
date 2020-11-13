import { Card, Table } from "antd";
import Column from "antd/lib/table/Column";
import { findPlayer } from "helpers";
import { IPair, IPlayer } from "interfaces";
import React, { useEffect, useState } from "react";

export default function Results({
	players,
	exclusions,
}: {
	players: IPlayer[];
	exclusions: IPair[];
}) {
	const [matchups, setMatchups] = useState([] as IPair[]);

	useEffect(() => {
		// TODO: calculate matchups
	}, []);

	return (
		<Card title="Pairs">
			{matchups.map((pair) => (
				<Card>
					<div>{findPlayer(players, pair.a).name}</div>
					<div>{findPlayer(players, pair.b).name}</div>
				</Card>
			))}
		</Card>
	);
}
