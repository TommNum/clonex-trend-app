import { User } from '../models/User';
import { XApiService } from './xApiService';

export class UserService {
    private xApiService: XApiService;

    constructor() {
        this.xApiService = new XApiService();
    }

    async findOrCreateUser(userData: {
        id: string;
        username: string;
        name: string;
        profile_image_url: string;
        access_token: string;
        refresh_token: string;
    }): Promise<User> {
        const [user] = await User.findOrCreate({
            where: { id: userData.id },
            defaults: {
                ...userData,
                tweets: [],
                last_tweet_fetch: null,
            },
        });

        return user;
    }

    async updateUserTokens(userId: string, accessToken: string, refreshToken: string): Promise<void> {
        await User.update(
            { access_token: accessToken, refresh_token: refreshToken },
            { where: { id: userId } }
        );
    }

    async getUserTweets(userId: string, forceRefresh: boolean = false): Promise<string[]> {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        // If we have tweets and they're not too old (e.g., less than 24 hours), return them
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        if (!forceRefresh && user.tweets.length > 0 && user.last_tweet_fetch && user.last_tweet_fetch > oneDayAgo) {
            console.log(`Returning cached tweets for user ${userId}`);
            return user.tweets;
        }

        // Fetch new tweets
        console.log(`Fetching new tweets for user ${userId}`);
        const tweets = await this.xApiService.getUserTweets(user.access_token, userId);

        // Update user with new tweets
        await User.update(
            {
                tweets,
                last_tweet_fetch: now
            },
            { where: { id: userId } }
        );

        return tweets;
    }

    async getUserById(userId: string): Promise<User | null> {
        return User.findByPk(userId);
    }
} 