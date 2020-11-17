import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Input, Menu, Space, Table } from "antd";
import Column from "antd/lib/table/Column";
import { findPlayer, pairHasEmail, playerIsEmpty } from "helpers";
import { IPair, IPlayer } from "interfaces";
import React, { useEffect, useState } from "react";
import shuffle from "shuffle-array";
import { validateLocaleAndSetLanguage } from "typescript";
import { getPairId, showErrorToast, showToast } from "utils";

interface IResultPair extends IPair {
	visible?: boolean;
}

export default function Results({
	players,
	exclusions,
	toggleShowResults,
	subject,
	setSubject,
	oneWay,
}: {
	players: IPlayer[];
	exclusions: IPair[];
	toggleShowResults: Function;
	subject: string;
	setSubject: (subject: string) => any;
	oneWay: boolean;
}) {
	const [failed, setFailed] = useState(false);
	const [matchups, setMatchups] = useState([] as IResultPair[]);
	const [showAll, setShowAll] = useState(false);
	const [canEmailAll, setCanEmailAll] = useState(false);
	const [recalculateCounter, setRecalculateCounter] = useState(0);

	const toggleShowAll = () => {
		setShowAll(!showAll);
	};

	const exportToFile = () => {
		try {
			let j = document.createElement("a");
			j.id = "download";
			let dateString = new Date().toLocaleDateString("en-US", {
				month: "numeric",
				day: "numeric",
				year: "numeric",
			});
			j.download = `secret_santa_${dateString}.json`;

			let contents = {
				version: 1.0,
				people: players.filter((player) => !playerIsEmpty(player)),
				bad_pairs: exclusions
					.map((pair) => {
						let a = findPlayer(players, pair.a);
						let b = findPlayer(players, pair.b);
						if (a && b) {
							if (oneWay) {
								return [[a.name, b.name]];
							} else {
								return [
									[a.name, b.name],
									[b.name, a.name],
								];
							}
						} else {
							return null;
						}
					})
					.filter((pair) => pair)
					.flat(),
			};

			j.href = URL.createObjectURL(
				new Blob([JSON.stringify(contents, null, 2)])
			);
			j.click();
			showToast("Exported successfully");
		} catch (e) {
			console.log(e);
			return showErrorToast("Error exporting");
		}
	};

	const getMenu = (pair?: IPair) => (
		<Menu>
			<Menu.Item key="0">
				<a
					onClick={() => {
						if (pair) {
							sendEmail(players, pair, subject, EmailTarget.gmail);
						} else {
							for (let matchup of matchups) {
								sendEmail(players, matchup, subject, EmailTarget.gmail);
							}
						}
					}}
				>
					Gmail
				</a>
			</Menu.Item>
			<Menu.Item key="1">
				<a
					onClick={() => {
						if (pair) {
							sendEmail(players, pair, subject, EmailTarget.local);
						} else {
							for (let matchup of matchups) {
								sendEmail(players, matchup, subject, EmailTarget.local);
							}
						}
					}}
				>
					Local
				</a>
			</Menu.Item>
		</Menu>
	);

	useEffect(() => {
		let matchups = getMatchups(
			players.filter((player) => !playerIsEmpty(player)),
			exclusions,
			oneWay
		);
		setMatchups(matchups);
		setFailed(matchups.length === 0);
	}, [players, exclusions, recalculateCounter]);

	useEffect(() => {
		setCanEmailAll(
			!players.find((player) => !playerIsEmpty(player) && !player.email)
		);
	}, [players]);

	return failed ? (
		<Card>
			<Button
				onClick={() => {
					toggleShowResults();
				}}
			>
				Edit
			</Button>
			<Card>
				Sorry, I couldn't find any valid arrangements. You'll need to either
				remove some restrictions or add more people to the pool.
			</Card>
		</Card>
	) : (
		<>
			<Card>
				<Input
					style={{ display: "block", marginBottom: "10px" }}
					addonBefore={<span>Subject line for emails:</span>}
					value={subject}
					onChange={(event) => setSubject(event.target.value)}
				/>

				<Space>
					<Button
						onClick={() => {
							toggleShowResults();
						}}
					>
						Edit
					</Button>
					<Button
						onClick={() => {
							setRecalculateCounter(recalculateCounter + 1);
						}}
					>
						Recalculate
					</Button>
					<Button onClick={toggleShowAll}>
						{showAll ? "Hide all" : "Show all"}
					</Button>
					<Dropdown
						overlay={getMenu()}
						trigger={["click"]}
						disabled={!canEmailAll}
					>
						<Button onClick={(e) => e.preventDefault()}>
							Email All <DownOutlined />
						</Button>
					</Dropdown>

					<Button onClick={exportToFile}>Export</Button>
				</Space>
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

							<Dropdown
								overlay={getMenu(pair)}
								trigger={["click"]}
								disabled={!pairHasEmail(players, pair)}
							>
								<Button onClick={(e) => e.preventDefault()}>
									Email <DownOutlined />
								</Button>
							</Dropdown>
						</Space>
					)}
				/>
			</Table>
		</>
	);
}

