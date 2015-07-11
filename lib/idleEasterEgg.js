'use strict';

var createIdleEasterEgg = function(client, config, saySounds) {
    var idleEasterEgg;
    var idleEasterEggMult = 1;

    var playIdleEasterEgg = function() {
        idleEasterEggMult *= 2;
        var len = config.idleEasterEggs.length;
        var choose = Math.floor(Math.random() * len);
        saySounds.playSound(client, config.idleEasterEggs[choose]);
        setupIdleEasterEgg(client);
    };

    var setupIdleEasterEgg = function() {
        if (config.idleEasterEggs) {
            if (idleEasterEgg) {
                clearTimeout(idleEasterEgg);
            }
            idleEasterEgg = setTimeout(function() {
                playIdleEasterEgg(client);
            }, 60 * idleEasterEggMult * 1000);
        }
    };

    client.on('textMessage', function(data) {
        idleEasterEggMult = 1;
        setupIdleEasterEgg(client);
    });

    client.on('voice-start', function(user) {
        idleEasterEggMult = 1;
        setupIdleEasterEgg(client);
    });

    setupIdleEasterEgg();
};

module.exports = createIdleEasterEgg;
