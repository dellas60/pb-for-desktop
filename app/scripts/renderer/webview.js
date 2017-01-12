'use strict';


/**
 * Modules
 * Node
 * @global
 * @constant
 */
const path = require('path');
const url = require('url');

/**
 * Modules
 * Electron
 * @global
 * @constant
 */
const { ipcRenderer, remote }  = require('electron');

/**
 * Modules
 * External
 * @global
 * @constant
 */
const appRootPath = require('app-root-path').path;
const electronConnect = require('electron-connect');
const parseDomain = require('parse-domain');

/**
 * Modules
 * Internal
 * @global
 * @constant
 */
const packageJson = require(path.join(appRootPath, 'package.json'));
const logger = require(path.join(appRootPath, 'lib', 'logger'))({ writeToFile: true });
const dom = require(path.join(appRootPath, 'app', 'scripts', 'utils', 'dom'));
const isDebug = require(path.join(appRootPath, 'lib', 'is-debug'));
const isLivereload = require(path.join(appRootPath, 'lib', 'is-livereload'));
const connectivityService = require(path.join(appRootPath, 'app', 'scripts', 'services', 'connectivity-service'));


/**
 * App
 * @global
 */
let appProductName = packageJson.productName || packageJson.name;

/**
 * Live Reload
 * @global
 */
let electronConnectClient = electronConnect.client;


//noinspection JSUnresolvedFunction
/**
 * DOM Components
 */
let webview = document.getElementById('webview'),
    spinner = document.getElementById('spinner'),
    controls = document.getElementById('controls'),
    buttons = {
        home: {
            target: document.querySelector('.controls__button.home'),
            event() { webview.goBack(); }
        }
    };

/**
 * Show Spinner
 */
let presentSpinner = function() {
    dom.setVisibility(spinner, true, 1000);
};

/**
 * Hide Spinner
 */
let dismissSpinner = function() {
    dom.setVisibility(spinner, false, 1000);
};


/**
 * @listens webview:dom-ready
 */
webview.addEventListener('dom-ready', () => {
    // Register Platform
    dom.addPlatformClass();

    // Bind Controls
    for (let i in buttons) {
        buttons[i].target.addEventListener('click', buttons[i].event);
    }

    if (isDebug) {
        webview.openDevTools({ detach: true });
    }

    // Livereload
    if (isLivereload) {
        electronConnectClient.create();
    }
});

/**
 * @listens webview:did-fail-load
 */
webview.addEventListener('did-fail-load', () => {
    presentSpinner();
});

/**
 * @listens webview:did-finish-load
 */
webview.addEventListener('did-finish-load', () => {
    dismissSpinner();
});

/**
 * @listens webview:new-window
 */
webview.addEventListener('new-window', (ev) => {
    let protocol = url.parse(ev.url).protocol;

    if (protocol === 'http:' || protocol === 'https:') {
        remote.shell.openExternal(ev.url);
    }
});

/**
 * @listens webview:will-navigate
 */
webview.addEventListener('load-commit', (ev) => {
    let domain = (parseDomain(ev.url)).domain || '';

    switch (domain) {
        case 'google':
        case 'youtube':
        case 'facebook':
            dom.setVisibility(controls, true);
            break;
        default:
            dom.setVisibility(controls, false);
    }
});


connectivityService.on('connection', (message, state) => {
    if (message === 'update') {
        switch (state) {
            case 'online':
                dismissSpinner();
                break;
            case 'offline':
                presentSpinner();
                break;
        }
    }
});

