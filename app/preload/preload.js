/* global process */

const { ipcRenderer,BrowserWindow ,desktopCapturer ,shell} = require('electron');
const {download} = require('electron-dl');
const { openExternalLink } = require('../features/utils/openExternalLink');
var fs = require("fs");
const appVersion = require('../../package.json').version;
var FfmpegCommand = require('fluent-ffmpeg');

import ffmpeg from 'ffmpeg-static-electron';
var ffmetadata = require("ffmetadata");
ffmetadata.setFfmpegPath(ffmpeg.path)
// Setting ffmpeg path to ffmpeg binary for os x so that ffmpeg can be packaged with the app.
FfmpegCommand.setFfmpegPath(ffmpeg.path)
// FfmpegCommand.setFfprobePath('./app/bin/ffprobe/ffprobe.exe') 

//var ffmetadata = require("ffmetadata");
//ffmetadata.setFfmpegPath('resources/ffmpeg.exe')
// Setting ffmpeg path to ffmpeg binary for os x so that ffmpeg can be packaged with the app.
//FfmpegCommand.setFfmpegPath('resources/ffmpeg.exe')
//FfmpegCommand.setFfprobePath('resources/ffprobe.exe') 
//var command = new FfmpegCommand();

const whitelistedIpcChannels = [ 'protocol-data-msg', 'renderer-ready' ];

const WINDOW_EVENTS = {
    Minimize: (name) => {
        console.log(name);
        ipcRenderer.send("win::minimize")
    } ,
    Exit: () => ipcRenderer.send("win::exit"),
}


export const MAIN_API = {
    Win: WINDOW_EVENTS,
    
}

window.snapNodeAPI = {
    "MAIN_API":MAIN_API,
    ffmpeg:FfmpegCommand,
    //fcm:command,
    download:download,
    BrowserWindow:BrowserWindow,
    openExternalLink,
    fs:fs,
    desktopCapturer:desktopCapturer,
    platform: process.platform,
    ipcRenderer:ipcRenderer,
    appVersion:appVersion,
    shell:shell,
    ipc: {
        on: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.on(channel, listener);
        },
        send: channel => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.send(channel);
        },
        removeListener: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.removeListener(channel, listener);
        }
    }
};
