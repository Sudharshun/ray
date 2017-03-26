var say = require('say');
const brain = require('./brain');

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

if (!process.env.gitrepo) {
    console.log('Error: Specify Git Repo in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    //  debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

var gitrepo = process.env.gitrepo;
console.log('Git Repo set to :', gitrepo);

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello <@' + message.user + '>');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function (err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function (err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function (bot, message) {

    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function (err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function (response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function (response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function (response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function (response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, { 'key': 'nickname' }); // store the results in a field called nickname

                    convo.on('end', function (convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function (err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function (err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function (response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function () {
                        process.exit();
                    }, 3000);
                }
            },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function (response, convo) {
                    convo.say('*Phew!*');
                    convo.next();
                }
            }
        ]);
    });
});

controller.hears(['dilbert'], 'direct_message,direct_mention,mention', function (bot, message) {

    var rightNow = new Date();
    var dateinformat = rightNow.toISOString().slice(0, 10).replace(/-/g, "");
    bot.reply(message, "http://dilbert.com/strip/" + dateinformat);
});

controller.hears('help me (.*)', ['direct_message,direct_mention,mention'], function (bot, message) {
    var helpTopic = message.match[1]; //match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).
    if (helpTopic && brain[helpTopic.toLowerCase()] && brain[helpTopic.toLowerCase()].page && brain[helpTopic.toLowerCase()].section) {
        console.log('Found Link', gitrepo + '/' + brain[helpTopic.toLowerCase()].page + '#' + brain[helpTopic.toLowerCase()].section);
        return bot.reply(message, gitrepo + '/' + brain[helpTopic.toLowerCase()].page + '#' + brain[helpTopic.toLowerCase()].section);
    }
    return bot.reply(message, 'I am Sorry! Couldnt fint any Info on that!');
});

controller.hears('inform (.*)', ['direct_message,direct_mention,mention'], function (bot, message) {
    var what = message.match[1]; //match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).
    // Fire a callback once the text has completed being spoken

    var currentUser;
    var currentUserName = "Team Member";
    bot.api.users.info({ user: message.user }, function (err, response) {
        if (err) {
            console.error("Coudnt get userid");
        }
        else {
            currentUser = response["user"];
            currentUserName = currentUser["name"];
            console.log('User is ', currentUserName);
            
            say.speak(currentUserName + ' says ' + what, 'Good News', 1.0, function (err) {
                if (err) {
                    console.error(err);
                    //    return bot.reply(message, 'Couldnt Inform the Folks!!!');
                }
                return bot.reply(message, 'I Informed our people!!!');
                console.log('Text has been spoken.');
            });

        }
    });


});


controller.hears(['wakemup'], 'direct_message,direct_mention,mention', function (bot, message) {

    say.speak('People Time for retro');
   
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function (bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
            '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
