import { DownOutlined } from "@ant-design/icons";
import TextareaAutosize from "react-textarea-autosize";
import { Button, Card, Dropdown, Input, Menu, Radio, Space, Table } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Column from "antd/lib/table/Column";
import {
	cleanedObject,
	encrypt,
	findPlayer,
	pairHasEmail,
	playerIsEmpty,
} from "helpers";
import { IImportFile, IPair, IPlayer } from "interfaces";
import React, { useEffect, useState } from "react";
import shuffle from "shuffle-array";
import { getPairId, showErrorToast, showToast } from "utils";

interface IResultPair extends IPair {
	visible?: boolean;
}

enum DISPLAYS {
	links,
	links_raw,
	email,
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
	const [matchupsString, setMatchupsString] = useState("");
	const [displayMode, setDisplayMode] = useState(DISPLAYS.links);

	useEffect(() => {
		setMatchupsString(getMatchupsString(matchups, players));
	}, [players, matchups]);

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

			let contents: IImportFile = {
				version: 1.0,
				previous_matchups: matchups
					.map((pair) => {
						let a = findPlayer(players, pair.a);
						let b = findPlayer(players, pair.b);
						if (a && b) {
							return [a.name, b.name];
						} else {
							return null;
						}
					})
					.filter((pair) => pair),
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
							sendEmail(
								players,
								pair,
								subject,
								EmailTarget.gmail
							);
						} else {
							for (let matchup of matchups) {
								sendEmail(
									players,
									matchup,
									subject,
									EmailTarget.gmail
								);
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
							sendEmail(
								players,
								pair,
								subject,
								EmailTarget.local
							);
						} else {
							for (let matchup of matchups) {
								sendEmail(
									players,
									matchup,
									subject,
									EmailTarget.local
								);
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
				Sorry, I couldn't find any valid arrangements. You'll need to
				either remove some restrictions or add more people to the pool.
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
							showToast("Recalculated!");
							setRecalculateCounter(recalculateCounter + 1);
						}}
					>
						Recalculate
					</Button>
					<Dropdown
						overlay={getMenu()}
						trigger={["click"]}
						disabled={!canEmailAll}
					>
						<Button onClick={(e) => e.preventDefault()}>
							Email all <DownOutlined />
						</Button>
					</Dropdown>

					<Radio.Group
						value={displayMode}
						onChange={(value) => {
							setDisplayMode(value.target.value as DISPLAYS);
						}}
					>
						<Radio.Button value={DISPLAYS.links}>
							Links View
						</Radio.Button>
						<Radio.Button value={DISPLAYS.links_raw}>
							Raw Links View
						</Radio.Button>
						<Radio.Button value={DISPLAYS.email}>
							Email View
						</Radio.Button>
					</Radio.Group>

					<Button onClick={exportToFile}>Export</Button>
				</Space>
			</Card>

			{displayMode === DISPLAYS.links ? (
				<Table
					dataSource={matchups}
					pagination={false}
					rowKey="id"
					className="fancy-table"
				>
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
						title="Link"
						width="50%"
						render={(pair: IResultPair) => {
							let target = findPlayer(players, pair.b);
							let linkUrl = calculateLinkUrl(target);
							if (displayMode === DISPLAYS.links) {
								return (
									<a href={linkUrl} target="_blank">
										Link
									</a>
								);
							}
						}}
					/>
				</Table>
			) : null}

			{displayMode === DISPLAYS.links_raw ? (
				<Card>
					<CopyToClipboard
						text={matchupsString}
						onCopy={() => showToast("Copied!")}
					>
						<Button>Copy to Clipboard</Button>
					</CopyToClipboard>
					<TextareaAutosize
						className="full-width"
						style={{ width: "100%" }}
						readOnly
						value={matchupsString}
					/>
				</Card>
			) : null}

			{displayMode === DISPLAYS.email ? (
				<>
					<Button onClick={toggleShowAll}>
						{showAll ? "Hide all" : "Show all"}
					</Button>
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
												helper(
													matchups,
													setMatchups,
													pair,
													{
														...pair,
														visible: !pair.visible,
													}
												)
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
										<Button
											onClick={(e) => e.preventDefault()}
										>
											Email <DownOutlined />
										</Button>
									</Dropdown>
								</Space>
							)}
						/>
					</Table>
				</>
			) : null}
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
				(!oneWay &&
					matchup.a === exclusion.b &&
					matchup.b === exclusion.a)
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

function calculateLinkUrl(targetPlayer: IPlayer): string {
	let url = new URL(location.pathname, location.href).href;
	let clean = cleanedObject(targetPlayer);
	let data = encrypt(clean);
	return `${url}?secret=${encodeURIComponent(data)}`;
}

function getMatchupsString(matchups: IPair[], players: IPlayer[]): string {
	return matchups
		.map((pair) => {
			let gifter = findPlayer(players, pair.a);
			let giftee = findPlayer(players, pair.b);
			let link = calculateLinkUrl(giftee);
			return `${gifter.name}\n${link}`;
		})
		.join("\n\n");
}
