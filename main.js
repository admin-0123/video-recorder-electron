/* global __dirname, process */

const { hkdf } = require('crypto');
const {
    BrowserWindow,
    Menu,
    app,
    ipcMain,
    Tray,
    globalShortcut 
} = require('electron');
const {download} = require('electron-dl');

let deeplinkingUrl, child,child2,child3,child4;
const contextMenu = require('electron-context-menu');
const debug = require('electron-debug');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const windowStateKeeper = require('electron-window-state');
const path = require('path');
const URL = require('url');
const config = require('./app/features/config');
const { openExternalLink } = require('./app/features/utils/openExternalLink');
const pkgJson = require('./package.json');

const Store = require('electron-store');

const schema = {
    startKeyCombination: {
        type: 'string',
        default: 'Alt+CommandOrControl+5',
    },
    pauseKeyCombination: {
        type: 'string',
        default: 'Alt+CommandOrControl+6',
    },
    stopKeyCombination: {
        type: 'string',
        default: 'Alt+CommandOrControl+7',
    }
}

const store = new Store({schema});

const showDevTools = Boolean(process.env.SHOW_DEV_TOOLS) || (process.argv.indexOf('--show-dev-tools') > -1);

const ENABLE_REMOTE_CONTROL = false;


// We need this because of https://github.com/electron/electron/issues/18214
app.commandLine.appendSwitch('disable-site-isolation-trials');

// This allows BrowserWindow.setContentProtection(true) to work on macOS.
// https://github.com/electron/electron/issues/19880
app.commandLine.appendSwitch('disable-features', 'IOSurfaceCapturer');

// Enable Opus RED field trial.
app.commandLine.appendSwitch('force-fieldtrials', 'WebRTC-Audio-Red-For-Opus/Enabled/');

// Enable optional PipeWire support.
if (!app.commandLine.hasSwitch('enable-features')) {
    app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');
}

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// Enable context menu so things like copy and paste work in input fields.
contextMenu({
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false,
    showCopyImageAddress: false,
    showSaveImage: false,
    showSaveImageAs: false,
    showInspectElement: true,
    showServices: false
});

// Enable DevTools also on release builds to help troubleshoot issues. Don't
// show them automatically though.
debug({
    isEnabled: true,
    showDevTools
});


