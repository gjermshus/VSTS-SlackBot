[![Build Status](https://travis-ci.org/gjermshus/VSTS-SlackBot.svg?branch=master)](https://travis-ci.org/gjermshus/VSTS-SlackBot)

# VSTS-SlackBot
Post info from Work Items in Visual Studio Team Services if a Work Item is mentioned in a channel, group chat or private message

## How the bot works
The bot will listen to messages in all channels it's a member of. The bot will extract all accourances of a hashtag (#) followed by a number and search VSTS for this Work Item Id. If it get any matches it will return basic information from each of the items found.

The bot also supports groups messages and direct messages.

## Set up bot
A couple of settings are needed for the bot to communicate with both Slack and VSTS. 
1. Goto your Slack site and add a new Bot user and obtain a Slack token.
2. Goto Visual Studio Team Services and obtain a Personal Token a user that has necessary access rights to the work part of VSTS

Use the tokens obtained to start a instance of vsts-slackbot.

### Other settings
> `BotName` - Name of the bot in your Slack Directory.   
`SlackToken` - Token obtained with access to Slack.  
`VSTSToken` - Token obtained with access to VSTS  
`VSTSDomain` - The subdomain to your VSTS account

Alternative for VSTS token is to use alternative user credentials. In that case switch `VSTSToken` with  
> `VSTSUsername` - Username to VSTS account  
`VSTSPassword` - Password set as alternative credentials for VSTS account

### Run standalone
To run this bot in a console or as a standalone program a `config.json` file need to be provided at the root folder of the bot. Example of a `config.json` file
```json
{
    "BotName": "",
    "SlackToken": "",
    "VSTSDomain": "",
    "VSTSToken": "",
}
```

### Run as container
The following command starts a container with the vsts-slackbot. `--name` and `--restart-always` are optional.

```
 docker run -it -d --name <name> --restart=always -e BotName=<name in slack> -e SlackToken=<SlackToken> -e VSTSToken=<VSTSToken> -e VSTSDomain=<VSTSSubDomain> gjermshus/vsts-slackbot:latest

```
