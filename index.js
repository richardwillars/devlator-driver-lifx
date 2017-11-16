const lifx = require('ya-lifx');
const driver = require('./driver');

module.exports = {
  initialise: (settings, updateSettings, commsInterface, events, createEvent) => driver(settings, updateSettings, commsInterface, lifx, events, createEvent),
  driverType: 'light',
  interface: 'http',
  driverId: 'thinglator-driver-lifx',
};
