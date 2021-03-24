const Discord = require("discord.js");
const Command = require("./../../structures/Command");
const { NonDigits } = require("../../utils/Regex");
const { getOffenderInfractions } = require("../../utils/InfractionUtils");

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: "Returns some useful info about a user",
			category: "Information",
			aliases: ["whois", "info", "user"],
			usage: "!userinfo [user]",
			examples: ["userinfo", "userinfo 190160914765316096", "userinfo @mrphilip#0001"],
			clearance: 50,
			maxArgs: 1,
			clientPerms: ["EMBED_LINKS", "USE_EXTERNAL_EMOJIS"],
		});
	}

	async run(message, args) {
		let target;
		if (args[0] === undefined) target = message.author.id;
		else target = args[0].replace(NonDigits, "");
		let user = message.guild.member(target);
		let isGuildMember = true;

		if (!user) {
			try {
				user = await this.client.users.fetch(target);
			} catch (error) {
				return message.channel.send(await this.client.bulbutils.translate("global_user_not_found"));
			}
			isGuildMember = false;
		}

		user = await this.client.bulbutils.userObject(isGuildMember, user);
		let description = "";

		if (user.flags !== null) description += this.client.bulbutils.badges(user.flags.bitfield) + "\n";

		description += await this.client.bulbutils.translate("userinfo_embed_id", { user_id: user.id });
		description += await this.client.bulbutils.translate("userinfo_embed_username", { user_name: user.username });
		if (user.nickname !== null) description += await this.client.bulbutils.translate("userinfo_embed_nickname", { user_nickname: user.nickname });
		description += await this.client.bulbutils.translate("userinfo_embed_profile", { user_id: user.id });
		description += await this.client.bulbutils.translate("userinfo_embed_avatar", { user_avatar: user.avatarUrl });
		description += await this.client.bulbutils.translate("userinfo_embed_bot", { user_bot: user.bot });
		description += await this.client.bulbutils.translate("userinfo_embed_created", { user_age: user.createdAt });

		if (user.premiumSinceTimestamp > 0)
			description += await this.client.bulbutils.translate("userinfo_embed_premium", { user_premium: user.premiumSinceTimestamp });

		if (user.joinedTimestamp !== undefined)
			description += await this.client.bulbutils.translate("userinfo_embed_joined", { user_joined: user.joinedTimestamp });

		if (user.roles !== undefined)
			description += await this.client.bulbutils.translate("userinfo_embed_roles", { user_roles: user.roles._roles.map(r => `${r}`).join(", ") });

		const infs = await getOffenderInfractions(message.guild.id, user.id);
		description += await this.client.bulbutils.translate("userinfo_embed_infractions", { user_infractions: infs.length });

		let color;
		if (user.roles === undefined || user.roles.highest.name === "@everyone") color = global.config.embedColor;
		else color = user.roles.highest.hexColor;

		const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setThumbnail(user.avatarUrl)
			.setAuthor(`${user.username}#${user.discriminator}`, user.avatarUrl)
			.setDescription(description)
			.setFooter(
				await this.client.bulbutils.translate("global_executed_by", {
					user_name: await this.client.bulbutils.userObject(true, message.member).username,
					user_discriminator: await this.client.bulbutils.userObject(true, message.member).discriminator,
				}),
				await this.client.bulbutils.userObject(true, message.member).avatarUrl,
			)
			.setTimestamp();

		return message.channel.send(embed);
	}
};
