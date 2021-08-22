import { NonDigits } from "../../../../utils/Regex";
import { Message, Snowflake } from "discord.js";
import ClearanceManager from "../../../../utils/managers/ClearanceManager";
import Command from "../../../../structures/Command";
import SubCommand from "../../../../structures/SubCommand";
import BulbBotClient from "../../../../structures/BulbBotClient";

const clearanceManager: ClearanceManager = new ClearanceManager();

export default class extends SubCommand {
	constructor(client: BulbBotClient, parent: Command) {
		super(client, parent, {
			name: "create",
			minArgs: 3,
			maxArgs: -1,
			argList: ["part:string", "name:string", "clearance:number"],
			usage: "<part> <name> <clearance>",
		});
	}

	async run(message: Message, args: string[]): Promise<void | Message> {
		const part: string = args[0];
		const name: string[] = args.slice(1, -1);
		let clearance: number = Number(args.at(-1));

		if (isNaN(clearance))
			return message.channel.send(
				await this.client.bulbutils.translate("global_cannot_convert", message.guild?.id, {
					arg_provided: clearance,
					arg_expected: "clearance:int",
					usage: this.usage,
				}),
			);
		if (clearance < 0) return message.channel.send(await this.client.bulbutils.translate("override_clearance_less_than_0", message.guild?.id, {}));
		if (clearance >= 100) return message.channel.send(await this.client.bulbutils.translate("override_clearance_more_than_100", message.guild?.id, {}));

		if (clearance > this.client.userClearance) return message.channel.send(await this.client.bulbutils.translate("override_clearance_higher_than_self", message.guild?.id, {}));

		switch (part) {
			case "role":
				if ((await clearanceManager.getCommandOverride(<Snowflake>message.guild?.id, name[0])) !== undefined)
					return await message.channel.send(await this.client.bulbutils.translate("override_already_exists", message.guild?.id, {}));
				const rTemp = message.guild?.roles.cache.get(name[0].replace(NonDigits, ""));
				if (rTemp === undefined)
					return message.channel.send({
						content: await this.client.bulbutils.translate("global_not_found", message.guild?.id, {
							type: await this.client.bulbutils.translate("global_not_found_types.role", message.guild?.id, {}),
							arg_provided: args[1],
							arg_expected: "role:Role",
							usage: this.usage,
						}),
						allowedMentions: {
							parse: ["everyone", "roles", "users"],
						},
					});

				await clearanceManager.createRoleOverride(<Snowflake>message.guild?.id, name[0].replace(NonDigits, ""), clearance);
				break;

			case "command":
				const command = Command.resolve(this.client, name);

				if (command === undefined || command.name === undefined)
					return message.channel.send({
						content: await this.client.bulbutils.translate("global_not_found", message.guild?.id, {
							type: await this.client.bulbutils.translate("global_not_found_types.cmd", message.guild?.id, {}),
							arg_provided: args[1],
							arg_expected: "command:string",
							usage: this.usage,
						}),
						allowedMentions: {
							parse: ["everyone", "roles", "users"],
						},
					});

				if ((await clearanceManager.getCommandOverride(<Snowflake>message.guild?.id, command.qualifiedName)) !== undefined)
					return await message.channel.send(await this.client.bulbutils.translate("override_already_exists", message.guild?.id, {}));

				await clearanceManager.createCommandOverride(<Snowflake>message.guild?.id, command.qualifiedName, true, clearance);
				break;
			default:
				return message.channel.send(
					await this.client.bulbutils.translate("event_message_args_missing_list", message.guild?.id, {
						arg_expected: "part:string",
						argument: args[0],
						argument_list: "`role`, `command`",
					}),
				);
		}
		await message.channel.send(await this.client.bulbutils.translate("override_create_success", message.guild?.id, { clearance }));
	}
}
