'use strict';

var mumble = require('mumble');

var createTriviaBot = require('./lib/triviaBot');
var createSaySounds = require('./lib/saySounds');
var createIdleEasterEgg = require('./lib/idleEasterEgg');

var triviaBot;
var saySounds;
var idleEasterEgg;

var config;
try {
    config = require('./config.json');
    if (!config.server) {
        console.error('server must be defined in config.json!');
        process.exit(1);
    }
    config.port = config.port || 64738;
    config.botName = config.botName || 'Fun-Bot';
    config.channel = config.channel || 'Root';
    config.triviaDefaultTimelimit = config.triviaDefaultTimelimit || 30;
    config.saySoundCooldown = config.saySoundCooldown || 2;
    config.saySoundGain = config.saySoundGain || 0.3;
    config.targetBitrate = config.targetBitrate || 24000;
    config.saySoundFuzzyMatch = config.saySoundFuzzyMatch || false;
} catch(e) {
    console.error('Could not parse config.json. Please make this file (refer to readme.md).');
    process.exit(1);
}

var commands = {
    trivia: function(client, from, keepAsking, timelimit) {
        if (keepAsking !== undefined) {
            triviaBot.setKeepAsking(keepAsking === 'true');
        }

        if (timelimit !== undefined) {
            var tl = parseInt(timelimit, 10);
            if (!isNaN(tl)) {
                triviaBot.setTimeLimit(tl);
            }
        }

        triviaBot.askQuestion();
    },
    answer: function(client, from, all) {
        triviaBot.giveAnswer(from, all);
    },
    list: function(client, from) {
        var sounds = saySounds.getListOfSounds();
        client.sendChannelMessage(sounds.join('<br>'), from.actor);
    },
    stop: function() {
        saySounds.stopSound();
    },
    help: function(client, from) {
        client.sendChannelMessage([
            'Commands:',
            '!trivia [keepAsking: true | false] [question time limit: int]',
            '!answer [all] (give answer to current trivia question to you or everyone)',
            '!list (list all available saysounds)',
            '!stop (Stop current saysound)',
            '!help (display this message)'
        ].join('<br>'), from.actor);
    }
};

mumble.connect('mumble://' + config.server + ':' + config.port, function(error, client) {
    if (error) {
        throw new Error(error);
    }

    client.authenticate(config.botName);

    client.connection.setBitrate(config.targetBitrate);

    client.on('initialized', function() {
        client.sendChannelMessage = function(msg, to) {
            var options = {channel_id: [client.user.channel.id]};
            if (to) {
                delete options.channel_id;
                options.session = [to];
            }
            client.sendMessage(msg, options);
        };

        triviaBot = createTriviaBot(client, config);
        saySounds = createSaySounds(client, config);
        idleEasterEgg = createIdleEasterEgg(client, config, saySounds);

        setTimeout(function() {
            // we have to wait for some reason.
            if (config.channel !== 'Root') {
                client.user.moveToChannel(config.channel);
            }
        }, 1000);
    });

    client.on('textMessage', function(data) {
        var msg = data.message.toLowerCase().trim();
        if (msg.charAt(0) === '!') {
            var args = msg.substring(1).split(' ');
            var commandToRun = commands[args[0]];
            args.splice(0, 1, client, data);
            if (commandToRun) {
                commandToRun.apply(null, args);
            } else {
                client.sendChannelMessage('Unknown command. Type !help to see commands.');
            }
        }
    });
});