function sendStatusToWindow(text) {
    logEverywhere("version => "+app.getVersion());
    logEverywhere(text);
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + JSON.stringify(err));
})
autoUpdater.on('download-progress', (progressObj) => {
    progressMsg = 'Download is in progress, Please wait! - Downloaded '+progressObj.percent + '%';
    sendStatusToWindow('Download is in progress.');
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (info) => {
  	sendStatusToWindow('Update downloaded');
  	mainWindow.webContents.send('setUpdateEvents','check');
    app.isQuiting = true;
	autoUpdater.quitAndInstall();
});

/**
 * When in development mode:
 * - Enable automatic reloads
 */
if (isDev) {
    require('electron-reload')(path.join(__dirname, 'build'));
}

/**
 * The window object that will load the iframe with  Meet.
 * IMPORTANT: Must be defined as global in order to not be garbage collected
 * acidentally.
 */
let mainWindow = null;

let webrtcInternalsWindow = null;

/**
 * Add protocol data
 */
const appProtocolSurplus = `${config.default.appProtocolPrefix}://`;
let rendererReady = false;
let protocolDataForFrontApp = null;


let traym = null
function tray(basePath) {
    //app.whenReady().then(() => {
        //  trayIcon = new Tray(path.join(basePath,'./resources/icons/icon_96x96.png'))
      
         const trayMenuTemplate = [
            {
               label: 'Record...',
               click: function () {
               // var mee =   reu()
                //console.log(mee);
                if(mainWindow!=null) {
                    if(child || child2 || child3) {
                        child.restore();
                         //shutdown();
                     } else {
                        mainWindow.webContents.send("startRec");
                     }
                } else {
                    app.quit();
                }
                
               }
            },
            
            {
               label: 'Upload...',
               click: function () {
                if(mainWindow!=null) {
                    mainWindow.show()
                    mainWindow.restore();
                } else {
                    app.quit();
                }
               
                
                  console.log("Clicked on settings")
               }
            },
            
            {
               label: 'Open Adilo Recorder',
               click: function () {
                if(mainWindow!=null) {
                    mainWindow.show()
                    mainWindow.restore()
                    mainWindow.focus();
                } else {
                    app.quit();
                }
               
                  console.log("Clicked on Help")
               }
            },
            // {
            //    label: 'Settings',
            //    click: function () {
            //     mainWindow.webContents.executeJavaScript(`$('.remotepc-settings').click()` );
            //       console.log("Clicked on Help")
            //    }
            // }
            // ,
            {
               label: 'About',
               click: function () {
                if(mainWindow!=null) {
                    mainWindow.webContents.executeJavaScript(`$('.checkupdate').click()` );
                } else {
                    app.quit();
                }
                
                  console.log("Clicked on Help")
               }
            },
            // {
            //    label: 'Logout',
            //    click: function () {
            //     mainWindow.webContents.executeJavaScript(`$('.remotepc-settings').click()` );
            //       console.log("Clicked on Help")
            //    }
            // }
            
            {
               label: 'Exit',
               click: function () {
                mainWindow.webContents.executeJavaScript(`localStorage.getItem('keepRemember')`).then(function(result) {
                    
                    if(result == false)
                    {
                        mainWindow.webContents.executeJavaScript(
                            `localStorage.removeItem('userDatadetailsChat')`
                        );
                        mainWindow.webContents.executeJavaScript(
                            `localStorage.removeItem('token')`
                        );
                            app.isQuiting = true;
                            app.quit();
                    }
                    else
                    {
                            app.isQuiting = true;
                            app.quit();
                    }                
                })

               }
            }
         ]
        
        //  let trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
        //  trayIcon.setContextMenu(trayMenu)
         app.whenReady().then(() => {
            traym = new Tray(path.join(basePath,'./resources/icons/icon_16x16.png'))
            //traym.setTitle('hello world')
            let trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
            traym.setContextMenu(trayMenu)
            globalShortcut.register('Alt+CommandOrControl+5', () => {
                console.log('Electron loves global shortcuts!')
                mainWindow.webContents.send("startRec");
            })
            globalShortcut.register('Alt+CommandOrControl+6', () => {
                console.log('Electron loves global shortcuts!')
                child.webContents.send("pauseRec");
            })
            globalShortcut.register('Alt+CommandOrControl+7', () => {
                console.log('Electron loves global shortcut2s!')
                child.webContents.send("stopRec");
            })
          })
        //})
}

/**
 * Sets the application menu. It is hidden on all platforms except macOS because
 * otherwise copy and paste functionality is not available.
 */
function setApplicationMenu() {
    if (process.platform === 'darwin') {
        const template = [ {
            label: app.name,
            submenu: [
                {
                    role: 'services',
                    submenu: []
                },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }, {
            label: 'Edit',
            submenu: [ {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                selector: 'undo:'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                selector: 'redo:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                selector: 'cut:'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                selector: 'copy:'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                selector: 'paste:'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                selector: 'selectAll:'
            } ]
        }, {
            label: '&Window',
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        } ];

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
        Menu.setApplicationMenu(null);
    }
}

/**
 * Opens new window with index.html( Meet is loaded in iframe there).
 */
function createSnapByteWindow() {
    // Application menu.
    setApplicationMenu();

    // Check for Updates.
    if (!process.mas) {
       // autoUpdater.checkForUpdatesAndNotify();
    }

    // Load the previous window state with fallback to defaults.
    const windowState = windowStateKeeper({
        defaultWidth: 421,
        defaultHeight: 680
    });

    // Path to root directory.
    const basePath = isDev ? __dirname : app.getAppPath();
    tray(basePath);
    // URL for index.html which will be our entry point.
    const indexURL = URL.format({
        pathname: path.resolve(basePath, './build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    // Options used when creating the main  Meet window.
    // Use a preload script in order to provide node specific functionality
    // to a isolated BrowserWindow in accordance with electron security
    // guideline.
    const options = {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        icon: path.resolve(basePath, './resources/icons/icon_512x512.png'),
        minWidth: 421,
        minHeight: 680,
        show: false,
        title:'SnapByte',
        frame: false,
        webPreferences: {
            enableBlinkFeatures: 'RTCInsertableStreams,WebAssemblySimd,WebAssemblyCSP',
            enableRemoteModule: true,
            contextIsolation: false,
            nativeWindowOpen: true,
            nodeIntegration: false,
            preload: path.resolve(basePath, './build/preload.js')
        },
        fullscreen: false,
    };

    mainWindow = new BrowserWindow(options);
    
    windowState.manage(mainWindow);
    mainWindow.loadURL(indexURL);
    mainWindow.setFullScreen( false );
    // initPopupsConfigurationMain(mainWindow);
    // setupAlwaysOnTopMain(mainWindow);
    // setupPowerMonitorMain(mainWindow);
    // setupScreenSharingMain(mainWindow, config.default.appName, pkgJson.build.appId);
    // if (ENABLE_REMOTE_CONTROL) {
    //     new RemoteControlMain(mainWindow); // eslint-disable-line no-new
    // }

    mainWindow.webContents.on('new-window', (event, url, frameName) => {
        const target = getPopupTarget(url, frameName);

        if (!target || target === 'browser') {
            event.preventDefault();
            openExternalLink(url);
        }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    mainWindow.on('minimize',() => {
       mainWindow.minimize();
    });
    

    ipcMain.on('open-child', (event, title ,childTitle, w, h, resize, fullscreen,id) => {

        const options = {
            x: windowState.x,
            y: windowState.y,
            width: w,
            height: h,
            icon: path.resolve(basePath, './resources/icons/icon_512x512.png'),
            show: false,
            titleBarStyle: 'hidden',
            webaudio:false,
            title: title,
            resizable: resize,
            fullscreen: fullscreen,
            minimizable: false,
            maximizable: false,
            frame: false,
            transparent: true, 
            webPreferences: {
                enableBlinkFeatures: 'RTCInsertableStreams,WebAssemblySimd,WebAssemblyCSP',
                enableRemoteModule: true,
                contextIsolation: false,
                nativeWindowOpen: true,
                nodeIntegration: true,
                preload: path.resolve(basePath, './build/preload.js')
            },
        };
        if(childTitle == 'Video'){
            if (child2 == null) {
                options.parent = child;
                child2 = new BrowserWindow(options);
    
                child2.loadURL(indexURL+'?action='+title+'&mid='+id);
    
                child2.show();
                ///child2.setAlwaysOnTop(true)
                child2.webContents.on('did-finish-load',() => {
                    child2.setTitle(childTitle)
    
                });
                mainWindow.minimize()
            } else {
                child2.setTitle(childTitle)
                if (child2.isMinimized()) child.restore()
                child2.focus()
            }
            child2.on('focus',(events, args) => {
                if(child!=null ){
                    child.focus()
                    //child2.focus()
                }
            });
            child2.on('close', (events, args) => {
                //mainWindow.restore();
                //mainWindow.focus();
                // mainWindow.webContents.executeJavaScript(
                //     `$('.refresh').click();`
                // );
            })
            child2.on('closed', (events, args) => {
                child2 = null;
                 // mainWindow.restore()
                if (mainWindow === null) {
                  /// createJitsiMeetWindow('opened');
    
                } else {
                    
                    mainWindow.webContents.executeJavaScript(
                        `localStorage.setItem('refresh','true')`
                    );
                    // mainWindow.show()
                    // mainWindow.restore()
                    // mainWindow.focus();
                }
    
                   // log.info("******************************************** closed Opened ********************************************");
    
            });
            child2.on('child-2minimize',() => {
                child2.minimize();
             });
        } else if(childTitle == 'Drawing'){
           
            if (child3 == null) {
                child3 = new BrowserWindow(options);
                console.log('ddd');
                child3.loadURL(indexURL+'?action='+title+'&mid='+id);
    
                child3.show();
                child3.webContents.on('did-finish-load',() => {
                    child3.setTitle(childTitle)
    
                });
                mainWindow.minimize()
            } else {
                child3.setTitle(childTitle)
                if (child3.isMinimized()) child3.restore()
                child3.focus()
            }
            child3.on('close', (events, args) => {
              //  mainWindow.restore();
                //mainWindow.focus();
                // mainWindow.webContents.executeJavaScript(
                //     `$('.refresh').click();`
                // );
            })
            child3.on('closed', (events, args) => {
                child3 = null;
                //mainWindow.restore()
                if (mainWindow === null) {
                  /// createJitsiMeetWindow('opened');
    
                } else {
                    
                    mainWindow.webContents.executeJavaScript(
                        `localStorage.setItem('refresh','true')`
                    );
                    mainWindow.show()
                    mainWindow.restore()
                    mainWindow.focus();
                }
    
                   // log.info("******************************************** closed Opened ********************************************");
    
            });
            child3.on('child-3minimize',() => {
                child3.minimize();
             });
        }else if(childTitle == 'Preference'){
            if (child4 == null) {
                options.parent = child;
                child4 = new BrowserWindow(options);
    
                child4.loadURL(indexURL+'?action='+title+'&mid='+id);
    
                child4.show();
               
                child4.webContents.on('did-finish-load',() => {
                    child4.setTitle(childTitle)
    
                });
                mainWindow.minimize()
            } else {
                child4.setTitle(childTitle)
                if (child4.isMinimized()) child.restore()
                child4.focus()
            }
            // child4.on('focus',(events, args) => {
            //     if(child!=null ){
            //         child4.focus()
            //         //child2.focus()
            //     }
            // });
            child4.on('close', (events, args) => {
                //mainWindow.restore();
                //mainWindow.focus();
                // mainWindow.webContents.executeJavaScript(
                //     `$('.refresh').click();`
                // );
            })
            child4.on('closed', (events, args) => {
                child4 = null;
                 // mainWindow.restore()
                if (mainWindow === null) {
                  /// createJitsiMeetWindow('opened');
    
                } else {
                    
                    mainWindow.webContents.executeJavaScript(
                        `localStorage.setItem('refresh','true')`
                    );
                }
    
                   // log.info("******************************************** closed Opened ********************************************");
    
            });
            child4.on('child-2minimize',() => {
                child4.minimize();
             });
        } else {

        

        if (child == null) {
            child = new BrowserWindow(options);

            child.loadURL(indexURL+'?action='+title+'&mid='+id);

            child.show();
            //child.setAlwaysOnTop(true)
            child.webContents.on('did-finish-load',() => {
                child.setTitle(childTitle)

            });
            mainWindow.minimize()
        } else {
            child.setTitle(childTitle)
            if (child.isMinimized()) child.restore()
            child.focus()
        }
       
        child.on('close', (events, args) => {
            mainWindow.show()
            mainWindow.restore();
            mainWindow.focus();
            // mainWindow.webContents.executeJavaScript(
            //     `$('.refresh').click();`
            // );
        })
        child.on('focus',(events, args) => {
            if(child2!=null){
                child.focus()
                //child2.focus()
            }
        });
        child.on('closed', (events, args) => {
            child = null;
           // mainWindow.restore()
            if (mainWindow === null) {
              /// createJitsiMeetWindow('opened');

            } else {
                
                mainWindow.webContents.executeJavaScript(
                    `localStorage.setItem('refresh','true')`
                );
                mainWindow.show()
               
                mainWindow.restore()
                mainWindow.focus();
                //mainWindow.reload()
            }

               // log.info("******************************************** closed Opened ********************************************");

        });
        child.on('child-minimize',() => {
            child.minimize();
         });
    }
       //child.webContents.openDevTools();
    })
    ipcMain.on('full-screen', (event,action) =>  {
        console.log("full screen " + child.isFullScreen())
        child.setFullScreen(action);
        console.log("full screen " + child.isFullScreen())
        //console.log('ful');
    
    });
    ipcMain.on('close-chid2', (event,action) =>  {
        if(child2) {
            child2.close();
        }
        
        //console.log('ful');
    
    });
    ipcMain.on('resize-window', (event,args,w,h) =>  {
        child.setBounds({
            x: windowState.x,
            y: windowState.y,
            width:w,
            height:h,
            maxWidth: w,
            height: h,
        });
       // mainWindow.setResizable(true);
    })
    ipcMain.on('check-for-update',(event,args) => {
        autoUpdater.on('update-not-available', (info) => {
          child.webContents.send('no-update-available');
        })
        autoUpdater.on('update-available', (info) => {
            child.webContents.send('update-available-info',info);
            sendStatusToWindow('all set');
        })
        autoUpdater.autoDownload = false;
        autoUpdater.checkForUpdates();
    })
    ipcMain.on('downloadNow',(event,args) => {
        child.webContents.send('downloading-process');
        autoUpdater.downloadUpdate();
    })


        ipcMain.on('download-button', async (event, {url,fileName}) => {
            console.log(url);
            console.log("url->>>>>>>>>>>>>>>");
            const win = BrowserWindow.getFocusedWindow();
            const DownloadItem = await download(win, url, {
                filename: fileName
            }).then(dl => win.webContents.send("downloadComplete", dl.getSavePath()));

            console.log(DownloadItem);
        });

        ipcMain.on('add-file', async (event,{url,fileName,type}) =>  {
         // console.log(event);
          console.log(url);
          console.log(fileName);
          console.log(type);
          mainWindow.webContents.send("uploadFIle",{url,fileName,type});
        
        });
        ipcMain.on('dashboard-focus', (event,action) =>  {
            if(mainWindow) {
                mainWindow.show()
                mainWindow.restore();
                mainWindow.focus();
            }
            
            //console.log('ful');
        
        });
        ipcMain.on('setPosition', (event,action) =>  {
            if(child) {
                console.log(action);
                child.setPosition(action,0)
               
            }
        
        //console.log('ful');
    
    });

    /**
     * When someone tries to enter something like -meet://test
     *  while app is closed
     * it will trigger this event below
     */
    handleProtocolCall(process.argv.pop());
}

/**
 * Opens new window with WebRTC internals.
 */
function createWebRTCInternalsWindow() {
    const options = {
        minWidth: 800,
        minHeight: 600,
        show: true
    };

    webrtcInternalsWindow = new BrowserWindow(options);
    webrtcInternalsWindow.loadURL('chrome://webrtc-internals');
}

/**
 * Handler for application protocol links to initiate a conference.
 */
function handleProtocolCall(fullProtocolCall) {
    // don't touch when something is bad
    if (
        !fullProtocolCall
        || fullProtocolCall.trim() === ''
        || fullProtocolCall.indexOf(appProtocolSurplus) !== 0
    ) {
        return;
    }

    const inputURL = fullProtocolCall.replace(appProtocolSurplus, '');

    if (app.isReady() && mainWindow === null) {
        createSnapByteWindow();
    }

    protocolDataForFrontApp = inputURL;

    if (rendererReady) {
        mainWindow
            .webContents
            .send('protocol-data-msg', inputURL);
    }
}

/**
 * Force Single Instance Application.
 * Handle this on darwin via LSMultipleInstancesProhibited in Info.plist as below does not work on MAS
 */
const gotInstanceLock = process.platform === 'darwin' ? true : app.requestSingleInstanceLock();

if (!gotInstanceLock) {
    app.quit();
    process.exit(0);
}

/**
 * Run the application.
 */

app.on('activate', () => {
    if (mainWindow === null) {
        createSnapByteWindow();
    }
});

app.on('certificate-error',
    // eslint-disable-next-line max-params
    (event, webContents, url, error, certificate, callback) => {
        if (isDev) {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    }
);

app.on('ready', createSnapByteWindow);

if (isDev) {
    //app.on('ready', createWebRTCInternalsWindow);
}

app.on('second-instance', (event, commandLine) => {
    /**
     * If someone creates second instance of the application, set focus on
     * existing window.
     */
    if (mainWindow) {
        mainWindow.isMinimized() && mainWindow.restore();
        mainWindow.focus();

        /**
         * This is for windows [win32]
         * so when someone tries to enter something like -meet://test
         * while app is opened it will trigger protocol handler.
         */
        handleProtocolCall(commandLine.pop());
    }
});

app.on('window-all-closed', () => {
    app.quit();
});

// remove so we can register each time as we run the app.
app.removeAsDefaultProtocolClient(config.default.appProtocolPrefix);

// If we are running a non-packaged version of the app && on windows
if (isDev && process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    app.setAsDefaultProtocolClient(
        config.default.appProtocolPrefix,
        process.execPath,
        [ path.resolve(process.argv[1]) ]
    );
} else {
    app.setAsDefaultProtocolClient(config.default.appProtocolPrefix);
}

/**
 * This is for mac [darwin]
 * so when someone tries to enter something like -meet://test
 * it will trigger this event below
 */
app.on('open-url', (event, data) => {
    event.preventDefault();
    handleProtocolCall(data);
});
ipcMain.on("win::minimize", (data) => {
    //console.log(data.sender.id)
    if(data.sender.id ==1) {
         mainWindow.minimize()
    }
    // else if(data.sender.id == 4 || data.sender.id == 3 ) {
    //     if(child || child2 || child3) {
    //        child2.minimize();
    //         //shutdown();
    //     }
        
    // } 
    else {
        if(child || child2 || child3) {
           child.minimize();
            //shutdown();
        }
        
    }
  
});
ipcMain.on("win::exit", (data) =>{  console.log(data.sender) 
    if(data.sender.id ==1) {
        mainWindow.hide()
    }
    else {
        if(child || child2 || child3) {
           child.close();
            //shutdown();
        }
        
    }
    //
});
/**
 * This is to notify main.js [this] that front app is ready to receive messages.
 */
ipcMain.on('renderer-ready', () => {
    rendererReady = true;
    if (protocolDataForFrontApp) {
        mainWindow
            .webContents
            .send('protocol-data-msg', protocolDataForFrontApp);
    }
});
async function shutdown () {
    mainWindow.close();
    app.quit ();
}
function logEverywhere(s) {
    console.log(s)
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${s}")`)
    }
}
