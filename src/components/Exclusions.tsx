import { Button, Dropdown, Menu, Select, Space, Table } from "antd";
import Column from "antd/lib/table/Column";
import { findExclusionsForPlayer, findPlayers, findPlayer } from "helpers";
import { IPair, IPlayer } from "interfaces";
import React from "react";
import Player from "./Player";

export default function Exclusions({
	players,
	exclusions,
	removePlayer,
	updatePlayer,
	addExclusion,
	removeExclusion,
}: {
	exclusions: IPair[];
	players: IPlayer[];
	updatePlayer: (player: IPlayer) => any;
	removePlayer: (id: number) => any;
	addExclusion: (a: number, b: number) => any;
	removeExclusion: (a: number, b: number) => any;
}) {
	return (
		<Table dataSource={players} rowKey="id" pagination={false}>
			<Column
				width="120px"
				title="Player"
				render={(player: IPlayer) => (
					<div key={player.id}>
						<Player player={player} updatePlayer={updatePlayer} />
					</div>
				)}
			/>

			<Column
				title="Excluding"
				render={(player: IPlayer) => (
					<div key={player.id} className="exclude-column">
						<ShowDropdown
							players={findPlayers(players, exclusions, player.id)}
							onChange={(id) => addExclusion(player.id, id)}
						/>

						{findExclusionsForPlayer(players, exclusions, player.id).map(
							(id) => (
								<Button
									key={id}
									onClick={() => {
										removeExclusion(player.id, id);
									}}
								>
									{findPlayer(players, id).name}
								</Button>
							)
						)}
					</div>
				)}
			/>

			<Column
				title=""
				width="100px"
				align="right"
				render={(player, _, index) =>
					index < players.length - 1 ? (
						<Button onClick={() => removePlayer(player.id)}>Remove</Button>
					) : (
						""
					)
				}
			/>
		</Table>
	);
}

function ShowDropdown({
	players,
	onChange,
}: {
	players: IPlayer[];
	onChange: (id: number) => any;
}) {
	const disabled = !players || players.length === 0;

	const menu = (
		<Menu>
			{players.map((player) => (
				<Menu.Item key={player.id}>
					<a onClick={() => onChange(player.id)}>{player.name}</a>
				</Menu.Item>
			))}
		</Menu>
	);

	return (
		<Dropdown overlay={menu} disabled={disabled}>
			<Button className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
				Exclude
			</Button>
		</Dropdown>
	);
}
