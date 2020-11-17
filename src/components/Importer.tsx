import { Button, Upload } from "antd";
import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { playerIsEmpty, findPlayerByName } from "helpers";
import { IPlayer, IPair, IImportFile } from "interfaces";
import { getPairId, getPlayerId, showErrorToast, showToast } from "utils";

interface IOnImport {
	(newPlayers: IPlayer[], newExclusions: IPair[]): any;
}

interface IImporter {
	onImport: IOnImport;
}

export default function Importer({ onImport }: IImporter) {
	return (
		<Upload
			accept=".json"
			multiple={false}
			showUploadList={false}
			beforeUpload={(file) => {
				const reader = new FileReader();

				reader.onload = (e) => {
					parseFile(e.target.result as string, onImport);
				};
				reader.readAsText(file);

				// Prevent upload
				return false;
			}}
		>
			<Button icon={<UploadOutlined />}>Import</Button>
		</Upload>
	);
}

function parseFile(contentsStr: string, onSuccess: IOnImport) {
	let contents: IImportFile;
	try {
		contents = JSON.parse(contentsStr);
	} catch (e) {
		return showErrorToast("Invalid import file");
	}

	if (!contents || !contents.people || !contents.bad_pairs) {
		return showErrorToast("Invalid import file");
	} else {
		try {
			let newPlayers = contents.people
				.map(({ name, email, address }) => {
					let newPlayer = {
						name,
						email,
						address,
						id: getPlayerId(),
					};
					if (playerIsEmpty(newPlayer)) {
						showToast("Skipping a poorly configured player");
					} else {
						return newPlayer;
					}
				})
				.filter((player) => !!player);

			let newExclusions = contents.bad_pairs
				.map((pair) => {
					let a = findPlayerByName(newPlayers, pair[0]);
					let b = findPlayerByName(newPlayers, pair[1]);
					if (a && b) {
						return {
							a: a.id,
							b: b.id,
							id: getPairId(),
						};
					}
					return null;
				})
				.filter((pair) => !!pair);

			showToast("Imported successfully");
			onSuccess(newPlayers, newExclusions);
		} catch (e) {
			console.log(e);
			return showErrorToast("Error processing import file");
		}
	}
}
