import Botler from 'botler';
import { User, Intent, defaultReducer } from 'botler';

const bot = new Botler([`${__dirname}/../nlp`]);
// bot.turnOnDebug();

function weatherSkill(user: User): Promise<User> {
  if (user.intent.topic === 'location') {
    const city = user.intent.action.replace('_', ' ');

    user.state = 'none';
    const weather = ['sunny', 'rainy', 'cloudy'];
    return sendToUser(`the weather in ${city} will be ${weather[Math.floor(Math.random()*weather.length)]}`)
      .then(() => user);
    /// weatherAPI(city)
    ///  .then(forecast => sendToUser(`forecase is ${forecast}`))
    ///  .then(() => user);
  }

  return null;  //return null if skill can't process intent;
}

function confusedSkill(user: User): Promise<User> {
  // console.log(`I'm confused, user intent was ${user.intent.action}`);
  return sendToUser('I\'m confused')
    .then(() => user);
}

function weatherReducer(intents: Array<Intent>): Promise<Intent> {
  // console.log('intents:', intents);
  return defaultReducer(intents);
}

function chatSkill(user: User): Promise<User> {
  switch(user.intent.action) {
    case 'hello':
      user.state = 'hello';
      return sendToUser('Hi there! Would you like to know the weather?')
        .then(() => user);

    case 'help':
      user.state = 'help';
      return sendToUser('Hi there! just tell me what city you want to know the weather in...')
        .then(() => user);

    case 'weather':
      user.state = 'location';
      return sendToUser('What city do you want to know the weather in?')
        .then(() => user);

    case 'yes':
      if (user.state === 'hello') { // user responded yes to 'would you like to know the weather?'
        user.state = 'city';
        return sendToUser('Great, what city?')
          .then(() => user);
      }
      return null; //return null if skill can't process intent;

    case 'no':
      if (user.state === 'hello') { // user responded no to 'would you like to know the weather?'
        user.state = 'none';
        return sendToUser('Why not?')
          .then(() => user);
      }
      return null; //return null if skill can't process intent;

    default:
      return null; //return null if skill can't process intent;
  }
}

function sendToUser(text: string): Promise<void> {
  console.log(`<- ${text}`);
  return Promise.resolve();
}

function receiveFromUser(user: User, text: string): Promise<User> {
  console.log(`-> ${text}`);
  return bot.processText(user, text);
}

//add skills to bot, skills are run all at once, but prioritized first to last
bot.unshiftSkill(confusedSkill)
  .unshiftSkill(chatSkill)
  .unshiftSkill(weatherSkill)
  .setReducer(weatherReducer);

// begin example
const emptyUser: User = {
  state: 'none',
  intent: {
    action: 'none',
    topic: 'none',
  },
};

receiveFromUser(emptyUser, 'hi')
  .then((user: User) => {
    return receiveFromUser(user, 'yes');
  })
  .then((user: User) => {
    return receiveFromUser(user, 'london');
  })
  .then((user: User) => {
    return receiveFromUser(user, 'help');
  })
  .then((user: User) => {
    return receiveFromUser(user, 'what\'s the weather in London?');
  })
  .then((user: User) => {
    return receiveFromUser(user, 'you\'re the best!');
  })
  .then((user: User) => {
    return receiveFromUser(user, 'What\'s the weather in New York, NY');
  });
