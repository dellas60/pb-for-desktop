'use strict';


/**
 * Modules
 * Node
 * @constant
 */
const path = require('path');
const url = require('url');

/**
 * Modules
 * Electron
 * @constant
 */
const electron = require('electron');
const { app, BrowserWindow, shell } = electron;

/**
 * Modules
 * External
 * @constant
 */
const appRootPath = require('app-root-path')['path'];

/**
 * Modules
 * Internal
 * @constant
 */
const logger = require(path.join(appRootPath, 'lib', 'logger'))({ write: true });
const platformHelper = require(path.join(appRootPath, 'lib', 'platform-helper'));


/**
 * Filesystem
 * @constant
 * @default
 */
const windowHtml = path.join(appRootPath, 'app', 'html', 'main.html');

/**
 * Application
 * @constant
 * @default
 */
const windowTitle = global.manifest.productName;
const windowUrl = url.format({ protocol: 'file:', pathname: windowHtml });


/**
 * @class MainWindow
 * @extends Electron.BrowserWindow
 * @namespace Electron
 */
class MainWindow extends BrowserWindow {
    constructor() {
        super({
            acceptFirstMouse: true,
            autoHideMenuBar: true,
            backgroundColor: platformHelper.isMacOS ? void 0 : '#95A5A6',
            frame: true,
            hasShadow: platformHelper.isMacOS ? true : void 0,
            height: void 0,
            minHeight: 256,
            minWidth: 128,
            partition: 'persist:app',
            show: true,
            thickFrame: platformHelper.isWindows ? true : void 0,
            title: windowTitle,
            titleBarStyle: platformHelper.isMacOS ? 'hiddenInset' : void 0,
            transparent: false,
            vibrancy: platformHelper.isMacOS ? 'ultra-dark' : void 0,
            webPreferences: {
                allowRunningInsecureContent: true,
                backgroundThrottling: true,
                experimentalCanvasFeatures: true,
                experimentalFeatures: true,
                nodeIntegration: true,
                scrollBounce: platformHelper.isMacOS ? true : void 0,
                webaudio: true,
                webgl: false,
                webSecurity: false
            },
            width: void 0,
            x: void 0,
            y: void 0
        });

        this.init();
    }

    /**
     * Init
     */
    init() {
        logger.debug('init');

        /**
         * @listens MainWindow#close
         */
        this.on('close', (event) => {
            logger.debug('AppWindow#close');

            if (global.state.isQuitting === false) {
                event.preventDefault();
                this.hide();
            }
        });

        /**
         * @listens MainWindow#will-navigate
         */
        this.webContents.on('will-navigate', (event, url) => {
            logger.debug('AppWindow.webContents#will-navigate');

            if (url) {
                event.preventDefault();
                shell.openExternal(url);
            }
        });


        this.loadURL(windowUrl);
    }
}


/**
 * Create instance
 */
let create = () => {
    logger.debug('create');

    if (!global.mainWindow) {
        global.mainWindow = new MainWindow();
    }
};


/**
 * @listens Electron.App#on
 */
app.on('activate', () => {
    logger.debug('app#activate');

    global.mainWindow.show();
});

/**
 * @listens Electron.App#on
 */
app.once('ready', () => {
    logger.debug('app#ready');

    create();
});


/**
 * @exports
 */
module.exports = global.mainWindow;