#### Whats a Bot
<br>
<span style="color:gray">Bots are applications that can send and receive messages, and in many cases, appear alongside their human counterparts as users.
<br/>Some bots talk like people, others silently work in the background, while others present interfaces much like modern mobile applications</span>

---

### Whats the Slack bot
<br>
<span style="color:gray; font-size:0.6em;">One that lives and thrives on Slack and has conversations with us on slack.
We use the below framework as its pretty straightforward to get started.<br/>
</span>

    git clone git@github.com:howdyai/botkit.git

---

### Getting the Bot registered

<span style="color:gray; font-size:0.6em;">On Slack click on Custom Integrations create a Bot,  get a Token<br/>
<br/>Get a Token , this will enable your Bot to talk to slack, this token is to be handled with care and never checked into <br>
or something like that.
</span>

---

### Getting a Raspberry Pi in shape for your Bot
<span style="color: #e49436">
- Get yourself a Raspberry Pi
- Get yourself setup on Raspberry pi - u can either use putty, or a modified Lapdock or a regular TV to interface
- Rev up Node on the Raspberry Pi ships with a really old version
</span>

    git clone https://github.com/Sudharshun/ray.git

---
### Having a Conversation

Getting Things going

    var controller = Botkit.slackbot({
        //  debug: true,
    });

    var bot = controller.spawn({
        token: process.env.token
    }).startRTM();

Responding to Messages in the Channel

    controller.hears(['dilbert'], 'direct_message,direct_mention,mention', function (bot, message) {

    var rightNow = new Date();
    var dateinformat = rightNow.toISOString().slice(0, 10).replace(/-/g, "");
    bot.reply(message, "http://dilbert.com/strip/" + dateinformat);
    });

---
### Sending messages

    var twilioclient = twilio('something secret', 'something else secret');
    

	try{
       twilioclient.sendMessage({
         to: 'tonumber',
         from: 'twilionumber',
         body: 'System Down :'+whatsdown
        });
		}catch(e){
        console.log('Something bad happened');
		}
---
### Having your bot speak

    var say = require('say'); 

     say.speak(currentUserName + ' says ' + what, 'Good News', 1.0, function (err) {
                if (err) {
                    console.error(err);
                    //    return bot.reply(message, 'Couldnt Inform the Folks!!!');
                }
                return bot.reply(message, 'I Informed our people!!!');


---