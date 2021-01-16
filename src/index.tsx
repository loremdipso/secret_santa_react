import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { Button, Card, Space, Switch } from "antd";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import "antd/dist/antd.css";
import "./public/styles.css";
import { IPair, IPlayer } from "interfaces";
import Exclusions from "components/Exclusions";
import Results from "components/Results";
import { decrypt, playerIsEmpty } from "helpers";
import Importer from "components/Importer";
import { getPairId, getPlayerId } from "utils";

function App() {
	const urlParams = new URLSearchParams(window.location.search);
	const secret = urlParams.get("secret");
	if (secret) {
		try {
			let player = decrypt(decodeURIComponent(secret)) as IPlayer;
			return <Display targetPlayer={player} />;
		} catch (e) {
			return <Card>Error decoding :(((</Card>;
		}
	} else {
		return <Main />;
	}
}

function Display({ targetPlayer }: { targetPlayer: IPlayer }) {
	return (
		<Layout>
			<Header>{targetPlayer.name} needs a gift!</Header>

			<Content>
				<Card>
					{targetPlayer.address
						? `Address: ${targetPlayer.address}`
						: "No address on file"}
				</Card>
			</Content>
		</Layout>
	);
}

function Main() {
	const [players, setPlayers] = useState([] as IPlayer[]);
	const [exclusions, setExclusions] = useState([] as IPair[]);
	const [showResults, setShowResults] = useState(false);
	const [subject, setSubject] = useState("Secret Santa");
	const [oneWay, setOneWay] = useState(true);

	const addExclusion = (a: number, b: number) => {
		let exclusion = { a, b, id: getPairId() };
		setExclusions([...exclusions, exclusion]);
	};

	const toggleShowResults = () => {
		setShowResults(!showResults);
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
				(exclusion) =>
					shouldRemove(exclusion.a) || shouldRemove(exclusion.b)
			)
		);
	};

	const onImport = (newPlayers: IPlayer[], newExclusions: IPair[]) => {
		setPlayers(newPlayers);
		setExclusions(newExclusions);
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
				playersToRemove.push(player.id);
			}
		}

		if (playersToRemove.length > 0) {
			removePlayers(playersToRemove);
			return; // return now since we can only do one operation at a time
		}

		// make sure players always ends with an empty object
		if (
			players.length === 0 ||
			!playerIsEmpty(players[players.length - 1])
		) {
			setPlayers([
				...players,
				{ name: null, email: null, id: getPlayerId() },
			]);
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
						<Results
							players={players}
							exclusions={exclusions}
							toggleShowResults={toggleShowResults}
							subject={subject}
							setSubject={setSubject}
							oneWay={oneWay}
						/>
					) : (
						<>
							<Card>
								<Space>
									<Importer onImport={onImport} />

									<Button
										disabled={players.length < 3}
										onClick={toggleShowResults}
									>
										Calculate
									</Button>

									<Switch
										onChange={() => setOneWay(!oneWay)}
										checked={oneWay}
										checkedChildren={
											<span>Exclude is one-way</span>
										}
										unCheckedChildren={
											<span>Exclude goes both ways</span>
										}
									/>
								</Space>
							</Card>

							<Exclusions
								exclusions={exclusions}
								players={players}
								updatePlayer={updatePlayer}
								removePlayer={removePlayer}
								addExclusion={addExclusion}
								removeExclusion={removeExclusion}
								oneWay={oneWay}
							/>
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
