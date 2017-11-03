const initDevices = async (devices) => {

};

const handleLifxError = (e) => {
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
};

const buildColourString = (hue, sat, bri) => `hue:${hue} saturation:${sat} brightness:${bri}`;

const getStatus = (device, delay, lifx, events, createEvent) => {
  setTimeout(() => {
    lifx.listLights(device.specs.originalId).then((response) => {
      const payload = {
        on: response[0].power === 'on',
        colour: {
          hue: parseInt(response[0].color.hue, 10),
          saturation: response[0].color.saturation,
          brightness: response[0].brightness,
        },
      };
      createEvent(events.LIGHT_STATE, device._id, payload);
    });
  }, delay);
};

const discover = async (lifx, events) => {
  try {
    const response = await lifx.listLights();
    return response.map(light => ({
      originalId: light.id,
      name: light.label,
      commands: {
        setHSBState: true,
        setBrightnessState: true,
        toggle: true,
        setBooleanState: true,
        breatheEffect: true,
        pulseEffect: true,
      },
      events: {
        [events.LIGHT_STATE]: true,
        [events.PULSE_LIGHT_EFFECT]: true,
        [events.BREATHE_LIGHT_EFFECT]: true,
      },
    }));
  } catch (err) {
    const error = err;
    error.type = 'Authentication';
    throw error;
  }
};

const getAuthenticationProcess = () => [{
  type: 'RequestData',
  message: 'In order to use LIFX bulbs you must provide an access token. This can be obtained from your LIFX account settings', // eslint-disable-line max-len
  button: {
    url: 'https://cloud.lifx.com/settings',
    label: 'Get access token',
  },
  dataLabel: 'Access token',
}];

const authenticationStep0 = async (props, updateSettings, lifx) => {
  const newSettings = {
    token: props.data,
  };
  try {
    await updateSettings(newSettings);
    lifx.init(newSettings.token);

    // check if the token is valid by calling discover
    await discover();

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      message: err.error,
    };
  }
};


const commandSetHSBState = async (device, props, lifx, events, createEvent) => {
  try {
    const result = await lifx.setState(`id:${device.specs.originalId}`, {
      power: 'on',
      color: buildColourString(props.colour.hue, props.colour.saturation, props.colour.brightness),
      duration: props.duration,
    });

    if (result.results[0].status === 'offline') {
      const e = new Error('Unable to connect to bulb');
      e.type = 'Connection';
      throw e;
    } else if (result.results[0].status !== 'ok') {
      const e = new Error(result);
      e.type = 'Driver';
      throw e;
    }

    const response = await lifx.listLights(device.specs.originalId);

    const resp = {
      on: response[0].power === 'on',
      colour: {
        hue: parseInt(response[0].color.hue, 10),
        saturation: response[0].color.saturation,
        brightness: response[0].brightness,
      },
    };
    getStatus(device, (props.duration * 1000) + 1000, lifx, events, createEvent);
    return resp;
  } catch (e) {
    handleLifxError(e);
  }
};

const commandSetBrightnessState = async (device, props, lifx, events, createEvent) => {
  try {
    const result = await lifx.setState(`id:${device.specs.originalId}`, {
      power: 'on',
      brightness: props.colour.brightness,
      duration: props.duration,
    });
    if (result.results[0].status === 'offline') {
      const e = new Error('Unable to connect to bulb');
      e.type = 'Connection';
      throw e;
    } else if (result.results[0].status !== 'ok') {
      const e = new Error(result);
      e.type = 'Driver';
      throw e;
    }

    const response = await lifx.listLights(device.specs.originalId);

    const resp = {
      on: response[0].power === 'on',
      colour: {
        hue: parseInt(response[0].color.hue, 10),
        saturation: response[0].color.saturation,
        brightness: response[0].brightness,
      },
    };
    getStatus(device, (props.duration * 1000) + 1000, lifx, events, createEvent);
    return resp;
  } catch (e) {
    handleLifxError(e);
  }
};

const commandToggle = async (device, lifx, events, createEvent) => {
  try {
    const result = await lifx.toggle(`id:${device.specs.originalId}`, {});
    if (result.results[0].status === 'offline') {
      const e = new Error('Unable to connect to bulb');
      e.type = 'Connection';
      throw e;
    } else if (result.results[0].status !== 'ok') {
      const e = new Error(result);
      e.type = 'Driver';
      throw e;
    }
    const response = await lifx.listLights(device.specs.originalId);

    const resp = {
      on: response[0].power === 'on',
      colour: {
        hue: parseInt(response[0].color.hue, 10),
        saturation: response[0].color.saturation,
        brightness: response[0].brightness,
      },
    };
    getStatus(device, 3000, lifx, events, createEvent);
    return resp;
  } catch (e) {
    handleLifxError(e);
  }
};

