import { IVSTSBotConfig } from "./interfaces/IVSTSBotConfig";
import { VSTSBot } from "./lib/VSTSBot";
import * as fs from "fs"

console.log("VSTS bot is starting");


let config: IVSTSBotConfig;

if (fs.existsSync("config.json"))
{
    config = JSON.parse("config.json");
}

config.BotName = process.env.BotName || config.BotName;
config.SlackToken = process.env.SlackToken || config.SlackToken;
config.VSTSTeamProject = process.env.VSTSTeamProject || config.VSTSTeamProject;
config.VSTSUsername = process.env.VSTSUsername || config.VSTSUsername;
config.VSTSPassword = process.env.VSTSPassword || config.VSTSPassword;
config.VSTSDomain = process.env.VSTSDomain || config.VSTSDomain;

var bot: VSTSBot = new VSTSBot(config);
bot.Run();