'use strict';

var lifx = require('ya-lifx');

class LifxDriver {
	constructor(driverSettingsObj, interfaces) {
		var self = this;
		this.driverSettingsObj = driverSettingsObj;

		this.driverSettings = {};
		this.driverSettingsObj.get().then(function(settings) {
			self.driverSettings = settings;
			lifx.init(self.driverSettings.token);
		});

		this.interface = interfaces[this.getInterface()];
	}

	getName() {
		return 'lifx';
	}

	getType() {
		return 'light';
	}

	getInterface() {
		return 'http';
	}

	getAuthenticationProcess() {
		return [{
			type: 'RequestData',
			message: 'In order to use LIFX bulbs you must provide an access token. This can be obtained from your LIFX account settings',
			button: {
				url: 'https://cloud.lifx.com/settings',
				label: 'Get access token'
			},
			dataLabel: 'Access token',
			next: '/authentication/speaker/lifx/9'
		}];
	}

	setAuthenticationStep0(props) {
		var self = this;
		var newSettings = {
			token: props.data
		};
		this.driverSettingsObj.set(newSettings).then(function() {
			self.driverSettings = newSettings;
			lifx.init(self.driverSettings.token);
		});
	}

	discover() {
		return lifx.listLights()
			.then(function(response) {
				var devices = [];
				for (var i in response) {
					var device = {
						deviceId: response[i].id,
						name: response[i].label,
						capabilities: {
							setState: true,
							toggle: true,
							breatheEffect: true,
							pulseEffect: true,
							cycleEffect: true
						}
					};
					devices.push(device);
				}
				return devices;
			})
			.catch(function(err) {
				throw err;
			});
	}

	capability_setState(device, props) {

		var power = 'on';
		if (props.on === false) {
			power = 'off';
		}
		var brightness = 0;
		if (props.brightness > 0) {
			brightness = props.brightness / 100;
		}

		return lifx.setState('id:' + device.specs.deviceId, {
				power: power,
				brightness: brightness,
				color: props.colour,
				duration: props.duration
			})
			.then(function(result) {
				if (result.results[0].status === 'ok') {
					return {
						processed: true
					};
				} else if (result.results[0].status === 'offline') {
					var e = new Error('Unable to connect to bulb');
					e.type = 'Connection';
					throw e;
				} else {
					var e = new Error(result);
					e.type = 'Driver';
					throw e;
				}

			})
			.catch(function(e) {
				if (!e.type) {
					if (e.error === 'Invalid token') {
						var err = new Error('Not authenticated');
						err.type = 'Authentication';
					}
					else if(e.error === 'Token required') {
						var err = new Error('Not authenticated');
						err.type = 'Authentication';
					}
					else if (e.error.startsWith('Unable to parse color')) {
						var err = new Error('Unable to parse colour');
						err.type = 'BadRequest';
					} else {
						var err = new Error(e.error);
						err.type = 'Device';
					}
				} else {
					var err = e;
				}
				throw err;
			});
	}

	capability_toggle(device, props) {
		return new Promise(function(resolve) {

		});
	}

	capability_breatheEffect(device, props) {
		return new Promise(function(resolve) {

		});
	}

	capability_pulseEffect(device, props) {
		return new Promise(function(resolve) {

		});
	}

	capability_cycleEffect(device, props) {
		return new Promise(function(resolve) {

		});
	}
}

module.exports = LifxDriver;