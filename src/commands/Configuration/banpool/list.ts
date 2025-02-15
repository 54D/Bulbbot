import Command from "../../../structures/Command";
import SubCommand from "../../../structures/SubCommand";
import CommandContext from "../../../structures/CommandContext";
import { Message, MessageEmbed } from "discord.js";
import BulbBotClient from "../../../structures/BulbBotClient";
import BanpoolManager from "../../../utils/managers/BanpoolManager";
import { embedColor } from "../../../Config";

const { getPools }: BanpoolManager = new BanpoolManager();
export default class extends SubCommand {
	constructor(client: BulbBotClient, parent: Command) {
		super(client, parent, {
			name: "list",
			clearance: 100,
		});
	}

	public async run(context: CommandContext, args: string[]): Promise<void | Message> {
		const data: { id: number; name: string; createdAt: Date; updatedAt: Date; guildId: number }[] = await getPools(context.guild!?.id);
		let desc: string[] = [];

		for (let i = 0; i < data.length; i++) {
			const pool = data[i];
			desc.push(
				await this.client.bulbutils.translate("banpool_list_desc", context.guild?.id, {
					name: pool.name,
					createdAt: new Date(pool.createdAt).getTime() / 1000,
				}),
			);
		}

		const embed: MessageEmbed = new MessageEmbed()
			.setColor(embedColor)
			.setDescription(desc.join("\n\n"))
			.setFooter(
				await this.client.bulbutils.translate("global_executed_by", context.guild?.id, {
					user: context.author,
				}),
				<string>context.author.avatarURL({ dynamic: true }),
			)
			.setTimestamp();

		await context.channel.send({ embeds: [embed] });
	}
}
