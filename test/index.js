/* eslint-disable new-cap, no-unused-expressions, no-undef, global-require */
const chai = require('chai');
const mockery = require('mockery');
const driverTests = require('thinglator/utils/testDriver');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);

const driverName = 'lifx';
const driverType = 'light';
const driverInterface = 'http';


describe('Lifx', () => {
    const yaLifxMock = {
        listLights: sinon.stub().returns(Promise.resolve()),
        setState: sinon.stub().returns(Promise.resolve()),
        breathe: sinon.stub().returns(Promise.resolve()),
        init: sinon.stub()
    };

    mockery.enable({
        useCleanCache: true,
        warnOnUnregistered: false
    });

    mockery.registerMock('ya-lifx', yaLifxMock);
    const Driver = require('../index');

    driverTests(driverName, Driver, driverType, driverInterface, expect);
});
