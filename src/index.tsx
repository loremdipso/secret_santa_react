import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
	Affix,
	Button,
	Card,
	Dropdown,
	Grid,
	Input,
	Select,
	Space,
	Table,
} from "antd";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import "antd/dist/antd.css";
import "./public/styles.css";
import Column from "antd/lib/table/Column";

interface IPlayer {
	name: string;
	email: string;
	id: number;
}

interface IPair {
	a: number;
	b: number;
	id: number;
}

const getPairId = (() => {
	let pairId = 0;
	return () => {
		return pairId++;
	};
})();

const getPlayerId = (() => {
	let playerId = 0;
	return () => {
		return playerId++;
	};
})();

function App() {
	const [players, setPlayers] = useState([] as IPlayer[]);
	const [exclusions, setExclusions] = useState([] as IPair[]);
	const [pairs, setPairs] = useState([] as IPair[]);
	const [IDA, setIDA] = useState(null);
	const [IDB, setIDB] = useState(null);
	const [showResults, setShowResults] = useState(false);
	const [exclusionError, setExclusionError] = useState(null);

	const addPlayer = () => {
		setPlayers([...players, { name: null, email: null, id: getPlayerId() }]);
	};
	const removePlayer = (id: number) => {
		setPlayers(players.filter((player) => player.id !== id));
	};
	const addExclusion = () => {
		if (IDA === null || IDB === null) {
			return;
		}

		// don't add a duplicate
		let duplicate = exclusions.find(
			(exclusion) =>
				(exclusion.a === IDA && exclusion.b === IDB) ||
				(exclusion.b == IDA && exclusion.a === IDB)
		);
		if (duplicate) {
			setExclusionError("Can't add duplicate");
			console.log("prevented duplicate exclusion");
			return;
		}

		let exclusion = {
			a: IDA,
			b: IDB,
			id: getPairId(),
		};
		setExclusions([...exclusions, exclusion]);
	};

	const removeExclusion = (id: number) => {
		setExclusions(exclusions.filter((exclusion) => exclusion.id !== id));
	};
	const offset = 10;

	useEffect(() => {
		let players = [
			{
				name: "Player 1",
				email: "",
				id: getPlayerId(),
			},
			{
				name: "Player 2",
				email: "",
				id: getPlayerId(),
			},
		];

		setPlayers(players);
		setExclusions([
			{
				a: players[0].id,
				b: players[1].id,
				id: getPairId(),
			},
		]);
	}, []);

	return (
		<>
			<Layout>
				<Header>
					<h1>Secret Santa</h1>
				</Header>
				<Content>
					{showResults ? (
						<Card title="Pairs">
							{pairs.map((pair) => (
								<Card>
									<div>{findPlayer(players, pair.a).name}</div>
									<div>{findPlayer(players, pair.b).name}</div>
								</Card>
							))}
						</Card>
					) : (
						<>
							<Card title="People">
								{players.map((player) => (
									<div key={player.id}>
										<Player
											player={player}
											updatePlayer={(updatedPlayer: IPlayer) =>
												setPlayers(
													players.map((player) =>
														player.id === updatedPlayer.id
															? updatedPlayer
															: player
													)
												)
											}
											removePlayer={removePlayer}
										/>
									</div>
								))}

								<Button onClick={addPlayer}>Add Player</Button>
							</Card>

							<Card title="Exclusions">
								<Exclusions
									exclusions={exclusions}
									players={players}
									removeExclusion={removeExclusion}
								/>

								<Space>
									<SelectPlayer
										players={players}
										selected={IDA}
										onChange={(id: number) => setIDA(id)}
									/>
									<SelectPlayer
										players={players}
										selected={IDB}
										onChange={(id: number) => setIDB(id)}
									/>
								</Space>

								<div>
									<div className="error">{exclusionError}</div>
									<Button
										onClick={addExclusion}
										disabled={IDA === null || IDB === null || IDA === IDB}
									>
										Add Exclusion
									</Button>
								</div>
							</Card>

							<Button disabled={players.length === 0}>Calculate</Button>
						</>
					)}
				</Content>
			</Layout>
		</>
	);
}

function SelectPlayer({
	players,
	selected,
	onChange,
}: {
	players: IPlayer[];
	selected?: number;
	onChange: (id: number) => any;
}) {
	let defaultValue = players.find((player) => player.id === selected)?.name;

	return (
		<Select
			onChange={(value) => {
				onChange(parseInt(value, 10));
			}}
			style={{ width: 200 }}
			defaultValue={defaultValue}
		>
			{players.map((player) => (
				<Select.Option value={player.id} key={player.id}>
					{player.name}
				</Select.Option>
			))}
		</Select>
	);
}

function Player({
	player,
	updatePlayer,
	removePlayer,
}: {
	player: IPlayer;
	updatePlayer: (player: IPlayer) => any;
	removePlayer: (id: number) => any;
}) {
	return (
		<>
			<Space>
				<Input
					placeholder="email"
					value={player.email}
					onChange={(event) =>
						updatePlayer({ ...player, email: event.target.value })
					}
				/>
				<Input
					placeholder="name"
					value={player.name}
					onChange={(event) =>
						updatePlayer({ ...player, name: event.target.value })
					}
				/>
				<Button onClick={() => removePlayer(player.id)}>Remove</Button>
			</Space>
		</>
	);
}

function Exclusions({
	players,
	exclusions,
	removeExclusion,
}: {
	exclusions: IPair[];
	players: IPlayer[];
	removeExclusion: (id: number) => any;
}) {
	if (exclusions.length === 0) {
		return null;
	}

	// let a = findPlayer(players, exclusion.a);
	// let b = findPlayer(players, exclusion.b);

	return (
		<Table dataSource={players} rowKey="id">
			<Column title="Player" dataIndex="name" />
		</Table>
		// 	<thead>
		// 		<tr>
		// 			<th>Player</th>
		// 			<th>Will no match With</th>
		// 		</tr>
		// 	</thead>

		// 	<tbody>
		// 		{players.map((player) => (
		// 			<tr key={player.id}>
		// 				<td>{player.name}</td>
		// 				<td>
		// 					{findExclusionsForPlayer(exclusions, player.id).map((id) => (
		// 						<Button>{findPlayer(players, id).name}</Button>
		// 					))}
		// 				</td>
		// 			</tr>
		// 			// <Space>
		// 			// 	{a.name} =/= {b.name}
		// 			// 	<Button onClick={() => removeExclusion(exclusion.id)}>Remove</Button>
		// 			// </Space>
		// 		))}
		// 	</tbody>
		// </table>
	);
}

if (!(window as any).did_load) {
	(window as any).did_load = true;
	ReactDOM.render(<App />, document.getElementById("app"));
}

function findExclusionsForPlayer(exclusions: IPair[], id: number): number[] {
	const toExclude = [];
	for (const exclusion of exclusions) {
		if (exclusion.a === id) {
			toExclude.push(exclusion.b);
		} else if (exclusion.b === id) {
			toExclude.push(exclusion.a);
		}
	}
	return toExclude;
}

function findPlayer(players: IPlayer[], id: number) {
	return players.find((player) => player.id === id);
}