const commandSetBooleanState = async (device, props, lifx, events, createEvent) => { // eslint-disable-line camelcase
  try {
    let power = 'on';
    if (props.on === false) {
      power = 'off';
    }

    const result = await lifx.setState(`id:${device.specs.originalId}`, {
      power,
      duration: props.duration,
    });
    if (result.results[0].status === 'offline') {
      const e = new Error('Unable to connect to bulb');
      e.type = 'Connection';
      throw e;
    } else if (result.results[0].status !== 'ok') {
      const e = new Error(result);
      e.type = 'Driver';
      throw e;
    }

    const response = await lifx.listLights(device.specs.originalId);

    const resp = {
      on: response[0].power === 'on',
      colour: {
        hue: parseInt(response[0].color.hue, 10),
        saturation: response[0].color.saturation,
        brightness: response[0].brightness,
      },
    };
    getStatus(device, (props.duration * 1000) + 1000, lifx, events, createEvent);
    return resp;
  } catch (e) {
    handleLifxError(e);
  }
};

const commandBreatheEffect = async (device, props, lifx, events, createEvent) => { // eslint-disable-line camelcase
  try {
    const newProps = {
      color: buildColourString(props.colour.hue, props.colour.saturation, props.colour.brightness),
      period: props.period,
      cycles: props.cycles,
      persist: props.persist,
      peak: props.peak,
      power_on: true,
    };
    if (props.fromColour) {
      newProps.from_color = buildColourString(
        props.fromColour.hue,
        props.fromColour.saturation,
        props.fromColour.brightness,
      );
    }
    const result = await lifx.breathe(`id:${device.specs.originalId}`, newProps);

    if (result.results[0].status === 'ok') {
      const resp = {
        breatheEffect: true,
      };
      createEvent(events.BREATHE_LIGHT_EFFECT, device._id, resp);
    } else if (result.results[0].status === 'offline') {
      const e = new Error('Unable to connect to bulb');
      e.type = 'Connection';
      throw e;
    } else {
      const e = new Error(result);
      e.type = 'Driver';
      throw e;
    }
  } catch (e) {
    handleLifxError(e);
  }
};

const commandPulseEffect = async (device, props, lifx, events, createEvent) => { // eslint-disable-line camelcase
  try {
    const newProps = {
      color: buildColourString(props.colour.hue, props.colour.saturation, props.colour.brightness),
      period: props.period,
      cycles: props.cycles,
      persist: props.persist,
      power_on: true,
    };
    if (props.fromColour) {
      newProps.from_color = buildColourString(
        props.fromColour.hue,
        props.fromColour.saturation,
        props.fromColour.brightness,
      );
    }
    const result = await lifx.pulse(`id:${device.specs.originalId}`, newProps);

    if (result.results[0].status === 'ok') {
      const resp = {
        pulseEffect: true,
      };
      createEvent(events.PULSE_LIGHT_EFFECT, device._id, resp);
    } else if (result.results[0].status === 'offline') {
      const e = new Error('Unable to connect to bulb');
      e.type = 'Connection';
      throw e;
    } else {
      const e = new Error(result);
      e.type = 'Driver';
      throw e;
    }
  } catch (e) {
    handleLifxError(e);
  }
};


module.exports = async (getSettings, updateSettings, commsInterface, lifx, events, createEvent) => {
  const settings = await getSettings();
  lifx.init(settings.token);

  return {
    initDevices: devices => initDevices(devices),
    authentication_getSteps: getAuthenticationProcess,
    authentication_step0: props => authenticationStep0(props, updateSettings, lifx),
    discover: () => discover(lifx, events),
    command_setHSBState: (device, props) => commandSetHSBState(device, props, lifx, events, createEvent),
    command_setBrightnessState: (device, props) => commandSetBrightnessState(device, props, lifx, events, createEvent),
    command_toggle: device => commandToggle(device, lifx, events, createEvent),
    command_setBooleanState: (device, props) => commandSetBooleanState(device, props, lifx, events, createEvent),
    command_breatheEffect: (device, props) => commandBreatheEffect(device, props, lifx, events, createEvent),
    command_pulseEffect: (device, props) => commandPulseEffect(device, props, lifx, events, createEvent),
  };
};
