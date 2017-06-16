import * as Bot from "slackbots";
import { ISlackAttachment, ISlackAttachments } from "../interfaces/ISlackAttachment";
import { IVSTSBotConfig } from "../interfaces/IVSTSBotConfig";
import { ISlackMessage } from "../interfaces/ISlackMessage";
import { VSTSService } from "./VSTSService";
import { WorkItem } from "vso-node-api/interfaces/WorkItemTrackingInterfaces";

export class VSTSBot extends Bot {
    private user: any;
    private name: string;
    private vsts: VSTSService;
    private config: IVSTSBotConfig;
    private _colors = {
        "Bug": "cc293d",
        "Epic": "ff7b00",
        "Feature": "773b93",
        "Impediment": "b4009e",
        "Change Request": "b4009e",
        "Review": "b4009e",
        "Risk": "b4009e",
        "Issue": "b4009e",
        "Product Backlog Item": "009ccc",
        "User Story": "009ccc",
        "Requirement": "009ccc",
        "Task": "f2cb1d",
        "Test Case": "004b50",
        "Test Plan": "004b50",
        "Test Suite": "004b50",
    };

    constructor(config: IVSTSBotConfig) {
        super({ token: config.SlackToken, name: config.BotName });
        this.vsts = new VSTSService(config);
        this.name = config.BotName.toLowerCase();
        this.config = config;
    }

    Run(): void {
        super.on("start", this.onStart);
        super.on("message", this.onMessage);
    }

    private onStart(): void {
        this.user = super.getUsers()._value.members.filter(f => f.name.toLowerCase() === this.name)[0];
        if (this.user === undefined) {
            throw new Error("Bot user not found in Slack team directory, have you spelled my name right?");
        }
        return;
    }

    private async onMessage(message: ISlackMessage): Promise<void> {
        if (this.isChatMessage(message) && (this.isChannelConversation(message) || this.isPrivateMessage(message)
            || this.isGroupMessage(message)) && !this.isFromBot(message) && this.isVSTSMessage(message.text)) {

            let witIds: Array<number> = this.extractWitId(message.text);
            console.log("Message received");
            let attachments: Array<ISlackAttachment> = new Array<ISlackAttachment>();

            for (let witId of witIds) {
                try {
                    console.log("Looking up Work Item with Id: " + witId);
                    let wit: WorkItem = await this.vsts.GetWorkItem(witId);
                    let t: string = wit.fields["System.WorkItemType"] in this._colors
                        ? this._colors[wit.fields["System.WorkItemType"]] : "ccc";

                    let msgAttachment: ISlackAttachment = {
                        color: "#" + t,
                        title_link:
                        `https://${this.config.VSTSDomain}.visualstudio.com/${wit.fields["System.TeamProject"]}/_workitems/edit/${wit.id}`,
                        title: wit.fields["System.Title"],
                        fields: [
                            {
                                title: "Type",
                                value: wit.fields["System.WorkItemType"],
                                short: true
                            },
                            {
                                title: "Id",
                                value: witId,
                                short: true
                            },
                            {
                                title: "State",
                                value: wit.fields["System.State"],
                                short: true
                            },
                            {
                                title: "Tags",
                                value: wit.fields["System.Tags"],
                                short: true
                            },
                            {
                                title: "Area Path",
                                value: wit.fields["System.AreaPath"],
                                short: true
                            },
                            {
                                title: "Iteration Path",
                                value: wit.fields["System.IterationPath"],
                                short: true
                            },
                            {
                                title: "Created By",
                                value: wit.fields["System.CreatedBy"].replace(/<[^>]+>/g, ""),
                                short: true
                            },
                            {
                                title: "Assigned To",
                                value: (wit.fields["System.AssignedTo"]) == null ?
                                    "Unassigned" : wit.fields["System.AssignedTo"].replace(/<[^>]+>/g, ""),
                                short: true
                            },
                        ]
                    };

                    attachments.push(msgAttachment);
                } catch (exception) {
                    return;
                }
            }

            let attachmentsContainer: ISlackAttachments = { attachments: attachments };
            console.log("Posting message");
            super.postMessage(message.channel, "", attachmentsContainer);
        }

        return;
    }

    private isVSTSMessage(message: string): boolean {
        let test: boolean = /#(\d+)/.test(message);
        return test;
    }

    private extractWitId(message: string): Array<number> {
        let m: string[] = message.match(/#(\d+)/g);
        let res: Array<number> = new Array<number>();
        for (let element of m) {
            let n: number = Number(element.replace("#", ""));
            if (res.indexOf(n) === -1) {
                res.push(Number(element.replace("#", "")));
            }
        }
        return res;
    }

    private isChatMessage(message: ISlackMessage): boolean {
        return message.type === "message" && Boolean(message.text);
    }

    private isChannelConversation(message: ISlackMessage): boolean {
        return typeof message.channel === "string" && message.channel[0] === "C";
    }

    private isFromBot(message: ISlackMessage): boolean {
        return message.is_bot || message.user === this.user.id || Boolean(message.bot_id);
    }

    private isPrivateMessage(message: ISlackMessage): boolean {
        return typeof message.channel === "string" && message.channel[0] === "D";
    }

    private isGroupMessage(message: ISlackMessage): boolean {
        return typeof message.channel === "string" && message.channel[0] === "G";
    }
}