enum EmailTarget {
	gmail,
	local,
}
function sendEmail(
	players: IPlayer[],
	pair: IResultPair,
	subject: string,
	target: EmailTarget
) {
	let a = findPlayer(players, pair.a);
	let b = findPlayer(players, pair.b);
	let email = encodeURIComponent(a.email);
	subject = encodeURIComponent(subject);
	let body = encodeURIComponent(getBody(b.name, b.address));

	switch (target) {
		case EmailTarget.local:
			{
				let url = `mailto:${email}?subject=${subject}&body=${body}`;
				(window.location as any).href = url;
			}
			break;
		case EmailTarget.gmail:
			{
				let url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
				window.open(url, "_blank");
			}
			break;
		default:
			return;
	}
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

function getMatchups(
	players: IPlayer[],
	exclusions: IPair[],
	oneWay: boolean
): IResultPair[] {
	if (players.length < 2) {
		return [];
	}

	shuffle([...players]);
	let tempPlayers =
		getFirstPermutation(players, (tempPlayers: IPlayer[]) => {
			let matchups = playersToMatchups(tempPlayers);
			return validMatchups(matchups, exclusions, oneWay);
		}) || [];

	if (tempPlayers && tempPlayers.length > 1) {
		let matchups = playersToMatchups(tempPlayers);
		return matchups.sort((a, b) => a.a - b.a);
	} else {
		return [];
	}
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

	if (players.length > 1) {
		matchups.push({
			a: players[players.length - 1].id,
			b: players[0].id,
			id: getPairId(),
		});
	}

	return matchups;
}

function validMatchups(
	matchups: IResultPair[],
	exclusions: IPair[],
	oneWay: boolean
) {
	for (let matchup of matchups) {
		let exclusion = exclusions.find(
			(exclusion) =>
				(matchup.a === exclusion.a && matchup.b === exclusion.b) ||
				(!oneWay && matchup.a === exclusion.b && matchup.b === exclusion.a)
		);

		if (exclusion) {
			return false;
		}
	}
	return true;
}

// thanks SO: https://stackoverflow.com/a/60136724/13707438
function getFirstPermutation<T>(
	arr: T[],
	isValid: (players: T[]) => boolean,
	perms: T[][] = [],
	len = arr.length
): T[] {
	if (len === 1) {
		let temp = arr.slice(0);
		if (isValid(temp)) {
			return temp;
		}
	}

	for (let i = 0; i < len; i++) {
		let temp = getFirstPermutation(arr, isValid, perms, len - 1);
		if (temp) {
			return temp;
		}

		len % 2 // parity dependent adjacent elements swap
			? ([arr[0], arr[len - 1]] = [arr[len - 1], arr[0]])
			: ([arr[i], arr[len - 1]] = [arr[len - 1], arr[i]]);
	}

	return null;
}
