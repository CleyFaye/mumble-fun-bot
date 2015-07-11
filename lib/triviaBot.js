'use strict';

var request = require('request');
var cheerio = require('cheerio');

var createTriviaBot = function(client, config) {
    var keepAsking = false;
    var timelimit = config.triviaDefaultTimelimit * 1000;
    var questionInProgress = false;
    var gaveAnswer = false;
    var currentQuestionData;
    var answerTimeout;

    var setKeepAsking = function(keepAsk) {
        keepAsking = keepAsk;
    };

    var setTimeLimit = function(timeL) {
        timelimit = timeL * 1000;
    };

    var getQuestion = function(cb) {
        request('http://www.triviacafe.com/random/', function(err, res, body) {
            var foundQuestion = false;
            if (!err && res.statusCode === 200) {
                var $ = cheerio.load(body);
                var centerText = $('center').text();
                var questionEnd = centerText.indexOf('Show Answer');
                if (questionEnd > 10) {
                    foundQuestion = true;
                    cb({
                        question: centerText.substring(10, questionEnd),
                        answer: $('#answer').text()
                    });
                }
            }

            if (!foundQuestion) {
                client.sendChannelMessage('I couldn\'t find a question. Sorry. :(');
                questionInProgress = false;
            }
        });
    };

    var askQuestion = function() {
        if (!questionInProgress) {
            gaveAnswer = false;
            questionInProgress = true;
            getQuestion(function(questionData) {
                currentQuestionData = questionData;
                client.sendChannelMessage(currentQuestionData.question);
                answerTimeout = setTimeout(function() {
                    giveAnswer(null, 'all');
                }, timelimit);
            });
        }
    };

    var giveAnswer = function(from, all) {
        all = (all || '').toLowerCase();
        if (questionInProgress && !gaveAnswer && all === 'all') {
            gaveAnswer = true;
            clearTimeout(answerTimeout);
            client.sendChannelMessage('The answer is: ' + currentQuestionData.answer);
            if (keepAsking) {
                setTimeout(function() {
                    questionInProgress = false;
                    askQuestion();
                }, 5000);
            } else {
                questionInProgress = false;
            }
        } else if (questionInProgress && !gaveAnswer) {
            var session = client.userBySession(from.actor);
            client.sendChannelMessage('Giving answer to: ' + session.name);
            client.sendChannelMessage('The answer is: ' + currentQuestionData.answer, from.actor);
        } else {
            if (!questionInProgress) {
                client.sendChannelMessage('I haven\'t asked a question yet. Try this one...');
                setTimeout(askQuestion, 2000);
            }
        }
    };

    return {
        setKeepAsking: setKeepAsking,
        setTimeLimit: setTimeLimit,
        askQuestion: askQuestion,
        giveAnswer: giveAnswer
    };
};

module.exports = createTriviaBot;
