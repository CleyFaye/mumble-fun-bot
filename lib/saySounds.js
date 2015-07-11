'use strict';

var fs = require('fs');

var lame = require('lame');

var saySounds = {};
try {
    saySounds = require('../saySounds.json');
} catch(e) {
    console.error('Could not parse saySounds.json!');
}

var listOfSounds = Object.keys(saySounds);

var createSaysounds = function(client, config) {

    var soundCooldown = config.saySoundCooldown * 1000;
    var isPlaying = false;
    var voiceStream;

    var playSound = function(client, soundFile) {
        if (!isPlaying) {
            // enable say sound phrases to have multiple outcomes.
            if (typeof soundFile === 'object') {
                var len = soundFile.length;
                soundFile = soundFile[Math.floor(Math.random() * len)];
            }

            var stream = fs.createReadStream(soundFile);
            var decoder = new lame.Decoder();

            decoder.on('format', function(format) {
                format.gain = config.saySoundGain;
                voiceStream = client.inputStream(format);
                decoder.pipe(voiceStream);

                decoder.on('end', function(a) {
                    setTimeout(function() {
                        isPlaying = false;
                    }, soundCooldown);
                });
            });

            stream.pipe(decoder);
            isPlaying = true;
        }
    };

    var stopSound = function() {
        if (isPlaying && voiceStream) {
            voiceStream.end();
            isPlaying = false;
        }
    };

    var getListOfSounds = function() {
        return listOfSounds;
    };

    var fuzzyMatch = function(msg) {
        var len = listOfSounds.length;
        var currentSaySound;
        for (var x = 0; x < len; ++x) {
            currentSaySound = listOfSounds[x];
            if (msg.indexOf(currentSaySound) > -1) {
                return saySounds[currentSaySound];
            }
        }
    };

    client.on('textMessage', function(data) {
        var saySound;
        var msg = data.message.toLowerCase();
        if (config.saySoundFuzzyMatch) {
            saySound = fuzzyMatch(msg);
        } else {
            msg = msg.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
            saySound = saySounds[msg];
        }

        if (saySound) {
            if (!isPlaying) {
                playSound(client, saySound);
            }
        }
    });

    return {
        playSound: playSound,
        stopSound: stopSound,
        getListOfSounds: getListOfSounds
    };

};

module.exports = createSaysounds;
