import { ISlackField } from "./ISlackField";

export interface ISlackAttachment {
    fallback?: string;
    color?: string;
    pretext?: string;
    author_name?: string;
    author_link?: string;
    author_icon?: string;
    title?: string;
    title_link?: string;
    text?: string;
    fields?: Array<ISlackField>;
    image_url?: string;
    thumb_url?: string;
    footer?: string;
    footer_icon?: string;
    ts?: number;
    mrkdwn_in?: Array<string>;
}

export interface ISlackAttachments {
    attachments: Array<ISlackAttachment>;
}