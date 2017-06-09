const lifx = require('ya-lifx');

class LifxDriver {
    constructor() {
        this.driverSettings = {};
    }

    init(driverSettingsObj, commsInterface, eventEmitter) {
        this.driverSettingsObj = driverSettingsObj;
        this.eventEmitter = eventEmitter;
        return this.driverSettingsObj.get().then((settings) => {
            this.driverSettings = settings;
            lifx.init(this.driverSettings.token);
        });
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

    getEventEmitter() {
        return this.eventEmitter;
    }

    initDevices() {

    }

    buildColourString(hue, sat, bri) {
        return `hue:${hue} saturation:${sat} brightness:${bri}`;
    }

    getStatus(device, delay) {
        setTimeout(() => {
            lifx.listLights(device.specs.deviceId).then((response) => {
                const resp = {
                    on: response[0].power === 'on',
                    colour: {
                        hue: parseInt(response[0].color.hue, 10),
                        saturation: response[0].color.saturation,
                        brightness: response[0].brightness
                    }
                };
                this.eventEmitter.emit('state', 'lifx', device._id, resp);
            });
        }, delay);
    }

    getAuthenticationProcess() {
        return [{
            type: 'RequestData',
            message: 'In order to use LIFX bulbs you must provide an access token. This can be obtained from your LIFX account settings', // eslint-disable-line max-len
            button: {
                url: 'https://cloud.lifx.com/settings',
                label: 'Get access token'
            },
            dataLabel: 'Access token',
            next: {
                http: '/authenticate/lifx/0',
                socket: {
                    event: 'authenticationStep',
                    step: 0
                }
            }
        }];
    }

    setAuthenticationStep0(props) {
        const newSettings = {
            token: props.data
        };
        return this.driverSettingsObj.set(newSettings).then(() => {
            this.driverSettings = newSettings;
            lifx.init(this.driverSettings.token);

            // check if the token is valid by calling discover
            return this.discover();
        }).then(() => ({
            success: true
        })).catch(err => ({
            success: false,
            message: err.error
        }));
    }

    discover() {
        return lifx.listLights()
            .then((response) => {
                const devices = [];
                response.forEach((light) => {
                    const device = {
                        deviceId: light.id,
                        name: light.label,
                        commands: {
                            setHSBState: true,
                            setBrightnessState: true,
                            toggle: true,
                            setBooleanState: true,
                            breatheEffect: true,
                            pulseEffect: true
                        },
                        events: {
                            state: true
                        }
                    };
                    devices.push(device);
                });
                return devices;
            })
            .catch((err) => {
                const error = err;
                error.type = 'Authentication';
                throw error;
            });
    }

    command_setHSBState(device, props) { // eslint-disable-line camelcase
        return lifx.setState(`id:${device.specs.deviceId}`, {
            power: 'on',
            color: this.buildColourString(props.colour.hue, props.colour.saturation, props.colour.brightness),
            duration: props.duration
        })
            .then((result) => {
                if (result.results[0].status === 'offline') {
                    const e = new Error('Unable to connect to bulb');
                    e.type = 'Connection';
                    throw e;
                } else if (result.results[0].status !== 'ok') {
                    const e = new Error(result);
                    e.type = 'Driver';
                    throw e;
                }

                return lifx.listLights(device.specs.deviceId);
            })
            .then((response) => {
                const resp = {
                    on: response[0].power === 'on',
                    colour: {
                        hue: parseInt(response[0].color.hue, 10),
                        saturation: response[0].color.saturation,
                        brightness: response[0].brightness
                    }
                };
                this.getStatus(device, (props.duration * 1000) + 1000);
                return resp;
            })
            .catch((e) => {
                let err;
                if (!e.type) {
                    if (e.error === 'Invalid token') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error === 'Token required') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error.startsWith('Unable to parse color')) {
                        err = new Error('Unable to parse colour');
                        err.type = 'BadRequest';
                    } else {
                        err = new Error(e.error);
                        err.type = 'Device';
                    }
                } else {
                    err = e;
                }
                throw err;
            });
    }

    command_setBrightnessState(device, props) { // eslint-disable-line camelcase
        return lifx.setState(`id:${device.specs.deviceId}`, {
            power: 'on',
            brightness: props.colour.brightness,
            duration: props.duration
        })
            .then((result) => {
                if (result.results[0].status === 'offline') {
                    const e = new Error('Unable to connect to bulb');
                    e.type = 'Connection';
                    throw e;
                } else if (result.results[0].status !== 'ok') {
                    const e = new Error(result);
                    e.type = 'Driver';
                    throw e;
                }

                return lifx.listLights(device.specs.deviceId);
            })
            .then((response) => {
                const resp = {
                    on: response[0].power === 'on',
                    colour: {
                        hue: parseInt(response[0].color.hue, 10),
                        saturation: response[0].color.saturation,
                        brightness: response[0].brightness
                    }
                };
                this.getStatus(device, (props.duration * 1000) + 1000);
                return resp;
            })
            .catch((e) => {
                let err;
                if (!e.type) {
                    if (e.error === 'Invalid token') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error === 'Token required') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error.startsWith('Unable to parse color')) {
                        err = new Error('Unable to parse colour');
                        err.type = 'BadRequest';
                    } else {
                        err = new Error(e.error);
                        err.type = 'Device';
                    }
                } else {
                    err = e;
                }
                throw err;
            });
    }

    command_toggle(device) { // eslint-disable-line camelcase
        return lifx.toggle(`id:${device.specs.deviceId}`, {}).then((result) => {
            if (result.results[0].status === 'offline') {
                const e = new Error('Unable to connect to bulb');
                e.type = 'Connection';
                throw e;
            } else if (result.results[0].status !== 'ok') {
                const e = new Error(result);
                e.type = 'Driver';
                throw e;
            }
            return lifx.listLights(device.specs.deviceId);
        }).then((response) => {
            const resp = {
                on: response[0].power === 'on',
                colour: {
                    hue: parseInt(response[0].color.hue, 10),
                    saturation: response[0].color.saturation,
                    brightness: response[0].brightness
                }
            };
            this.getStatus(device, 3000);
            return resp;
        }).catch((e) => {
            let err;
            if (!e.type) {
                if (e.error === 'Invalid token') {
                    err = new Error('Not authenticated');
                    err.type = 'Authentication';
                } else if (e.error === 'Token required') {
                    err = new Error('Not authenticated');
                    err.type = 'Authentication';
                } else if (e.error.startsWith('Unable to parse color')) {
                    err = new Error('Unable to parse colour');
                    err.type = 'BadRequest';
                } else {
                    err = new Error(e.error);
                    err.type = 'Device';
                }
            } else {
                err = e;
            }
            throw err;
        });
    }

    command_setBooleanState(device, props) { // eslint-disable-line camelcase
        let power = 'on';
        if (props.on === false) {
            power = 'off';
        }

        return lifx.setState(`id:${device.specs.deviceId}`, {
            power,
            duration: props.duration
        })
            .then((result) => {
                if (result.results[0].status === 'offline') {
                    const e = new Error('Unable to connect to bulb');
                    e.type = 'Connection';
                    throw e;
                } else if (result.results[0].status !== 'ok') {
                    const e = new Error(result);
                    e.type = 'Driver';
                    throw e;
                }

                return lifx.listLights(device.specs.deviceId);
            })
            .then((response) => {
                const resp = {
                    on: response[0].power === 'on',
                    colour: {
                        hue: parseInt(response[0].color.hue, 10),
                        saturation: response[0].color.saturation,
                        brightness: response[0].brightness
                    }
                };
                this.getStatus(device, (props.duration * 1000) + 1000);
                return resp;
            })
            .catch((e) => {
                let err;
                if (!e.type) {
                    if (e.error === 'Invalid token') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error === 'Token required') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else {
                        err = new Error(e.error);
                        err.type = 'Device';
                    }
                } else {
                    err = e;
                }
                throw err;
            });
    }

    command_breatheEffect(device, props) { // eslint-disable-line camelcase
        const newProps = {
            color: this.buildColourString(props.colour.hue, props.colour.saturation, props.colour.brightness),
            period: props.period,
            cycles: props.cycles,
            persist: props.persist,
            peak: props.peak,
            power_on: true
        };
        if (props.fromColour) {
            newProps.from_color = this.buildColourString(
              props.fromColour.hue,
              props.fromColour.saturation,
              props.fromColour.brightness
            );
        }
        return lifx.breathe(`id:${device.specs.deviceId}`, newProps)
            .then((result) => {
                if (result.results[0].status === 'ok') {
                    const resp = {
                        breatheEffect: true
                    };
                    this.eventEmitter.emit('state', 'lifx', device._id, resp);
                } else if (result.results[0].status === 'offline') {
                    const e = new Error('Unable to connect to bulb');
                    e.type = 'Connection';
                    throw e;
                } else {
                    const e = new Error(result);
                    e.type = 'Driver';
                    throw e;
                }
            })
            .catch((e) => {
                let err;
                if (!e.type) {
                    if (e.error === 'Invalid token') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error === 'Token required') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error.startsWith('Unable to parse color')) {
                        err = new Error('Unable to parse colour');
                        err.type = 'BadRequest';
                    } else {
                        err = new Error(e.error);
                        err.type = 'Device';
                    }
                } else {
                    err = e;
                }
                throw err;
            });
    }

    command_pulseEffect(device, props) { // eslint-disable-line camelcase
        const newProps = {
            color: this.buildColourString(props.colour.hue, props.colour.saturation, props.colour.brightness),
            period: props.period,
            cycles: props.cycles,
            persist: props.persist,
            power_on: true
        };
        if (props.fromColour) {
            newProps.from_color = this.buildColourString(
              props.fromColour.hue,
              props.fromColour.saturation,
              props.fromColour.brightness);
        }
        return lifx.breathe(`id:${device.specs.deviceId}`, newProps)
            .then((result) => {
                if (result.results[0].status === 'ok') {
                    const resp = {
                        pulseEffect: true
                    };
                    this.eventEmitter.emit('state', 'lifx', device._id, resp);
                } else if (result.results[0].status === 'offline') {
                    const e = new Error('Unable to connect to bulb');
                    e.type = 'Connection';
                    throw e;
                } else {
                    const e = new Error(result);
                    e.type = 'Driver';
                    throw e;
                }
            })
            .catch((e) => {
                let err;
                if (!e.type) {
                    if (e.error === 'Invalid token') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error === 'Token required') {
                        err = new Error('Not authenticated');
                        err.type = 'Authentication';
                    } else if (e.error.startsWith('Unable to parse color')) {
                        err = new Error('Unable to parse colour');
                        err.type = 'BadRequest';
                    } else {
                        err = new Error(e.error);
                        err.type = 'Device';
                    }
                } else {
                    err = e;
                }
                throw err;
            });
    }
}

module.exports = LifxDriver;
