const { Client, Collection, Permissions, Structures } = require("discord.js");
const Util = require("./Util");
const BulbBotUtils = require("./../utils/BulbBotUtils");

const { PermissionException } = require("./exceptions/PermissionException");

module.exports = class BulbBotClient extends Client {
	constructor(options = {}) {
		super({
			disableMentions: global.config.client.disableMentions,
			fetchAllUsers: global.config.client.fetchAllUsers,
		});
		this.validate(options);

		this.commands = new Collection();
		this.aliases = new Collection();

		this.events = new Collection();

		this.utils = new Util(this);

		this.bulbutils = new BulbBotUtils(this);

		Structures.extend('GuildMember', GuildMember => {
			class GuildMemberWithPending extends GuildMember {
				pending = false;

				constructor(client, data, guild) {
					super(client, data, guild);
					this.pending = data.pending || false;
				}

				_patch(data) {
					super._patch(data);
					this.pending = data.pending || false;
				}
			}
			return GuildMemberWithPending;
		});
	}

	validate(options) {
		if (typeof options !== "object") throw new TypeError("Options must be type of Object!");

		if (!options.token) throw new Error("Client cannot log in without token!");
		this.token = options.token;

		if (!global.config.prefix) throw new Error("Client cannot log in without prefix!");
		if (typeof global.config.prefix !== "string") throw new TypeError("Prefix must be type of String!");
		this.prefix = global.config.prefix;

		if (!options.defaultPerms) throw new PermissionException("Default permissions cannot be null!");
		this.defaultPerms = new Permissions(options.defaultPerms).freeze();

		if (!options.clearance) throw new Error("Clearance level cannot be null!");
		this.clearance = options.clearance;
	}

	async login(token = this.token) {
		await this.utils.loadEvents();
		await this.utils.loadCommands();
		await super.login(token);
	}
};
