import { IVSTSBotConfig } from "./interfaces/IVSTSBotConfig";
import { VSTSBot } from "./lib/VSTSBot";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

console.log("VSTSBot is starting");

let config: IVSTSBotConfig;

if (existsSync(join(__dirname,"config.json"))) {
    let fileContent: string = readFileSync(join(__dirname, "config.json"), "utf8");
    config = JSON.parse(fileContent);
}

let runConfig: IVSTSBotConfig = {
    BotName: process.env.BotName || config.BotName,
    SlackToken: process.env.SlackToken || config.SlackToken,
    VSTSTeamProject: process.env.VSTSTeamProject || config.VSTSTeamProject,
    VSTSUsername: process.env.VSTSUsername || config.VSTSUsername,
    VSTSPassword: process.env.VSTSPassword || config.VSTSPassword,
    VSTSDomain: process.env.VSTSDomain || config.VSTSDomain,
    VSTSToken: process.env.VSTSToken || config.VSTSToken
};

var bot: VSTSBot = new VSTSBot(runConfig);
bot.Run();