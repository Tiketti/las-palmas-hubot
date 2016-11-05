# laspalmas

**laspalmas** is a chat bot built on the [Hubot][hubot] framework. It was
initially generated by [generator-hubot][generator-hubot], and configured to be
deployed on [Heroku][heroku] to get you up and running as quick as possible.

This README is intended to help get you started. Definitely update and improve
to talk about your own instance, how to use and deploy, what functionality is
available, etc!

[heroku]: http://www.heroku.com
[hubot]: http://hubot.github.com
[generator-hubot]: https://github.com/github/generator-hubot

## Running laspalmas Locally

You can test your hubot by running the following, however some plugins will not
behave as expected unless the [environment variables](#configuration) they rely
upon have been set.

You can start laspalmas locally by running:

    % bin/hubot

You'll see some start up output and a prompt:

    [Sat Feb 28 2015 12:38:27 GMT+0000 (GMT)] INFO Using default redis on localhost:6379
    laspalmas>

Then you can interact with laspalmas by typing `laspalmas help`.

    laspalmas photo 

    laspalmas help - Displays all of the help commands that laspalmas knows about. Including the default Hubot commands
    ...


## Configuration

The following environment variables should be set:

    DROPBOX_TOKEN
Access token for Dropbox folder

    HUBOT_FLOWDOCK_API_TOKEN
Access token for Flowdock bot's account

    DARK_SKY_TOKEN
Access token for Dark Sky (formerly forecast.io) API

Installing Xcode and its command line tools is a prerequisite for node-gyp to function. Please see [here][node-gyp] for more details.

[node-gyp]: https://github.com/nodejs/node-gyp

## Heroku and local environment

If you are running bot in Heroku, make sure environment variables are set as described above. Then run: 

     % heroku run bin/hubot

to start bot with Shell adapter.

## Joining channels

You can use your bot's user accound to join any channels you wish the bot to listen to.

**Note!** The bot script has to be restarted for the changes to take effect.  

## Debugging scripts

    exec node_modules/.bin/coffee --nodejs --debug node_modules/.bin/hubot --name "laspalmas" "$@"

And use the default `attach` debugging task of VSCode. Example:

```javascript
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to bot",
      "type": "node",
      "request": "attach",
      "port": 5858,
      "restart": false,
      "sourceMaps": false,
      "outDir": null,
      "localRoot": "${workspaceRoot}"
    }
  ]
}
```


## Deployment

    % heroku create --stack cedar
    % git push heroku master

If your Heroku account has been verified you can run the following to enable
and add the Redis to Go addon to your app.

    % heroku addons:add redistogo:nano

If you run into any problems, checkout Heroku's [docs][heroku-node-docs].

You'll need to edit the `Procfile` to set the name of your hubot.

More detailed documentation can be found on the [deploying hubot onto
Heroku][deploy-heroku] wiki page.

### Deploying to UNIX or Windows

[heroku-node-docs]: http://devcenter.heroku.com/articles/node-js
[deploy-heroku]: https://github.com/github/hubot/blob/master/docs/deploying/heroku.md

## Restart the bot

You may want to get comfortable with `heroku logs` and `heroku restart` if
you're having issues.
