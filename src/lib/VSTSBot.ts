import * as Bot from "slackbots";
import { ISlackAttachment } from "../interfaces/ISlackAttachment";
import { ISlackField } from "../interfaces/ISlackField";
import { IVSTSBotConfig } from "../interfaces/IVSTSBotConfig";
import { ISlackMessage } from "../interfaces/ISlackMessage";
import { VSTSService } from "./VSTSService";
import { WorkItem } from "vso-node-api/interfaces/WorkItemTrackingInterfaces";

export class VSTSBot extends Bot {
    private user: any;
    private name: string;
    private vsts: VSTSService;
    private config: IVSTSBotConfig;

    constructor(config: IVSTSBotConfig) {
        super({token: config.SlackToken, name: config.BotName});
        this.vsts = new VSTSService(config);
        this.name = config.BotName.toLowerCase();
        this.config = config;
    }

    Run(): void {
        super.on("start", this.onStart);
        super.on("message", this.onMessage);
    }

    private onStart(): void {
        this.user = super.getUsers()._value.members.filter(f => f.name === this.name)[0];
        return;
    }

    private async onMessage(message: ISlackMessage): Promise<void> {
        if (this.isChatMessage(message) &&  this.isChannelConversation(message) &&
        !this.isFromBot(message) && this.isVSTSMessage(message.text)) {

                let witIds: Array<number> = this.extractWitId(message.text);
                let channelName: any = this.GetChannelById(message.channel);

                for (let witId of witIds) {
                    try {
                        let wit: WorkItem = await this.vsts.GetWorkItem(witId);
                        let state: string = wit.fields["System.State"];
                        let title: string = wit.fields["System.Title"];
                        let cb: string = wit.fields["System.CreatedBy"].replace(/<[^>]+>/g, "");
                        let at: string = (wit.fields["System.AssignedTo"]) == null ?
                                        "Unassigned" : wit.fields["System.AssignedTo"].replace(/<[^>]+>/g, "");
                        let ap: string = wit.fields["System.AreaPath"];
                        let t: string = wit.fields["System.WorkItemType"] === "Bug" ?
                        "cc293d" : wit.fields["System.WorkItemType"] === "Task" ? "f2cb1d" : "009ccc";
                        let type: string = wit.fields["System.WorkItemType"];
                        let msg: string = `>>> *${type}*: #${wit.id}, *State*: ${state} 
    *AreaPath*: ${ap}\n
    *Title* : ${title}\n
    *Assigned to*: ${at}, *Created By*: ${cb}\n
    *View / Edit ${type}* : 
    https://${this.config.VSTSDomain}.visualstudio.com/${this.config.VSTSTeamProject}/_workitems/edit/${wit.id}`;
                        let msgAttachment: ISlackAttachment = {
                            color: "#" + t
                        };
                        super.postMessageToChannel(channelName.name, msg, {attachments: msgAttachment});
                    } catch (exception) {
                        return;
                    }
                }
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
            res.push(Number(element.replace("#", "")));
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

    private GetChannelById(channelId: string | number): string {
        return super.getChannels()._value.channels.filter(ch => ch.id === channelId)[0];
    }
};
