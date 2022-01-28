import * as React from "react";
import Input from "antd/lib/input";
import { IPlayer } from "../interfaces";

export default function Player({
	player,
	updatePlayer,
}: {
	player: IPlayer;
	updatePlayer: (player: IPlayer) => any;
}) {
	return (
		<div style={{ width: "200px" }}>
			<Input
				placeholder="name"
				value={player.name}
				onChange={(event) =>
					updatePlayer({ ...player, name: event.target.value })
				}
			/>
			<Input
				placeholder="email (optional)"
				value={player.email}
				onChange={(event) =>
					updatePlayer({ ...player, email: event.target.value })
				}
			/>
			<Input
				placeholder="address (optional)"
				value={player.address}
				onChange={(event) =>
					updatePlayer({ ...player, address: event.target.value })
				}
			/>
		</div>
	);
}
