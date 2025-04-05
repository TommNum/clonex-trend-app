import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
    id: string;
    username: string;
    name: string;
    profile_image_url: string;
    access_token: string;
    refresh_token: string;
    tweets: string[]; // Store tweets as JSON array
    last_tweet_fetch: Date;
    created_at: Date;
    updated_at: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
    public id!: string;
    public username!: string;
    public name!: string;
    public profile_image_url!: string;
    public access_token!: string;
    public refresh_token!: string;
    public tweets!: string[];
    public last_tweet_fetch!: Date;
    public created_at!: Date;
    public updated_at!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profile_image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        access_token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        refresh_token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tweets: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        last_tweet_fetch: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        underscored: true,
    }
); 