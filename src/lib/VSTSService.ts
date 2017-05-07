import * as vsts from "vso-node-api";
import * as ba from "vso-node-api/WorkItemTrackingApi";
import { IRequestHandler } from "vso-node-api/interfaces/common/VsoBaseInterfaces";
import * as witI from "vso-node-api/interfaces/WorkItemTrackingInterfaces";  
import { IVSTSBotConfig } from "../interfaces/IVSTSBotConfig";

export class VSTSService {
    connect: vsts.WebApi;
    private authHandler: IRequestHandler;
    private vsts: ba.IWorkItemTrackingApi;
    private collectionUrl: string = "https://{VSTSDomain}.visualstudio.com/DefaultCollection";

    constructor (config: IVSTSBotConfig) {
        this.collectionUrl = this.collectionUrl.replace("{VSTSDomain}", config.VSTSDomain);
        if (config.VSTSToken === undefined || config.VSTSToken === "") {
            this.authHandler = vsts.getBasicHandler(config.VSTSUsername, config.VSTSPassword);
        } else {
            this.authHandler = vsts.getPersonalAccessTokenHandler(config.VSTSToken);
        }
        
        this.connect = new vsts.WebApi(this.collectionUrl, this.authHandler);
        this.vsts = this.connect.getWorkItemTrackingApi();
    }

    async GetWorkItems(witIds: number[]): Promise<witI.WorkItem[]> {
        let items: witI.WorkItem[] = await this.vsts.getWorkItems(witIds);
        return items;
    }

    async GetWorkItem(witId: number): Promise<witI.WorkItem> {
        let item: witI.WorkItem = await this.vsts.getWorkItem(witId);
        return item;
    }
}