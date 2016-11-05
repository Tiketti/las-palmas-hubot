// Description:
//   Flowdock bot to serve photos and weather
//
// Configuration:
//   HUBOT_FLOWDOCK_API_TOKEN
//   DROPBOX_TOKEN
//   DARK_SKY_TOKEN
//
// Commands:
//   hubot photo - serves a random photo from preconfigured Dropbox folder
//   hubot weather - replies with current weather and tomorrow's summary forecast
//
// Author:
//   https://github.com/Tiketti

const request = require('request');
const moment = require('moment');
const Dropbox = require('dropbox');
const _ = require('lodash');

const coords = {
  lat: 28.117432,
  long: -15.4746367,
};
const box = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });

const decideIcon = (iconName) => {
  const icons = {
    randomIcons: [':tada:', ':sparkles:', ':boom:'],
    'clear-day': ':sunny:',
    'clear-night': ':star2:',
    rain: `:${_.sample(['umbrella', 'closed_umbrella'])}:`,
    wind: ':dash:',
    cloudy: ':cloud:',
    'partly-cloudy-day': ':cloud:',
    'partly-cloudy-night': ':cloud:',
  };

  return (icons[iconName] !== undefined ? icons[iconName] : _.sample(icons.randomIcons));
};

const getCurrentWeather = () =>
  new Promise((resolve, reject) => {
    const forecastEndpoint = `https://api.forecast.io/forecast/${process.env.DARK_SKY_TOKEN}/${coords.lat},${coords.long}?units=si`;
    request(forecastEndpoint, (error, response, body) => {
      if (error) {
        console.log(`error fetching weather: ${error}`);
        reject(error);
        return;
      }
      if (response.statusCode !== 200) {
        console.log(`error fetching weather: ${response.statusMessage}`);
        reject('an error occurred');
        return;
      }

      const json = JSON.parse(body);
      const currently = json.currently;
      const currentlySummary = currently.summary;
      const tomorrowSummary = json.daily.data[1].summary;
      const emoji = decideIcon(currently.icon);
      const degrees = _.round(currently.temperature, 1);
      resolve({
        degrees,
        currentlySummary,
        emoji,
        tomorrowSummary,
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
  robot.respond('/weather/i', (msg) => {
    getCurrentWeather()
      .then(weather => msg.reply(`${weather.emoji} Weather is currently ${weather.currentlySummary} and ${weather.degrees} °C.
      Tomorrow is expected to be ${weather.tomorrowSummary}`))
      .catch(reason => msg.reply(`Sorry, couldn't get weather: '${reason}'`));
  });

  robot.respond('/photo/i', (msg) => {
    logInput(msg);
    getDropboxContents().then((link) => {
      msg.reply(link);
    });
  });
};
