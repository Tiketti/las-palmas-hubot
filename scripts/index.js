// process.env.HUBOT_FLOWDOCK_API_TOKEN should be set for Flowdock adapter
const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
const DARK_SKY_TOKEN = process.env.DARK_SKY_TOKEN;

const request = require('request');
const moment = require('moment');
const Dropbox = require('dropbox');
const _ = require('lodash');

const coords = {
  lat: 28.117432,
  long: -15.4746367,
};
const box = new Dropbox({ accessToken: DROPBOX_TOKEN });
const decideIcon = (iconName) => {
  const randomIcons = ['tada', 'sparkles', 'boom'];
  switch (iconName) {
    case 'clear-day':
      return ':sunny:';
    case 'rain':
      return `:${_.sample(['umbrella', 'closed_umbrella'])}:`;
    case 'wind':
      return ':dash:';
    case 'cloudy':
      return ':cloud:';
    case 'partly-cloudy-day':
      return ':cloud:';
    default:
      return `:${_.sample(randomIcons)}:`;
  }
};

const getCurrentWeather = () =>
  new Promise((resolve, reject) => {
    const forecastEndpoint = `https://api.forecast.io/forecast/${DARK_SKY_TOKEN}/${coords.lat},${coords.long}?units=si`;
    request(forecastEndpoint, (error, response, body) => {
      if (error) {
        console.log(`error fetching weather: ${error}`);
        reject(error);
      }
      const currently = JSON.parse(body).currently;
      const summary = currently.summary;
      const emoji = decideIcon(currently.icon);
      const degrees = _.round(currently.temperature, 1);
      resolve({
        degrees,
        summary,
        emoji,
      });
    });
  });

const getDropboxShareLink = file =>
  new Promise((resolve, reject) => {
    box.sharingCreateSharedLinkWithSettings({ path: file.path_lower })
      .then((linkResult) => {
        resolve(linkResult.url);
      })
      .catch((err) => {
        console.log(`couldn't create Dropbox shared link: ${err}`);
        box.sharingListSharedLinks({ path: file.path_lower, direct_only: true })
          .then((result) => {
            resolve(result.links[0].url);
          })
          .catch(error => reject(error));
      });
  });

const getDropboxContents = () =>
  new Promise((resolve, reject) => {
    box.filesListFolder({ path: '' })
      .then((response) => {
        const randomFile = _.chain(response.entries).filter({ '.tag': 'file' }).sample().value();
        getDropboxShareLink(randomFile)
          .then(url => resolve(url));
      })
    .catch((err) => {
      console.log(`error in ${getDropboxContents()}: ${err}`);
      reject(err);
    });
  });

const logInput = (msg) => {
  console.log(`${moment().format('YYYY-MM-DD HH:MM:SS')} - heard message from: '${msg.message.user.name}', message: ${msg.message.text}, room ${msg.message.room}`);
};

module.exports = (robot) => {
  // listens to all messages in all of Hubot's flows
  // robot.hear('', (msg) => {
  //   logInput(msg);
  // });

  robot.respond('/weather/i', (msg) => {
    getCurrentWeather()
      .then(weather => msg.reply(`${weather.emoji} Weather is currently ${weather.summary} and ${weather.degrees} °C`))
      .catch('Sorry, could get weather');
  });

  robot.respond('/photo/i', (msg) => {
    logInput(msg);
    getDropboxContents().then((link) => {
      msg.reply(link);
    });
  });

  // TODO: countdown
};
