#thinglator-driver-lifx

Allows the Thinglator platform to control Lifx devices on your local network.

## Requirements

* node.js
* Thinglator - https://github.com/richardwillars/thinglator
* Active Internet connection - Ethernet or WiFi (it uses HTTP to talk to the LIFX servers)

## Installation for usage

Navigate to the root of your Thinglator installation and run:

> yarn add thinglator-driver-lifx

> yarn dev

# Installation for development

Navigate to the root of the thinglator-driver-lifx project and run:

> yarn install

> yarn link

Navigate to the root of your Thinglator installation and run:

> yarn add thinglator-driver-lifx

Go to the thinglator project and run:

> yarn link thinglator-driver-lifx

This will point thinglator/node_modules/thinglator-driver-lifx to the directory where you just installed thinglator-driver-lifx. This makes it easier for development and testing of the module.

> yarn dev

## Test

> yarn test
> or
> yarn test:watch
