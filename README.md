# Mumble Fun Bot

A mumble bot that will brighten your day with features like:
* Playing MP3s when keywords are sent over mumble chat.
* A trivia delivery system to serve as a conversation starter.

# How to use
1. This requires node.js. Get it here if you don't have it already: https://nodejs.org/
2. Either clone this repository (using `git clone https://github.com/CleyFaye/mumble-fun-bot.git`) or download the latest release [here](https://github.com/CleyFaye/mumble-fun-bot/releases)
3. Navigate to the folder where you put it in a terminal and run: `$ npm install`
4. Edit the config.json file the way you want it (See details below).
5. Edit the saySounds.json file the way you want it (See details below).
5. Run it: `$ node index.js`

# config.json
This is the mandatory config file that tells the mumble bot how to behave.

A sample file is provided as `config.json.sample`.

Your options are:
* botName - (string) The username that the bot signs in with.
* server - (string) The server hostname or IP address to connect to. ( "mumble.example.com" )
* port - (whole number) The port of the server you are connecting to. Defaults to 64738.
* password - (?string) The server password. Leave undefined if not needed.
* channel - (string) The channel to move into once connected.
* triviaDefaultTimeLimit - (number) The number of seconds until the answer is revealed.
* saySoundCooldown - (number) The number of seconds after a saysound finishes playing until a new saysound can begin.
* saySoundGain - (number) How loud the saysounds should be transmitted. Defaults to a pleasant 0.2.
* saySoundFuzzyMatch - (boolean) Should each message be scanned to see if any of the saysound phrases show up anywhere in the message? Defaults to false (which means a more exact match must happen).
* idleEasterEggs - (array of strings) paths to any sounds you want to play when there is dead silence in the mumble server.
* targetBitrate - (number) If sounds are choppy or cut out, try lowering this number. Defaults to 24000.

# saySounds.json
This file defines the "saysound phrases" that match up to one or more mp3s that will be played. Here is an example file:
```
{
    "hello there": "saysounds/hello.mp3",
    "bye": "saysounds/bye.mp3",
    "random": ["saysounds/1.mp3", "saysounds/2.mp3", "saysounds/3.mp3"]
}
```

If this file was being used and I typed "Hello there!!" (without quotes) into the chat, then hello.mp3 would play. If I typed "RaNdOm" (without quotes) then either 1.mp3, 2.mp3 or 3.mp3 will play. If saySoundFuzzyMatch was true and I typed "Goodbye. Nice talking." (without quotes) then bye.mp3 would play.

As you can see from the examples, case doesn't matter ever. Symbols that are on the front or end of the message are ignored too ("hello" and "~!hello!~" both will work). With saySoundFuzzyMatch false, then non-matching letters or numbers can't come before or after the phrase. When it's true, then the message is scanned to see if the phrase shows up ANYWHERE in the message (even inside other words).

# Commands
To give a command to the bot, type to the channel or directly to the bot. Messages that start with a "!" will be considered commands. Some commands can take arguments. They are supplied after the command name separated by spaces. Command names are also not case sensitive.

* !trivia [keepAsking] [timelimit] - Have the bot ask you trivia questions. Examples:
  * !trivia - Have the bot ask the channel one question.
  * !trivia true - Have the bot ask questions to the channel, one after the other, forever.
  * !trivia true 45 - Have the bot ask questions to the channel forever while also giving each question 45 seconds until the answer is revealed
  * !trivia false - Make the bot stop asking questions.
* !answer [all] - Make the bot give the answer to the current trivia question. Examples:
  * !answer - Make the bot give just you the answer.
  * !answer all - Make the bot give everyone the answer and end the current question timer.
* !list - List all of the saysound phrases to just you.
* !random - Play a random saysound.
* !stop - Stop the current saysound playing (if any).
* !help - Show a help message that gives info about these commands.

# Trivia
When you play trivia, the bot simply asks you a question (scraped from triviacafe.com) and then starts a timer. When the timer hits zero, then it shows the answer. I would recommend looking at the code in the getQuestion function inside of triviaBot.js. Maybe you could use a different URL of a different trivia site. Please don't hammer any trivia site's servers (turn off trivia when nobody is playing anymore - !trivia false).

# License

MIT
