import { IVSTSBotConfig } from '../interfaces/IVSTSBotConfig';
import { VSTSService } from './VSTSService';
import { WorkItem } from 'vso-node-api/interfaces/WorkItemTrackingInterfaces';
import { Log } from './Logger';
import * as Botkit from 'botkit';

export class VSTSBot {
    private vsts: VSTSService;
    private config: IVSTSBotConfig;
    private _colors = {
        Bug: 'cc293d',
        Epic: 'ff7b00',
        Feature: '773b93',
        Impediment: 'b4009e',
        'Change Request': 'b4009e',
        Review: 'b4009e',
        Risk: 'b4009e',
        Issue: 'b4009e',
        'Product Backlog Item': '009ccc',
        'User Story': '009ccc',
        Requirement: '009ccc',
        Task: 'f2cb1d',
        'Test Case': '004b50',
        'Test Plan': '004b50',
        'Test Suite': '004b50'
    };
    private _controller: Botkit.SlackController;
    private _bot: Botkit.SlackBot;

    constructor(config: IVSTSBotConfig) {
        this.vsts = new VSTSService(config);
        this.config = config;
        let botconfig: Botkit.SlackConfiguration = {
            clientId: config.SlackToken,
            debug: config.DebugMode || false
        };

        this._controller = Botkit.slackbot(botconfig);
    }

    Run(): void {
        this._bot = this._controller
            .spawn({ token: this.config.SlackToken })
            .startRTM((err: string, bot: Botkit.SlackBot, payload: any) => {
                if (err) {
                    throw new Error(err);
                }
            });

        this._controller.hears(
            '#(\\d+)',
            ['ambient', 'direct_mention', 'mention', 'direct_message'],
            (bot: Botkit.SlackBot, msg: Botkit.SlackMessage) => {
                console.log('Message received', msg.text);
                this.getAnswer(msg)
                    .then(
                        responseMessage => bot.reply(msg, responseMessage),
                        (reason: any) => Log(reason)
                    )
                    .catch(reason => Log(reason));
            }
        );

        this._controller.on('rtm_open', (bot: Botkit.SlackBot) => {
            Log('RTM connected');
        });

        this._controller.on('rtm_close', (bot: Botkit.SlackBot) => {
            Log('RTM disconnected, ending process');
            process.exit(1);
        });
    }

    private async getAnswer(
        message: Botkit.SlackMessage
    ): Promise<Botkit.SlackMessage> {
        let witIds: Array<number> = this.extractWitId(message.text);
        let attachments: Array<Botkit.SlackAttachment> = new Array<
            Botkit.SlackAttachment
        >();

        for (let witId of witIds) {
            try {
                Log('Looking up Work Item with Id: ' + witId);
                let wit: WorkItem = await this.vsts.GetWorkItem(witId);
                let t: string =
                    wit.fields['System.WorkItemType'] in this._colors
                        ? this._colors[wit.fields['System.WorkItemType']]
                        : 'ccc';

                let msgAttachment: Botkit.SlackAttachment = {
                    color: '#' + t,
                    title_link: `https://${
                        this.config.VSTSDomain
                    }.visualstudio.com/${
                        wit.fields['System.TeamProject']
                    }/_workitems/edit/${wit.id}`,
                    title: wit.fields['System.Title'],
                    fields: [
                        {
                            title: 'Type',
                            value: wit.fields['System.WorkItemType'],
                            short: true
                        },
                        {
                            title: 'Id',
                            value: witId,
                            short: true
                        },
                        {
                            title: 'State',
                            value: wit.fields['System.State'],
                            short: true
                        },
                        {
                            title: 'Tags',
                            value: wit.fields['System.Tags'],
                            short: true
                        },
                        {
                            title: 'Area Path',
                            value: wit.fields['System.AreaPath'],
                            short: true
                        },
                        {
                            title: 'Iteration Path',
                            value: wit.fields['System.IterationPath'],
                            short: true
                        },
                        {
                            title: 'Created By',
                            value: wit.fields['System.CreatedBy'].replace(
                                /<[^>]+>/g,
                                ''
                            ),
                            short: true
                        },
                        {
                            title: 'Assigned To',
                            value:
                                wit.fields['System.AssignedTo'] == null
                                    ? 'Unassigned'
                                    : wit.fields['System.AssignedTo'].replace(
                                          /<[^>]+>/g,
                                          ''
                                      ),
                            short: true
                        }
                    ]
                };

                attachments.push(msgAttachment);
            } catch (exception) {
                throw new Error(exception);
            }
        }

        let ret: Botkit.SlackMessage = {
            attachments: attachments,
            channel: message.channel
        };

        return ret;
    }

    private extractWitId(message: string): Array<number> {
        let m: string[] = message.match(/#(\d+)/g);
        let res: Array<number> = new Array<number>();
        for (let element of m) {
            let n: number = Number(element.replace('#', ''));
            if (res.indexOf(n) === -1) {
                res.push(Number(element.replace('#', '')));
            }
        }
        return res;
    }
}
