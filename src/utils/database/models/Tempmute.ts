import { DataTypes, Sequelize } from "sequelize";

export default function (sequelize: Sequelize): void {
	sequelize.define("tempmute", {
		targetTag: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		targetId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		gId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		reason: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		expireTime: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
	});
}
