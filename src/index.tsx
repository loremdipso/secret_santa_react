import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { Button, Card } from "antd";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import "antd/dist/antd.css";
import "./public/styles.css";
import { IPair, IPlayer } from "interfaces";
import Exclusions from "components/Exclusions";
import Results from "components/Results";
import { playerIsEmpty } from "helpers";

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
	const [pairs] = useState([] as IPair[]);
	const [showResults, setShowResults] = useState(false);

	const addExclusion = (a: number, b: number) => {
		let exclusion = {
			a,
			b,
			id: getPairId(),
		};
		setExclusions([...exclusions, exclusion]);
	};

	const removePlayer = (id: number) => {
		removePlayers([id]);
	};

	const removePlayers = (ids: number[]) => {
		const shouldRemove = (id: number) => {
			return ids.findIndex((badId) => badId === id) < 0;
		};

		setPlayers(players.filter((player) => shouldRemove(player.id)));
		setExclusions(
			exclusions.filter(
				(exclusion) => shouldRemove(exclusion.a) || shouldRemove(exclusion.b)
			)
		);
	};

	const removeExclusion = (a: number, b: number) => {
		setExclusions(
			exclusions.filter(
				(exclusion) =>
					!(exclusion.a === a && exclusion.b === b) &&
					!(exclusion.a === b && exclusion.b === a)
			)
		);
	};

	const toggleShowResults = () => {
		// TODO: calculate results
		setShowResults(!showResults);
	};

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

	const updatePlayer = (updatedPlayer: IPlayer) => {
		setPlayers(
			players.map((player) =>
				player.id === updatedPlayer.id ? updatedPlayer : player
			)
		);
	};

	useEffect(() => {
		// skip the last element, then make sure every other element is non-null
		let playersToRemove = [];
		for (let i = players.length - 2; i >= 0; i--) {
			let player = players[i];
			if (playerIsEmpty(player)) {
				// playersToRemove.push(player.id);
			}
		}

		if (playersToRemove.length > 0) {
			// removePlayers(playersToRemove);
			return; // return now since we can only do one operation at a time
		}

		// make sure players always ends with an empty object
		if (players.length === 0 || !playerIsEmpty(players[players.length - 1])) {
			setPlayers([...players, { name: null, email: null, id: getPlayerId() }]);
		}
	}, [players]);

	return (
		<>
			<Layout>
				<Header>
					<h1>Secret Santa</h1>
				</Header>
				<Content>
					{showResults ? (
						<>
							<Results players={players} pairs={pairs} />
							<Button onClick={toggleShowResults}>Edit</Button>
						</>
					) : (
						<>
							<Card title="Exclusions">
								<Exclusions
									exclusions={exclusions}
									players={players}
									updatePlayer={updatePlayer}
									removePlayer={removePlayer}
									addExclusion={addExclusion}
									removeExclusion={removeExclusion}
								/>
							</Card>

							<Button
								disabled={players.length === 0}
								onClick={toggleShowResults}
							>
								Calculate
							</Button>
						</>
					)}
				</Content>
			</Layout>
		</>
	);
}

if (!(window as any).did_load) {
	(window as any).did_load = true;
	ReactDOM.render(<App />, document.getElementById("app"));
}
