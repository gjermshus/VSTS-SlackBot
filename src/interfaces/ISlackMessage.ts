export interface ISlackMessage {
    id: number;
    type: string;
    channel: string;
    text: string;
    username: string;
    mrkdwn: boolean;
    user: string;
    bot_id: string;
    is_bot: boolean;
}