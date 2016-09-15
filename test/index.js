var chai = require('chai');
var expect = chai.expect;

var driverName = 'lifx';
var driverType = 'light';
var driverInterface = 'http';

describe('driver structure', () => {
	describe('driver methods', () => {
		it('should be exposed as a class', () => {
			var driver = require('../index');
			expect(driver).to.be.a.class;
		});

		it('should have a constructor that accepts an instance of the driver settings class and an object containing a list of interfaces', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance instanceof driver).to.equal(true);
		});

		it('should have a getName method that returns the name of the driver', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.getName).to.be.a.function;
			expect(driverInstance.getName()).to.equal(driverName);
		});

		it('should have a getType method that returns the type of the driver', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.getType).to.be.a.function;
			expect(driverInstance.getType()).to.equal(driverType);
		});

		it('should have a getInterface method that returns the interface required by the driver', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.getInterface).to.be.a.function;
			expect(driverInstance.getInterface()).to.equal(driverInterface);
		});

		it('should have a setEventEmitter method that accepts an event emitter', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.setEventEmitter).to.be.a.function;
		});

		it('should have an initDevices method that accepts an array of devices to be initialised if required', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.initDevices).to.be.a.function;
		});

		it('should have a getAuthenticationProcess method that returns the authorisation process for the driver as an array', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.getAuthenticationProcess).to.be.a.function;
			expect(driverInstance.getAuthenticationProcess()).to.be.an.array;
		});

		it('should have a discover method that promises to find and return all active devices', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.discover).to.be.a.function;
		});
	});

	describe('capability methods', () => {
		it('should have an \'capability_setState\' method that promises to set the state of a lightbulb', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.capability_setState).to.be.a.function;
		});

		it('should have an \'capability_toggle\' method that promises to toggle a lightbulb', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.capability_off).to.be.a.function;
		});

		it('should have an \'capability_breatheEffect\' method that promises to apply a breatheEffect to a lightbulb', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.capability_breatheEffect).to.be.a.function;
		});

		it('should have an \'capability_pulseEffect\' method that promises to apply a pulseEffect to a lightbulb', () => {
			var driverSettings = new class DriverSettings {
				get() {
					return Promise.resolve({});
				}
				set(settings) {
					return Promise.resolve();
				}
			}

			var interfaces = {
				http: {}
			};

			var driver = require('../index');
			var driverInstance = new driver(driverSettings, interfaces);
			expect(driverInstance.capability_pulseEffect).to.be.a.function;
		});
	});
});