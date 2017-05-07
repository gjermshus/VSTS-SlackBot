import * as vsts from "vso-node-api";
import * as ba from "vso-node-api/WorkItemTrackingApi";
import { BasicCredentialHandler } from "vso-node-api/handlers/basiccreds";
import * as witI from "vso-node-api/interfaces/WorkItemTrackingInterfaces";  
import { IVSTSBotConfig } from "../interfaces/IVSTSBotConfig";

export class VSTSService {
    connect: vsts.WebApi;
    private authHandler: BasicCredentialHandler;
    private vsts: ba.IWorkItemTrackingApi;
    private collectionUrl: string = "https://{VSTSDomain}.visualstudio.com/DefaultCollection";

    constructor (config: IVSTSBotConfig) {
        this.collectionUrl = this.collectionUrl.replace("{VSTSDomain}", config.VSTSDomain);
        this.authHandler = vsts.getBasicHandler(config.VSTSUsername, config.VSTSPassword);
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