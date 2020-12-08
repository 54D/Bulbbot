const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	sequelize.define("GuildConfiguration", {
		Prefix: {
			type: DataTypes.STRING,
			defaultValue: process.env.PREFIX,
		},
		TrackAnalytics: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		Language: {
			type: DataTypes.STRING,
			defaultValue: "en-US",
		},
		MuteRole: {
			type: DataTypes.STRING,
		},
	});
};
