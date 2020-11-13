import * as React from "react";
import { Input, Space } from "antd";
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
			{/* <Space> */}
			<Input
				placeholder="name"
				value={player.name}
				onChange={(event) =>
					updatePlayer({ ...player, name: event.target.value })
				}
			/>
			<Input
				placeholder="email"
				value={player.email}
				onChange={(event) =>
					updatePlayer({ ...player, email: event.target.value })
				}
			/>
			{/* </Space> */}
		</div>
	);
}
