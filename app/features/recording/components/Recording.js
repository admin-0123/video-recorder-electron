
// @flow
import Page from '@atlaskit/page';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Form } from 'react-bootstrap';
import  DrawingNew  from '../../recording/components/DrawingNew';
import  TrimCut  from '../../recording/components/TrimCut';
const baseURL = "https://snapbyte.bigcommand.io/";
import { getStore,getuserDetails,setStore,getStoreSingle} from '../../auth/functions';
let desktopCapturer  =  window.snapNodeAPI.desktopCapturer;
import 'bootstrap/dist/css/bootstrap.min.css';
import { Landing, Wrapper } from '../styled';
// import '../css/welcome.css';
import '../css/dashboard.css';
import '../css/electron-app.css';
import '../css/record-app.css';
import config from '../../config';
import $ from 'jquery';
import axios from "axios";
import Logon from '../../../images/marker.png';
import penfilled from '../../../images/pen-filled-writing-tool.png';
import marker from '../../../images/marker.png';
import Line9 from '../../../images/Line9.png';
import Rectangle1411 from '../../../images/Rectangle1411.png';
import Ellipse4321 from '../../../images/Ellipse4321.png';
import typography from '../../../images/typography.png';
import clean from '../../../images/clean.png';
import undo from '../../../images/undo.png';
import undo1 from '../../../images/undo-1.png';
import fontsizesvgrepocom from '../../../images/font-size-svgrepo-com.png';
import artistcolorpalettesvgrepocom from '../../../images/artist-color-palette-svgrepo-com.png';
import Logo from '../../../images/icon_512x512.png';
let ipcRenderer  =  window.snapNodeAPI.ipcRenderer;
let fs  =  window.snapNodeAPI.fs;
var THIS;
var AJAX;
var typeV;
var yuppy;
var fileName;
var downloadTimer;
var lastfile;
$(document).on('click','._mu',function(){
  $.ajax(AJAX);
});
type Props = {

    /**
     * Redux dispatch.
     */
    dispatch: Dispatch<*>;

    /**
     * React Router location object.
     */
    location: Object;

    /**
     * I18next translate function.
     */
     t: Function;
};

type State = {

    /**
     * Timer for animating the room name geneeration.
     */
    animateTimeoutId: ?TimeoutID,
    /**
     * Generated room name.
     */
    generatedRoomname: string,

    /**
     * Current room name placeholder.
     */
    roomPlaceholder: string,

    /**
     * Timer for re-generating a new room name.
     */
    updateTimeoutId: ?TimeoutID,

    /**
     * URL of the room to join.
     * If this is not a url it will be treated as room name for default domain.
     */
    url: string;
};
var blobUrl;
var FileObject;
var desktopID;
var CROP_X = 0;
var CROP_Y = 0;
var CROP_W = -1; // default width
var CROP_H = -1; // default height
var VIDEO_WIDTH = 0;
var VIDEO_HEIGHT = 0;
var MAX_VIDEO_WIDTH = 1920;
var MAX_VIDEO_HEIGHT = 1080;
var _canvas;
var _context;
var recordedChunks = [];
var htmlCanvasElement

var $container,
orig_src ,
image_target,
event_state = {},
constrain,
min_width = 0, // Change as required
min_height = 0,
max_width = 1920, // Change as required
max_height = 1080,
resize_canvas;


function convertSecondsToTime(given_seconds) {
  let dateObj = new Date(given_seconds * 1000),
      hours = dateObj.getUTCHours(),
      minutes = dateObj.getUTCMinutes(),
      seconds = dateObj.getSeconds();
  return hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0') + ':' +
      seconds.toString().padStart(2, '0');
}

/**
 * Crops a video frame and shows it to the user
 */
function goToAnchor(xhr){
alert();
}
function CropFrame(ev, stream, video, callback) {
    callback = callback || function() {};

    _canvas = htmlCanvasElement;

    if (CROP_X < 0) {
        CROP_X = 0;
    }
    if (CROP_Y < 0) {
        CROP_Y = 0;
    }
    if (CROP_W <= 0) {
        CROP_W = VIDEO_WIDTH;
    }
    if (CROP_H <= 0) {
        CROP_H = VIDEO_HEIGHT;
    }
    if (CROP_W > MAX_VIDEO_WIDTH) {
        CROP_W = MAX_VIDEO_WIDTH;
    }
    if (CROP_H > MAX_VIDEO_HEIGHT) {
        CROP_W = MAX_VIDEO_HEIGHT;
    }

    _canvas.width = CROP_W;
    _canvas.height = CROP_H;

    _context.drawImage(video, CROP_X, CROP_Y, CROP_W, CROP_H, 0, 0, CROP_W, CROP_H);

    // We need to scale down the image or else we get HTTP 414 Errors
    // Also we scale down because of RTC message length restriction
    var scanvas = document.createElement('canvas');
    scanvas.width = _canvas.width;
    scanvas.height = _canvas.height;

    var wRatio = _canvas.width / 320;
    var hRatio = _canvas.height / 240;
    var maxRatio = Math.max(wRatio, hRatio);
    if (maxRatio > 1) {
        scanvas.width = _canvas.width / maxRatio;
        scanvas.height = _canvas.height / maxRatio;
    }
    scanvas.getContext('2d').drawImage(_canvas, 0, 0, scanvas.width, scanvas.height);
    
    callback(scanvas.toDataURL("image/jpeg"));
}

var recorder;

async function getScreenStream(callback) {
  //alert(desktopID);
    // if (navigator.getDisplayMedia) {
    //     navigator.getDisplayMedia({
    //         video: true,
    //     }).then(screenStream => {
    //         callback(screenStream);
    //     });
    // } else if (navigator.mediaDevices.getDisplayMedia) {
    //     navigator.mediaDevices.getDisplayMedia({
    //         video: true
    //     }).then(screenStream => {
    //         callback(screenStream);
    //     });
    // } else {
    //     alert('getDisplayMedia API is not supported by this browser.');
    // }
    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: desktopID
        }
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    callback(stream);
}


 async function startRec() {
  document.querySelector('#btn-start-recording').style.display = 'none';
  $('#recCon').attr("style","padding:4px!important");
 
      // RecordRTC goes here
      // var captureStream = htmlCanvasElement.captureStream();
      // console.log(captureStream);
      // recorder = RecordRTC(captureStream, {
      //     type: 'webem'
      // });
      // recorder.startRecording();
      // if(localStorage.getItem('countDown') == 'true'){
      //   document.getElementsByClassName('nav_bar')[0].style.display = 'none';
      // ipcRenderer.send('resize-window', 'recording', 50, 250, false, false );
      // return false;
      // }
      var audioRecordConstraints = {
        
        audio: {
          //deviceId: { exact: au },
          echoCancellation: true,
        }
      };
      const audiostream = await navigator.mediaDevices.getUserMedia(audioRecordConstraints);
      var audio = audiostream.getAudioTracks();
      console.log(htmlCanvasElement);
      var Vi = htmlCanvasElement.captureStream(25).getVideoTracks();

      const options = { mimeType: 'video/webm; codecs=vp9' };
      var streamnew =  new MediaStream([audio[0], Vi[0]]);
      mediaRecorder = new MediaRecorder(streamnew);
      mediaRecorder.ondataavailable = handleDataAvailable;
      if(localStorage.getItem('countDown') == 'true'){
        THIS.setState({RecordingStarted:true});
        THIS.setState({countDown:true});
        ipcRenderer.send('resize-window', 'recording', 127, 94, false, false );
        
        document.getElementsByClassName('nav_bar')[0].style.display = 'none';
        var TH = THIS;
        var timeleft = 3;
        clearInterval(downloadTimer);
        downloadTimer = setInterval(() =>{
       
        console.log(timeleft);
        document.getElementsByClassName("recordingCountDown")[0].textContent = timeleft;
          if(timeleft <= 0) {
              clearInterval(downloadTimer);
              timeleft = 3;
              TH.setState({countDown:false});
              mediaRecorder.start();
        
              //document.querySelector('#btn-stop-recording').style.display = 'inline';
              ipcRenderer.send( 'full-screen',false);
              TH.setState({customCrop:false});
              TH.setState({RecordingStarted:true});
              const startBtn = document.getElementById('startBtn');
              document.getElementsByClassName('nav_bar')[0].style.display = 'none';
              ipcRenderer.send('resize-window', 'recording', 50, 250, false, false );
              startBtn.classList.add('is-danger');

              TH.startTimer();
          } else {
            timeleft--;
          }
        },1000);
        //setTimeout(()=>{
         
        //},3000);
        
        return false;
      }
      mediaRecorder.start();
      THIS.startTimer();

      //document.querySelector('#btn-stop-recording').style.display = 'inline';
      ipcRenderer.send( 'full-screen',false);
      THIS.setState({customCrop:false});
      THIS.setState({RecordingStarted:true});
      const startBtn = document.getElementById('startBtn');
      document.getElementsByClassName('nav_bar')[0].style.display = 'none';
      ipcRenderer.send('resize-window', 'recording', 50, 250, false, false );
      startBtn.classList.add('is-danger');
      
      //startBtn.innerText = 'Recording';
 
  //init();
};

//document.querySelector('#btn-stop-recording').onclick = function() {
  async function stopRec(){
  document.querySelector('#btn-stop-recording').style.display = 'none';
  mediaRecorder.stop();
  THIS.stopTimer();
  // recorder.stopRecording(function() {
  //     var blob = recorder.getBlob();

  //     document.querySelector('#edit-panel').style.display = 'none';
  //     mediaElement.style.display = 'block';

  //     mediaElement.srcObject = null;
  //     mediaElement.src = URL.createObjectURL(blob);

  //     if (mediaElement.screen && mediaElement.screen.getVideoTracks) {
  //         mediaElement.screen.stop();
  //         mediaElement.screen = null;
  //     }
      

  //     document.querySelector('#btn-start-recording').style.display = 'inline';
  // });
};



function handleDataAvailable(event) {
  console.log("data-available");
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    console.log(recordedChunks);
    download();

  }
}

function downloadFile(fileName){
  const downloadLink = document.getElementById('downloadfile');

  var blob = new Blob(recordedChunks, {
    type: 'video/mp4'
  });
 
  //const filename = 'RTC';

  var url = URL.createObjectURL(blob);
  console.log(url)
  fileName = fileName;
  ipcRenderer.send('download-button',{url,fileName});
  if(localStorage.getItem('openEditor') == 'true'){
    THIS.setState({trimCut:true}) 
    localStorage.setItem('trim',true);
    localStorage.setItem('trim',true);
    $('.fwyqgM').addClass('bgnewTrim')
    //ipcRenderer.send( 'full-screen',true);
    ipcRenderer.send('resize-window', 'recording', 1136, 698, false, false );
  } else {
    var GO = 'yes';
    console.log('heree');
    ipcRenderer.on("downloadComplete", (event, file) => {
      //THIS.setState({fullpath:file})
      console.log('here');
      var url = file;
      var type = 'video/mp4';
     if(GO == 'yes'){
      ipcRenderer.send('add-file',{url,fileName,type});
        GO = 'no';
     }
     
    
     
      console.log(file); // Full file path
    });
  }
  // var a = document.createElement('a');
  // document.body.appendChild(a);
  // a.style = 'display: none';
  // a.href = url;
  
  // if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  //  a.download = `${fileName || 'recording'}.mp4`;
  // } else{
  //     a.download = `${fileName || 'recording'}.mp4`;
  // }
  // downloadLink.href = URL.createObjectURL(blob);
  // downloadLink.download = `${fileName || 'recording'}.mp4`;
  // //$('#download').css('display', 'block')
  // a.click();
}

function download() {
  // const downloadLink = document.getElementById('downloadfile');

  //   var blob = new Blob(recordedChunks, {
  //     type: 'video/mp4'
  //   });
   
  //   const filename = 'RTC';

  //   var url = URL.createObjectURL(blob);
  //   console.log(url)
  //   var a = document.createElement('a');
  //   document.body.appendChild(a);
  //   a.style = 'display: none';
  //   a.href = url;
    
  //   if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  //    a.download = `${filename || 'recording'}.mp4`;
  //   } else{
  //       a.download = `${filename || 'recording'}.mp4`;
  //   }
  //   downloadLink.href = URL.createObjectURL(blob);
  //   downloadLink.download = `${filename || 'recording'}.mp4`;
  //   $('#download').css('display', 'block')
   // a.click();
    //window.URL.revokeObjectURL(url);



    const blob = new Blob(recordedChunks, {
      type: 'video/mp4; codecs=vp9'
    });
    // var audioURL = window.URL.createObjectURL(blob);

    var fileName = THIS.getFileName('mp4');

    // const buffer = Buffer.from(await blob.arrayBuffer());
    var fileObject = new File([blob], fileName, {
      type: 'video/mp4'
   });
   blobUrl = blob;
   FileObject = fileObject;
   fileName = fileName;
   downloadFile(fileName)
   return false;
  //  var formData = new FormData();
  //  const userData = getStore('user_Data');
  //  const { user ,session,user_token} = userData;
   // recorded data
  //  formData.append('videoblob', fileObject);

  //  // file name
  //  formData.append('videofilename', fileObject.name);
  //  formData.append('workspaceID', session.id);
  //  formData.append('ownerID', undefined);
  //  formData.append('foldeID', 0);
 
    // const { filePath } = await dialog.showSaveDialog({
  
    //   buttonLabel: 'Save video',
    //   defaultPath: `vid-${Date.now()}.webm`
    // });
    console.log(blob);
    console.log(fileObject);
    var UnID = fileObject.name.split('.').slice(0, -1).join('.') ;
    THIS.setState({uploadInProg:true}) 
    // if(localStorage.getItem('openEditor') == 'true'){
    //   THIS.setState({trimCut:true}) 
    //   $('.fwyqgM').addClass('bgnewTrim')
    //   ipcRenderer.send( 'full-screen',true);
    // }
    const token = getStoreSingle('user_token');
    const selectedWorkspaceId = getStoreSingle('selectedWorkspaceId');
    const selectedWorkspaceUId = getStoreSingle('selectedWorkspaceUId');

    var meta_fields = {  
      duration: THIS.state.totalTimeLap,
      duration_formatted: THIS.state.TimeLap,
      drm_protection: "false",
      projectId: 'false',
      access_token: `Bearer ${token}`
  }
  //if(localStorage.getItem('openEditor') != 'true'){
     typeV = 'video/mp4';
    yuppy.addFile({
      // .use(Uppy.addFile, {
        name: fileObject.name, // file name
        type: typeV, // file type
        data: fileObject, // file blob
        // meta: {
        //   // optional, store the directory path of a file so Uppy can tell identical files in different directories apart.
        //   relativePath: webkitFileSystemEntry.relativePath,
        // },
        source: '#drag-drop-area', // optional, determines the source of the file, for example, Instagram.
        isRemote: false, // optional, set to true if actual file is not in the browser, but on some remote server, for example,
        // when using companion in combination with Instagram.
      })
   // }
  return false;
    var uppy = new Uppy.Core({
      debug: true,
      autoProceed: true,
      allowMultipleUploadBatches: true,

      restrictions: {
          //maxFileSize: 1000000,
          maxNumberOfFiles: 10,
          minNumberOfFiles: 1,
          //allowedFileTypes: ['image/*', 'video/*'],
      },
      meta:meta_fields
  }) .use(Uppy.AwsS3Multipart, {
    //uppy.AwsS3Multipart({
        limit: 2,
        companionUrl: 'https://adilo.bigcommand.com/api'
    })
    uppy.addFile({
   // .use(Uppy.addFile, {
      name: fileObject.name, // file name
      type: typeV, // file type
      data: fileObject, // file blob
      // meta: {
      //   // optional, store the directory path of a file so Uppy can tell identical files in different directories apart.
      //   relativePath: webkitFileSystemEntry.relativePath,
      // },
      source: '#drag-drop-area', // optional, determines the source of the file, for example, Instagram.
      isRemote: false, // optional, set to true if actual file is not in the browser, but on some remote server, for example,
      // when using companion in combination with Instagram.
    })
    uppy.on('file-added', (file) => {
      console.log(file);
      console.log("file");
      let vidoeTag = document.createElement('video');
      this.videoComplete = false;
      vidoeTag.src = URL.createObjectURL(file.data);
      vidoeTag.ondurationchange = function () {
          let duration = convertSecondsToTime(this.duration);
          uppy.setFileMeta(file.id, {
              duration: this.duration,
              duration_formatted: duration,
              drm_protection: 'false',
              projectId: 'false',
              access_token: `Bearer ${token}`
          });
      };
  });
    //uppy.upload().then((result) => {
     uppy.on('upload-success', async (file, response) => {
      console.info(file)
      console.info(response)
      var key = response.uploadURL
      var arr = key.split('/');
      console.info(arr)
      var data = {
        video:  { 
          "body": {
            "location": key
          },
          "uploadURL": key,
        },
        // video_id: $this.video_id,
        video_id: arr[3],
        project_id: selectedWorkspaceUId,
        fileType: file.type,
        // duration: Math.floor(this.duration),
        // duration_formatted: $this.convertSecondsToTime(this.duration),
        duration: Math.floor(file.meta.duration),
        duration_formatted: this.TimeLap,
        drm_protection: 'false',
        mediaType: 'recordCamera',
        //folder_id: 0,
        filesize: file.data.size,
        videoHeight : 0,
        videoWidth : 0,
      };
      var obj = {
        method: 'post',
        responseType: 'json',
        url: 'https://adilo.bigcommand.com/api/video-upload/s3-sign/save',
        headers: { 
            'Authorization': `Bearer ${token}`
        },
        data:data
    };
    await  axios(obj)
    .then((response)=>{
     console.log(response.data);
    
  
      })
     
    })
    //  $.ajax({
    //   url: `${config.apiUrl}api/videoUpload`, // replace with your own server URL
    //   data: formData,
    //   cache: false,
    //   contentType: false,
    //   processData: false,
    //   type: 'POST',
    //   xhr: function() {
    //     var xhr = new window.XMLHttpRequest();
    //     xhr.upload.addEventListener("progress", function(evt) {
    //         if (evt.lengthComputable) {
    //           var percentComplete = ((evt.loaded / evt.total) * 100);
            
    //           $("#"+UnID+"_progress_bar").width(percentComplete + '%');
    //           $("#"+UnID+"_progress_bar").html(percentComplete+'%');
    //           $("#"+UnID+"_uploadStatus").html('Please wait '+fileObject.name+' upload is in progress');
    //         }
    //     }, false);
    //     return xhr;
    //   },beforeSend: function(){
    //     var $html = "<div id='"+UnID+"_main' class='statusOuter'>";
    //     $html += "<div id='"+UnID+"_uploadStatus' class='uploadStatus'></div>";
    //     $html += "<div id='"+UnID+"_progress' class='progress'>";
    //     $html += "<div id='"+UnID+"_progress_bar' class='progress-bar'></div>";
    //     $html += "</div>";
    //     $html += "</div>";
    //     $('.uploadPopup').append($html);
    //     //$(".progress-bar").width('0%');
        
    //   },
    //   error:function(xhr){
    //     AJAX = this;
    //     $("#"+UnID+"_uploadStatus").html('<p style="color:#EA4335;">File upload failed, please <a class="_mu" href="#"  >retry</a> again.</p>');
          
    //   },
    //   success: function(resp){
    //     console.log(resp);
    //     if(resp.status == 'true'){
    //       $("#"+UnID+"_uploadStatus").html('<p style="color:#28A74B;">'+fileObject.name+' has uploaded successfully!</p>');
    //     }else if(resp == 'err'){
    //       $("#"+UnID+"_uploadStatus").html('<p style="color:#EA4335;">Please select a valid file to upload.</p>');
    //     }
    //     // if(resp == 'ok'){
    //     //   $("#"+UnID+"_uploadStatus").html('<p style="color:#28A74B;">File has uploaded successfully!</p>');
    //     // }else if(resp == 'err'){
    //     //   $("#"+UnID+"_uploadStatus").html('<p style="color:#EA4335;">Please select a valid file to upload.</p>');
    //     // }
    //   },
    //   headers: {
    //     'Authorization': `Bearer ${userData.access_token}`
    //    },
  
    //   });
  }





  function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function() {
        callback();
        callback = function() {};
    }, false);
    stream.addEventListener('inactive', function() {
        callback();
        callback = function() {};
    }, false);
    stream.getTracks().forEach(function(track) {
        track.addEventListener('ended', function() {
            callback();
            callback = function() {};
        }, false);
        track.addEventListener('inactive', function() {
            callback();
            callback = function() {};
        }, false);
    });
}

function querySelectorAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
}

querySelectorAll('input').forEach(function(input) {
    input.onkeyup = input.oninput = function() {
        if (!document.querySelector('#update').onclick) return;
        document.querySelector('#update').onclick();
    };
});
function init(){
    $(htmlCanvasElement).wrap('<div style="display:none" class="resize-container"></div>')
    .before('<span class="resize-handle resize-handle-nw"></span>')
    .before('<span class="resize-handle resize-handle-ne"></span>')
    .after('<span class="resize-handle resize-handle-se"></span>')
    .after('<span class="resize-handle resize-handle-sw"></span>');
    $container =  $(htmlCanvasElement).parent('.resize-container');

// Add events
$container.on('mousedown touchstart', '.resize-handle', startResize);
$container.on('mousedown touchstart', 'canvas', startMoving);

function startResize(e){
    e.preventDefault();
    e.stopPropagation();
    saveEventState(e);
    $(document).on('mousemove touchmove', resizing);
    $(document).on('mouseup touchend', endResize);
  }

function endResize(e){
    e.preventDefault();
    $(document).off('mouseup touchend', endResize);
    $(document).off('mousemove touchmove', resizing);
  }



   function resizing(e){
    var mouse={},width,height,left,top,offset=$container.offset();
    mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft(); 
    mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();
    
    // Position image differently depending on the corner dragged and constraints
    console.log(event_state.evnt.target);
    if( $(event_state.evnt.target).hasClass('resize-handle-se') ){
      width = mouse.x - event_state.container_left;
      height = mouse.y  - event_state.container_top;
      left = event_state.container_left;
      top = event_state.container_top;
    } else if($(event_state.evnt.target).hasClass('resize-handle-sw') ){
      width = event_state.container_width - (mouse.x - event_state.container_left);
      height = mouse.y  - event_state.container_top;
      left = mouse.x;
      top = event_state.container_top;
    } else if($(event_state.evnt.target).hasClass('resize-handle-nw') ){
      width = event_state.container_width - (mouse.x - event_state.container_left);
      height = event_state.container_height - (mouse.y - event_state.container_top);
      left = mouse.x;
      top = mouse.y;
      if(constrain || e.shiftKey){
        top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
      }
    } else if($(event_state.evnt.target).hasClass('resize-handle-ne') ){
      width = mouse.x - event_state.container_left;
      height = event_state.container_height - (mouse.y - event_state.container_top);
      left = event_state.container_left;
      top = mouse.y;
      if(constrain || e.shiftKey){
        top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
      }
    }
	
    // Optionally maintain aspect ratio
    if(constrain || e.shiftKey){
      height = width / orig_src.width * orig_src.height;
    }

    if(width > min_width && height > min_height && width < max_width && height < max_height){
      // To improve performance you might limit how often resizeImage() is called
      //alert();
      resizeImage(width, height);  
      // Without this Firefox will not re-calculate the the image dimensions until drag end
      $container.offset({'left': left, 'top': top});
    }
  }

    function resizeImage(width, height){
    resize_canvas.width = width;
    resize_canvas.height = height;
    resize_canvas.getContext('2d').drawImage(orig_src, 0, 0, width, height);   
    $(image_target).attr('src', resize_canvas.toDataURL("image/png"));  
  };

 function startMoving(e){
    e.preventDefault();
    e.stopPropagation();
    saveEventState(e);
    $(document).on('mousemove touchmove', moving);
    $(document).on('mouseup touchend', endMoving);
  };

 function endMoving(e){
    e.preventDefault();
    $(document).off('mouseup touchend', endMoving);
    $(document).off('mousemove touchmove', moving);
  };

 function moving(e){
    var  mouse={}, touches;
    e.preventDefault();
    e.stopPropagation();
    
    touches = e.originalEvent.touches;
    
    mouse.x = (e.clientX || e.pageX || touches[0].clientX) + $(window).scrollLeft(); 
    mouse.y = (e.clientY || e.pageY || touches[0].clientY) + $(window).scrollTop();
    $container.offset({
      'left': mouse.x - ( event_state.mouse_x - event_state.container_left ),
      'top': mouse.y - ( event_state.mouse_y - event_state.container_top ) 
    });
    // Watch for pinch zoom gesture while moving
    if(event_state.touches && event_state.touches.length > 1 && touches.length > 1){
      var width = event_state.container_width, height = event_state.container_height;
      var a = event_state.touches[0].clientX - event_state.touches[1].clientX;
      a = a * a; 
      var b = event_state.touches[0].clientY - event_state.touches[1].clientY;
      b = b * b; 
      var dist1 = Math.sqrt( a + b );
      
      a = e.originalEvent.touches[0].clientX - touches[1].clientX;
      a = a * a; 
      b = e.originalEvent.touches[0].clientY - touches[1].clientY;
      b = b * b; 
      var dist2 = Math.sqrt( a + b );

      var ratio = dist2 /dist1;

      width = width * ratio;
      height = height * ratio;
      // To improve performance you might limit how often resizeImage() is called
      resizeImage(width, height);
    }
  }

   function saveEventState(e){
    // Save the initial event details and container state
    event_state.container_width = $container.width();
    event_state.container_height = $container.height();
    event_state.container_left = $container.offset().left; 
    event_state.container_top = $container.offset().top;
    event_state.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft(); 
    event_state.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();
	
	// This is a fix for mobile safari
	// For some reason it does not allow a direct copy of the touches property
	if(typeof e.originalEvent.touches !== 'undefined'){
		event_state.touches = [];
		$.each(e.originalEvent.touches, function(i, ob){
		  event_state.touches[i] = {};
		  event_state.touches[i].clientX = 0+ob.clientX;
		  event_state.touches[i].clientY = 0+ob.clientY;
		});
	}
    event_state.evnt = e;
  };


 

}

function crop(){
  //Find the part of the image that is inside the crop box
  var crop_canvas,
      left = $('#mydiv').offset().left - $container.offset().left,
      top =  $('#mydiv').offset().top - $container.offset().top,
      width = $('#mydiv').width(),
      height = $('#mydiv').height();
      if (left >= 0) {
          CROP_X = left;
      }
      if (top >= 0) {
          CROP_Y = top;
      }

      CROP_W = width || 0;
      CROP_H = height || 0;
      ipcRenderer.send( 'full-screen',false);
      startRec();

}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


// Query the element


// The current position of mouse
let x = 0;
let y = 0;

// The dimension of the element
let w = 0;
let h = 0;

// Handle the mousedown event
// that's triggered when user drags the resizer
const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    var ele = document.getElementById('mydiv');
    // Calculate the dimension of element
    const styles = window.getComputedStyle(ele);
    w = parseInt(styles.width, 10);
    h = parseInt(styles.height, 10);

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    var ele = document.getElementById('mydiv');
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    // Adjust the dimension of element
    ele.style.width = `${w + dx}px`;
    ele.style.height = `${h + dy}px`;
};

const mouseUpHandler = function () {
    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};





let mediaRecorder; // MediaRecorder instance to capture footage

var startTime;
var timerInterval;

//const recordedChunks = [];
/**
 * Welcome Component.
 */
class Recording extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);
        this.state = {
          screenData:[],
          RecordingStarted:false,
          audioData:[],
          videoData:[],
          customCrop:false,
          DrawingTool:false,
          TimeLap:'0:00:00',
          playbtn:false,
          sourceAudio:'',
          onlyAudio:false,
          uploadInProg:false,
          uploadInProgSHow:false,
          totalTimeLap:'0',
          trimCut:false,
          countDown:false,
          screenicon:true,
          camicon:true,
          micicon:true
        };
        this.handleDataAvailable = this.handleDataAvailable.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.selectSource = this.selectSource.bind(this);
        this.startBtn = this.startBtn.bind(this);
        this.stopBtn = this.stopBtn.bind(this);
        this.showcustomSelection = this.showcustomSelection.bind(this);
        this.selectVideoSource = this.selectVideoSource.bind(this);
        this.drawing_tool = this.drawing_tool.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.renderTime = this.renderTime.bind(this);
        this._resetRecording = this._resetRecording.bind(this);
        this.closeRec = this.closeRec.bind(this);
        this._playPause = this._playPause.bind(this);
        this.selectAudioSource = this.selectAudioSource.bind(this);
        this.viewStatus = this.viewStatus.bind(this);
        this.Upfn =  this.Upfn.bind(this);
        this.handler =  this.handler.bind(this);
        this.enableDisableIcon =  this.enableDisableIcon.bind(this);
        THIS = this;
        this.Exit = this.Exit.bind(this);
        ipcRenderer.send( 'full-screen',false);
        ipcRenderer.send('resize-window', 'recording', 750, 310, false, false );
      
    }

  async  enableDisableIcon(action){
      console.log(action);
      if(action == 'screenicon') {
        await this.setState({screenicon:!this.state.screenicon});
        $('#screen_source').val('').change()
        $('#screen_source').attr('disabled',!this.state.screenicon);
       
       // if(this.state.screenicon){
         
          $('#audioSel').val('').change()
          this.selectAudioSource('');
          //$('#vide_E').val('').change()
          //this.selectVideoSource('');
       // }
        this.selectSource('');
      } else if(action == 'micicon') {
        await this.setState({micicon:!this.state.micicon});
        $('#audioSel').val('').change()
        $('#audioSel').attr('disabled',!this.state.micicon);
        this.selectAudioSource('');
      //  if(this.state.micicon){
         
          
          $('#vide_E').val('').change()
          this.selectVideoSource('');
          $('#screen_source').val('').change()
          this.selectSource('');
       // }
        //this.selectSource('');
      }  if(action == 'camicon') {
        console.log(this.state.camicon);
        var icc = false;
        if(this.state.camicon) {
          icc = false;
        } else {
          icc = true;
        }
       
        console.log(icc);
        await   this.setState({camicon:icc});
        $('#vide_E').val('').change()
        await this.selectVideoSource('');
        await  $('#vide_E').attr('disabled',!icc);
      
        
        // if(this.state.camicon){
        //   $('#vide_E').val('').change()
        //   this.selectVideoSource('');
        //   $('#screen_source').val('').change()
        //   this.selectSource('');
        // }
        
      }

    }
    handler(){
      this.setState({trimCut:false});
      document.getElementsByClassName('nav_bar')[0].style.display = 'none';
      localStorage.setItem('trim',false);
      document.getElementsByClassName('nav_bar_2')[0].style.display = 'flex';
      //alert()
    }
    viewStatus(action) {
      if(action == 'close') {
          this.setState({uploadInProgSHow:false});
      } else {
        this.setState({uploadInProgSHow:true});
      }
    }
    getRandomString() {
      if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
          var a = window.crypto.getRandomValues(new Uint32Array(3)),
              token = '';
          for (var i = 0, l = a.length; i < l; i++) {
              token += a[i].toString(36);
          }
          return token;
      } else {
          return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
      }
    }
     getFileName(fileExtension) {
      var d = new Date();
      var year = d.getUTCFullYear();
      var month = d.getUTCMonth();
      var date = d.getUTCDate();
      return 'RecordRTC-' + year + month + date + '-' + this.getRandomString() + '.' + fileExtension;
    }
   async handleDataAvailable(e) {
        console.log('video data available');
        recordedChunks.push(e.data);
      }
      async  handleStop(e) {
        var blob;
         typeV = 'video/mp4';
        //var blob = mediaRecorder.getBlob();
        if(this.state.onlyAudio){
             blob = new Blob(recordedChunks, {
              type: 'audio/mp3'
            });
            // var audioURL = window.URL.createObjectURL(blob);
    
            var fileName = this.getFileName('mp3');
    
            // const buffer = Buffer.from(await blob.arrayBuffer());
            var fileObject = new File([blob], fileName, {
              type: 'audio/mp3'
          });
          typeV = 'audio';
        } else {
           blob = new Blob(recordedChunks, {
            type: 'video/mp4; codecs=opus'
          });
          // var audioURL = window.URL.createObjectURL(blob);
  
          var fileName = this.getFileName('mp4');
  
          // const buffer = Buffer.from(await blob.arrayBuffer());
          var fileObject = new File([blob], fileName, {
            type: 'video/mp4'
         });
        }
         
        //  var formData = new FormData();
        //  const userData = getStore('user_Data');
        //  const { user ,session,user_token} = userData;
        //  // recorded data
        //  formData.append('videoblob', fileObject);
        //  formData.append('filetype', typeV);
        //  // file name
        //  formData.append('videofilename', fileObject.name);
        //  formData.append('workspaceID', session.id);
        //  formData.append('ownerID', undefined);
        //  formData.append('foldeID', 0);
       
          // const { filePath } = await dialog.showSaveDialog({
        
          //   buttonLabel: 'Save video',
          //   defaultPath: `vid-${Date.now()}.webm`
          // });
          console.log(blob);
          console.log(fileObject);
          blobUrl = blob;
          FileObject = fileObject;
          fileName = fileName;
          downloadFile(fileName)
          var UnID = fileObject.name.split('.').slice(0, -1).join('.') ;
          this.setState({uploadInProg:true}) 
          if(localStorage.getItem('openEditor') == 'true'){
            this.setState({trimCut:true}) 
            localStorage.setItem('trim',true);
            $('.fwyqgM').addClass('bgnewTrim')
             ipcRenderer.send('resize-window', 'recording', 1136, 698, false, false );
            //ipcRenderer.send( 'full-screen',true);
          }
        

          const token = getStoreSingle('user_token');
          const selectedWorkspaceId = getStoreSingle('selectedWorkspaceId');
          const selectedWorkspaceUId = getStoreSingle('selectedWorkspaceUId');

          var meta_fields = {  
            duration: THIS.state.totalTimeLap,
            duration_formatted: THIS.state.TimeLap,
            drm_protection: "false",
            projectId: 'false',
            access_token: `Bearer ${token}`
        }
console.log(yuppy);
        if(localStorage.getItem('openEditor') != 'true'){
            yuppy.addFile({
              // .use(Uppy.addFile, {
                name: fileObject.name, // file name
                type: typeV, // file type
                data: fileObject, // file blob
                // meta: {
                //   // optional, store the directory path of a file so Uppy can tell identical files in different directories apart.
                //   relativePath: webkitFileSystemEntry.relativePath,
                // },
                source: '#drag-drop-area', // optional, determines the source of the file, for example, Instagram.
                isRemote: false, // optional, set to true if actual file is not in the browser, but on some remote server, for example,
                // when using companion in combination with Instagram.
              })
          }
        return false;
          var uppy = new Uppy.Core({
            debug: true,
            autoProceed: true,
            allowMultipleUploadBatches: true,

            restrictions: {
                //maxFileSize: 1000000,
                maxNumberOfFiles: 10,
                minNumberOfFiles: 1,
                //allowedFileTypes: ['image/*', 'video/*'],
            },
            meta:meta_fields
        }) .use(Uppy.AwsS3Multipart, {
          //uppy.AwsS3Multipart({
              limit: 2,
              companionUrl: 'https://adilo.bigcommand.com/api'
          })
          uppy.addFile({
         // .use(Uppy.addFile, {
            name: fileObject.name, // file name
            type: typeV, // file type
            data: fileObject, // file blob
            // meta: {
            //   // optional, store the directory path of a file so Uppy can tell identical files in different directories apart.
            //   relativePath: webkitFileSystemEntry.relativePath,
            // },
            source: 'Local', // optional, determines the source of the file, for example, Instagram.
            isRemote: false, // optional, set to true if actual file is not in the browser, but on some remote server, for example,
            // when using companion in combination with Instagram.
          })
          uppy.on('file-added', (file) => {
            console.log(file);
            console.log("file");
            let vidoeTag = document.createElement('video');
            this.videoComplete = false;
            vidoeTag.src = URL.createObjectURL(file.data);
            vidoeTag.ondurationchange = function () {
                let duration = convertSecondsToTime(this.duration);
                uppy.setFileMeta(file.id, {
                    duration: this.duration,
                    duration_formatted: duration,
                    drm_protection: 'false',
                    projectId: 'false',
                    access_token: `Bearer ${token}`
                });
            };
        });
          //uppy.upload().then((result) => {
           uppy.on('upload-success', async (file, response) => {
            console.info(file)
            console.info(response)
            var key = response.uploadURL
            var arr = key.split('/');
            console.info(arr)
            var data = {
              video:  { 
                "body": {
                  "location": key
                },
                "uploadURL": key,
              },
              // video_id: $this.video_id,
              video_id: arr[3],
              project_id: selectedWorkspaceUId,
              fileType: file.type,
              // duration: Math.floor(this.duration),
              // duration_formatted: $this.convertSecondsToTime(this.duration),
              duration: Math.floor(file.meta.duration),
              duration_formatted: this.TimeLap,
              drm_protection: 'false',
              mediaType: 'recordCamera',
              //folder_id: 0,
              filesize: file.data.size,
              videoHeight : 0,
              videoWidth : 0,
            };
            var obj = {
              method: 'post',
              responseType: 'json',
              url: 'https://adilo.bigcommand.com/api/video-upload/s3-sign/save',
              headers: { 
                  'Authorization': `Bearer ${token}`
              },
              data:data
          };
          await  axios(obj)
          .then((response)=>{
           console.log(response.data);
          
        
            })
           
          })
         // uppy.upload()
          //  $.ajax({
          //   url: `${config.apiUrl}api/videoUpload`, // replace with your own server URL
          //   data: formData,
          //   cache: false,
          //   contentType: false,
          //   processData: false,
          //   type: 'POST',
          //   xhr: function() {
          //       var xhr = new window.XMLHttpRequest();
          //       xhr.upload.addEventListener("progress", function(evt) {
          //           if (evt.lengthComputable) {
          //               var percentComplete = ((evt.loaded / evt.total) * 100);
                       
          //               $("#"+UnID+"_progress_bar").width(percentComplete + '%');
          //               $("#"+UnID+"_progress_bar").html(percentComplete+'%');
          //               $("#"+UnID+"_uploadStatus").html('Please wait '+fileObject.name+' upload is in progress');
          //               // $(".progress-bar").width(percentComplete + '%');
          //               // $(".progress-bar").html(percentComplete+'%');
          //               // $('#uploadStatus').html('Please wait '+fileObject.name+' upload is in progress');
          //           }
          //       }, false);
          //       return xhr;
          //   },beforeSend: function(){
          //     var $html = "<div id='"+UnID+"_main' class='uploadContainer'><span class='uploadStop'>+</span>";
          //     $html += "<div id='"+UnID+"_uploadStatus' class='uploadStatus'></div>";
          //     $html += "<div id='"+UnID+"_progress' class='progress'>";
          //     $html += "<div id='"+UnID+"_progress_bar' class='progress-bar'></div>";
          //     $html += "</div>";
          //     $html += "</div>";
          //     $('.uploadPopup').append($html);
          //     //$(".progress-bar").width('0%');
          //    // $('#uploadStatus').html('<img src="https://i.gifer.com/ZWdx.gif"/>');
          //   },
          //   error:function(xhr){
          //       AJAX = this;
          //       $("#"+UnID+"_uploadStatus").html('<p style="color:#EA4335;">File upload failed, please <a class="_mu" href="#"  >retry</a> again.</p>');
                
          //   },
          //   success: function(resp){
          //     //alert();
          //     console.log(resp);
          //       if(resp.status == 'true'){
          //         $("#"+UnID+"_uploadStatus").html('<p style="color:#28A74B;">'+fileObject.name+' has uploaded successfully!</p>');
          //       }else if(resp == 'err'){
          //         $("#"+UnID+"_uploadStatus").html('<p style="color:#EA4335;">Please select a valid file to upload.</p>');
          //       }
          //   },
          //   headers: {
          //     'Authorization': `Bearer ${userData.access_token}`
          //    },
            
          //   });
        
         // writeFile(filePath, buffer, () => console.log('video saved successfully!'));
        }
      
        Exit(par){
          console.log(par);
          if(localStorage.getItem('trim')=='true' && par == "?action=recording&mid=undefined"){
              swal({
                  title: "Are you sure?",
                  text: "This will delete your current Recording",
                  icon: "warning",
                  buttons: true,
                  dangerMode: true,
                })
                .then((willDelete) => {
                  if (willDelete) {
                      window.snapNodeAPI.MAIN_API.Win.Exit(window.location.search)
                  } else {
                   
                  }
                });
          } else {
              window.snapNodeAPI.MAIN_API.Win.Exit(window.location.search)
  
          }
          //window.snapNodeAPI.MAIN_API.Win.Exit(window.location.search)
  
      }
      async startBtn() {
        console.log($('#screen_source :selected').attr('data-name'));
      //  console.log($('#screen_source :selected').attr('data-name'));
      if($('#screen_source :selected').attr('data-name') == undefined && $('#audioSel :selected').attr('data-name') == undefined  && $('#vide_E :selected').attr('data-name') == undefined ) {
        swal('Select atleast one source!!')
        return false;
      }
      // return false;
        if(($('#screen_source :selected').attr('data-name') == 'Entire Screen')){
        } else {
         
          await this.setState({DrawingTool : false});
          document.getElementById("chk1").checked = false;
        }
        if(localStorage.getItem('countDown') == 'true'){
          this.setState({RecordingStarted:true});
          this.setState({countDown:true});
          ipcRenderer.send('resize-window', 'recording', 127, 94, false, false );
          
          document.getElementsByClassName('nav_bar')[0].style.display = 'none';
          var TH = this;
          var timeleft = 3;
          clearInterval(downloadTimer);
          downloadTimer = setInterval(() =>{
         
          console.log(timeleft);
          document.getElementsByClassName("recordingCountDown")[0].textContent = timeleft;
            if(timeleft <= 0) {
                clearInterval(downloadTimer);
                timeleft = 3;
                TH.setState({countDown:false});
                mediaRecorder.start();
                TH.setState({RecordingStarted:true});
                const startBtn = document.getElementById('startBtn');
                document.getElementsByClassName('nav_bar')[0].style.display = 'none';
              
                if(TH.state.DrawingTool){
                  // ipcRenderer.send( 'full-screen',true);
                  ipcRenderer.send('resize-window', 'recording', 450, 1250, false, false );
                } else{
                  ipcRenderer.send('resize-window', 'recording', 50, 250, false, false );
                }
                TH.startTimer();
            } else {
              timeleft--;
            }
          },1000);
          //setTimeout(()=>{
           
          //},3000);
          
          return false;
        }
         mediaRecorder.start();
         this.setState({RecordingStarted:true});
         const startBtn = document.getElementById('startBtn');
         document.getElementsByClassName('nav_bar')[0].style.display = 'none';
        
        if(this.state.DrawingTool){
          ipcRenderer.send( 'full-screen',true);
        } else{
          ipcRenderer.send('resize-window', 'recording', 50, 250, false, false );
        }
        this.startTimer();
        //ipcRenderer.send('open-child', 'drawing','Drawing', 200, 624, true, false,'s');
        //startBtn.classList.add('is-danger');
        //startBtn.innerText = 'Recording';
    }
    stopBtn() {
         // const stopBtn = document.getElementById('stopBtn');
       const startBtn = document.getElementById('startBtn');
       if(localStorage.getItem('openEditor') == 'true'){
        document.getElementsByClassName('nav_bar')[0].style.display = 'flex';
       }
     
       ipcRenderer.send( 'full-screen',false);
       ipcRenderer.send('resize-window', 'recording', 750, 310, false, false );
       this.setState({RecordingStarted:false});
       const videoElement2 = document.getElementById('video_cam');
       var Vi = videoElement2.captureStream(25).getVideoTracks();
       if(Vi[0] != undefined) {
        Vi[0].stop();
       }
       
       mediaRecorder.stop();
       $('#screen_source').val('').change()
       this.selectVideoSource('');
       $('#vide_E').val('').change()
       this.stopTimer();
       ipcRenderer.send('close-chid2');
   
    }
    async  getVideoSources() {
        const inputSources = await desktopCapturer.getSources({
          types: ['window', 'screen']
        });
        console.log(inputSources);
        desktopID = inputSources[0].id;
        this.setState({ screenData: inputSources });
        var THIS = this;
        let videoObj = [];
        let audioObj = [];
        // const videoOptionsMenu = Menu.buildFromTemplate(
        //   inputSources.map(source => {
        //     return {
        //       label: source.name,
        //       click: () => selectSource(source)
        //     };
        //   })
        // );
      
      
        // videoOptionsMenu.popup();
        navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices.forEach(function(device) {
              if(device.kind == 'videoinput') {
                var objV = {
                  id:device.deviceId,
                  name: device.label
                }
                videoObj.push(objV);
              } else if(device.kind == 'audioinput') {
                var objA = {
                  id:device.deviceId,
                  name: device.label
                }
                audioObj.push(objA);
              }
              
              console.log(device.kind + ": " + device.label +
                          " id = " + device.deviceId);
            });
            THIS.setState({ audioData: audioObj });
            THIS.setState({ videoData: videoObj });
          })
          .catch(function(err) {
            console.log(err.name + ": " + err.message);
          });
      }

      async selectSource(source) {
        if(($('#screen_source').val() == '') || ($('#screen_source :selected').attr('data-name') == 'Entire Screen')){
          if(this.state.camicon) {
            $('#vide_E').attr('disabled',false);
          }
         
        } else {
          $('#vide_E').attr('disabled',true);
          this.setState({DrawingTool : false});
          document.getElementById("chk1").checked = false;
          
        }
        recordedChunks = [];
        //$('#screen_source').val('').change()
      //  if(this.state.camicon) {
          this.selectVideoSource('');
          $('#vide_E').val('').change()
       // }
       
 

        //videoSelectBtn.innerText = source.name;
      let sourceId = source.target.value;
      if(sourceId=='custom'){
        this.showcustomSelection();
        return false;
      }
      console.log(  source.target.value);
        const constraints = {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId
            }
          }
        };
         let au = $('#audioSel').val();
        var audioRecordConstraints = {
          
          audio: {
          //  deviceId: { exact: au },
            echoCancellation: true,
          }
        };
        // var audioRecordConstraints = {
        
        //   audio: {
        //     //deviceId: { exact: au },
        //     echoCancellation: true,
        //   }
        // };
        const audiostream = await navigator.mediaDevices.getUserMedia(audioRecordConstraints);
        var audio = audiostream.getAudioTracks();
      
        // Create a Stream
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(stream);
        console.log("stream");
         const videoElement = document.getElementById('video');
        // Preview the source in a video element
        videoElement.srcObject = stream;
        videoElement.play();
        var Vi = videoElement.captureStream(25).getVideoTracks();
      
        // Create the Media Recorder
        const options = { mimeType: 'video/webm; codecs=vp9' };
       if(this.state.micicon) {
        var streamnew =  new MediaStream([audio[0], Vi[0]]);
       } else {
        var streamnew =  stream;
       }
       // mediaRecorder = new MediaRecorder(stream, options);
     
       mediaRecorder = new MediaRecorder(streamnew);
      
        // Register Event Handlers
        mediaRecorder.ondataavailable = this.handleDataAvailable;
        mediaRecorder.onstop = this.handleStop;
      }


      async selectVideoSource(source) {
        let sourceId;
        recordedChunks = [];
        if(source!='' || source == undefined){
          sourceId = source.target.value;
        }
        console.log(this.state.camicon);
        
        if(($('#screen_source').val() == '') || ($('#screen_source :selected').attr('data-name') == 'Entire Screen')){
          if(this.state.camicon) {
            $('#vide_E').attr('disabled',false);
          }
          //$('#vide_E').attr('disabled',false);
        } else {
          this.setState({DrawingTool : false});
          document.getElementById("chk1").checked = false;
          $('#vide_E').attr('disabled',true);
          return false;
        }
        if(sourceId=='' || sourceId == undefined) {
          const videoElement2 = document.getElementById('video_cam');
          var Vi = videoElement2.captureStream(25).getVideoTracks();
          if(Vi[0]!= undefined){
            Vi[0].stop();
            ipcRenderer.send('close-chid2');
          }
         
          return false;
        }
        console.log(  source.target.value);
          const constraints = {
            video: true
          };
          let au = $('#audioSel').val();
          var audioRecordConstraints = {
            
            audio: {
            //  deviceId: { exact: au },
              echoCancellation: true,
            }
          };
          // var audioRecordConstraints = {
          
          //   audio: {
          //     //deviceId: { exact: au },
          //     echoCancellation: true,
          //   }
          // };
          if(($('#screen_source').val() == '') || ($('#screen_source :selected').attr('data-name') == 'Entire Screen')){
            const audiostream = await navigator.mediaDevices.getUserMedia(audioRecordConstraints);
            var audio = audiostream.getAudioTracks();
          
            // Create a Stream
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log(stream);
            console.log("stream");
            ipcRenderer.send('open-child', 'video','Video', 200, 624, true, false ,sourceId);
            const videoElement2 = document.getElementById('video_cam');
            // Preview the source in a video element
            videoElement2.srcObject = stream;
            videoElement2.play();
            var Vi = videoElement2.captureStream(25).getVideoTracks();
            if(($('#screen_source :selected').attr('data-name') == 'Entire Screen')){
             return false;
            }
            this.setState({DrawingTool : false});
            document.getElementById("chk1").checked = false;
            mediaRecorder = null ;
            // Create the Media Recorder
            const options = { mimeType: 'video/webm; codecs=vp9' };
          // mediaRecorder = new MediaRecorder(stream, options);
          if(this.state.micicon) {
            var streamnew =  new MediaStream([audio[0], Vi[0]]);
           } else {
            var streamnew =  stream;
           }
           // var streamnew =  new MediaStream([audio[0], Vi[0]]);
            console.log(streamnew);
            mediaRecorder = new MediaRecorder(streamnew);
            console.log(mediaRecorder);
          //   // Register Event Handlers
            mediaRecorder.ondataavailable = this.handleDataAvailable;
            mediaRecorder.onstop = this.handleStop;
          }
        
      }
      async selectAudioSource(source) {
        this.setState({sourceAudio:source});
        if(($('#screen_source').val() == '') || ($('#screen_source :selected').attr('data-name') == 'Entire Screen')){
         
        } else {
          this.setState({DrawingTool : false});
          document.getElementById("chk1").checked = false;
        }
        if(source!='' && $('#screen_source').val() == '' && $('#vide_E').val() == '' ) {
          this.setState({DrawingTool : false});
          document.getElementById("chk1").checked = false;
          
          this.setState({onlyAudio:true});
          var audioRecordConstraints = {
            
            audio: {
            //  deviceId: { exact: au },
              echoCancellation: true,
            }
          };
          // var audioRecordConstraints = {
          
          //   audio: {
          //     //deviceId: { exact: au },
          //     echoCancellation: true,
          //   }
          // };
          const audiostream = await navigator.mediaDevices.getUserMedia(audioRecordConstraints);
          //var audio = audiostream.getAudioTracks();
          mediaRecorder = new MediaRecorder(audiostream);
          // Register Event Handlers
          mediaRecorder.ondataavailable = this.handleDataAvailable;
          mediaRecorder.onstop = this.handleStop;
        } else {
          this.setState({onlyAudio:false});
        }

      }

      showcustomSelection(){
        document.getElementsByClassName('nav_bar_2')[0].style.display = 'none';

        document.getElementsByClassName('nav_bar')[0].style.display = 'none';
        ipcRenderer.send( 'full-screen',true);
        $('#recCon').attr("style","padding:0px!important");
       //ipcRenderer.send('resize-window', 'recording', 1136, 590, false, false );
        dragElement(document.getElementById("mydiv"));
                // Query all resizers
        const ele = document.getElementById('mydiv');
        const resizers = ele.querySelectorAll('.resizer');

      // Loop over them
      [].forEach.call(resizers, function (resizer) {
          resizer.addEventListener('mousedown', mouseDownHandler);
      });
      document.getElementById("x").value = CROP_X;
      document.getElementById("y").value = CROP_Y;
      document.getElementById("w").value = CROP_W;
      
      document.getElementById("h").value = CROP_H;

      document.getElementById("update").onclick = function() {
        var x = document.getElementById("x").value << 0;
        var y = document.getElementById("y").value << 0;
        var w = document.getElementById("w").value << 0;
        var h = document.getElementById("h").value << 0;
    
        if (x >= 0) {
            CROP_X = x;
        }
        if (y >= 0) {
            CROP_Y = y;
        }
    
        CROP_W = w || 0;
        CROP_H = h || 0;
    };
    htmlCanvasElement = document.querySelector('canvas');
    orig_src = htmlCanvasElement;
    image_target = htmlCanvasElement;
    resize_canvas = document.createElement('canvas');

// Form elements



        _context = htmlCanvasElement.getContext('2d');
    

        this.setState({customCrop:!this.state.customCrop});
        var mediaElement = document.querySelector('#mediaElement');
        getScreenStream( async function(screen) {
          var inited = false;
  
          mediaElement.ontimeupdate = function(ev) {
              if (!inited) {
                  VIDEO_WIDTH = mediaElement.offsetWidth;
                  VIDEO_HEIGHT = mediaElement.offsetHeight;
  
                  mediaElement.style.display = 'none';
                  document.querySelector('#edit-panel').style.display = 'block';
  
                  inited = true;
              }
  
              CropFrame(ev, screen, mediaElement);
              init();
             
          };
  
              mediaElement.srcObject = screen;
              mediaElement.screen = screen;
  
              addStreamStopListener(screen, function() {
                  document.querySelector('#btn-stop-recording').onclick();
              });
          });
      }

    drawing_tool(e) {
      let isChecked = e.target.checked;
      console.log(isChecked);
      this.setState({DrawingTool : isChecked});
    }

    startTimer(){
      ipcRenderer.send('setPosition',window.screen.availLeft);
      this.stopTimer();
      startTime = Date.now();
      timerInterval = setInterval(this.renderTime, 50);
    }
    stopTimer(){
      if(timerInterval){
        clearInterval(timerInterval);
      }
    }
    renderTime(){
      if(startTime){
        var s = Math.round((Date.now()-startTime)/1000);
        var h = Math.floor(s/3600); s -= (h*3600);
        var m = Math.floor(s/60);   s -= (m*60);
        h = ('00'+h).substr(-2);
        m = ('00'+m).substr(-2);
        s = ('00'+s).substr(-2);
        this.setState({TimeLap:h+':'+m+':'+s});
        this.setState({totalTimeLap:s});
       // $('#time').text();
      }
    }
    _playPause(){
      if(this.state.playbtn) {
        mediaRecorder.resume()  
        timerInterval = setInterval(this.renderTime, 50);
      } else {
        
        clearInterval(timerInterval);
        mediaRecorder.pause()
      }
      this.setState({playbtn:!this.state.playbtn})
      
    }
    _resetRecording(){
      mediaRecorder.pause()

      ipcRenderer.send('resize-window', 'recording', 440, 351, false, false );

      swal({
        title: "Are you sure?",
        text: "Restart this Recording",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
           recordedChunks = [];
           this.startTimer();
           ipcRenderer.send('resize-window', 'recording', 50, 250, false, false );
           // swal("Poof! Your imaginary file has been deleted!", {
          //   icon: "success",
          // });
        } else {
          ipcRenderer.send('resize-window', 'recording', 50, 250, false, false );
          
          mediaRecorder.resume()
          //swal("Your imaginary file is safe!");
        }
      });
    }
    closeRec(){
      mediaRecorder.pause()
      ipcRenderer.send('resize-window', 'recording', 440, 351, false, false );

      swal({
        title: "Are you sure?",
        text: "Delete this  Recording",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
           recordedChunks = [];
           location.reload();

           // swal("Poof! Your imaginary file has been deleted!", {
          //   icon: "success",
          // });
        } else {
          ipcRenderer.send('resize-window', 'recording', 50, 250, false, false );
          mediaRecorder.resume()
          //swal("Your imaginary file is safe!");
        }
      });
    }
    /**
     * Start Onboarding once component is mounted.
     * Start generating randdom room names.
     *
     * NOTE: It autonatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    async componentDidMount() {
      document.getElementsByClassName('nav_bar')[0].style.display = 'none';
      document.getElementsByClassName('nav_bar_2')[0].style.display = 'flex';
      
      ipcRenderer.on('stopRec', (event) =>  {
          this.stopBtn();
      
      });
    ipcRenderer.on('pauseRec', (event) =>  {
        this._playPause()
    
    });
        // ipcRenderer.send( 'resize-to-default' );
        // this.props.dispatch(push('/', {
        //     token:''
        // }));
        // this.props.dispatch(startOnboarding('welcome-page'));
        localStorage.setItem('trim',false);
        await this.Upfn();
        this.getVideoSources();   
        console.log(recordedChunks);
        console.log("recordedChunks");
      }
      
     async  Upfn(){
        const userData = getStore('user_Data');
        
        const token = getStoreSingle('user_token');
        const selectedWorkspaceId = getStoreSingle('selectedWorkspaceId');
        const selectedWorkspaceUId = getStoreSingle('selectedWorkspaceUId');


        const { user ,session,user_token} = userData;
        console.log("userDatauserDatauserDatauserData");
        console.log(userData.access_token);
        var meta_fields = {  
                // duration: "129",
                // duration_formatted: "00:02:09",
                // drm_protection: "false",
                // projectId: selectedWorkspaceId,
                access_token: `Bearer ${token}`
            }
        var auto = localStorage.getItem('openEditor') ? false : true;
        yuppy = await new Uppy.Core({
            debug: true,
            autoProceed: true,
            allowMultipleUploadBatches: true,

            restrictions: {
                //maxFileSize: 1000000,
                maxNumberOfFiles: 10,
                minNumberOfFiles: 1,
               // allowedFileTypes: ['image/*', 'video/*'],
            },
            meta:meta_fields
        })
        .use(Uppy.Dashboard, {
            inline: true,
            target: '#drag-drop-area',
            showProgressDetails: true,
            width: 368,
            height: 100,
            thumbnailWidth : 40,

        })
        .use(Uppy.AwsS3Multipart, {
            limit: 2,
            companionUrl: `${config.apiUrl}api`
        })
        uppy.on('file-added', (file) => {
            console.log(file);
            console.log("file");
            let vidoeTag = document.createElement('video');
            this.videoComplete = false;
            vidoeTag.src = URL.createObjectURL(file.data);
            vidoeTag.ondurationchange = function () {
                let duration = convertSecondsToTime(this.duration);
                uppy.setFileMeta(file.id, {
                    duration: this.duration,
                    duration_formatted: duration,
                    drm_protection: 'false',
                    projectId: 'false',
                    access_token: `Bearer ${token}`
                });
            };
        });
        uppy.on('upload-success', async (file, response) => {
            console.info(file)
            console.info(response)
            var key = response.uploadURL
            var arr = key.split('/');
            console.info(arr)
            var data = {
              video:  { 
                "body": {
                  "location": key
                },
                "uploadURL": key,
              },
              // video_id: $this.video_id,
              video_id: arr[3],
              project_id: selectedWorkspaceUId,
              fileType: file.type,
              // duration: Math.floor(this.duration),
              // duration_formatted: $this.convertSecondsToTime(this.duration),
              duration: Math.floor(file.meta.duration),
              duration_formatted: this.TimeLap,
              drm_protection: 'false',
              mediaType: 'recordCamera',
              //folder_id: 0,
              filesize: file.data.size,
              videoHeight : 0,
              videoWidth : 0,
            };
            var obj = {
              method: 'post',
              responseType: 'json',
              url: `${config.apiUrl}api/video-upload/s3-sign/save`,
              headers: { 
                  'Authorization': `Bearer ${token}`
              },
              data:data
          };
          await  axios(obj)
          .then((response)=>{
           console.log(response.data);
          
        
            })
           
          })
      }

    /**
     * Stop all timers when unmounting.
     *
     * @returns {voidd}
     */
    componentWillUnmount() {
     
    }
 
    
    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            <Page >
                <div id="recordOuter" className='verticle'>
                
                   
                      
                      { this.renderLandingPage() }
                
                    
                </div>
            </Page>
        );
    }

   
 

    /**
     * Renders the header for the welcome page.
     *
     * @returns {ReactElement}
     */
     renderLandingPage() {
      const screenData =   this.state.screenData.map((item, key) =>
          <option key={key} data-thumbnail={item.thumbnail} data-name={item.name} value={item.id}>{item.name}</option>
      );
      const audioData =   this.state.audioData.map((item, key) =>
        <option key={key}  data-name={item.name} value={item.id}>{item.name}</option>
      );
      const videoData =   this.state.videoData.map((item, key) =>
        <option key={key}  data-name={item.name} value={item.id}>{item.name}</option>
    );
      return (
        <div className={ this.state.customCrop ? '':'' }>
          
              <div className='recordingCounter' style={{display: this.state.RecordingStarted ? 'flex':'none' }}  >
               
                <div className='recordingCInner'>
                  { this.state.RecordingStarted && this.state.countDown ==false ?
                        <span className="recTime">{this.state.TimeLap}</span> : ''
                  }
                  { this.state.countDown ? 
                        <span className="recordingCountDown">3</span>
                        : ''
                  }
                  {/* <span className="recTime">{this.state.TimeLap}</span> */}
                  <div style={{display: this.state.countDown ? 'none':'flex' }} className='recTimeTool'>
                    <div className='toolLeft'>
                      <button onClick={ () => {this._resetRecording() }} id='recRestart'>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20.985" height="20.994" viewBox="0 0 20.985 20.994"><g transform="translate(-0.134)"><g transform="translate(0.134)"><path d="M20.463,13.126H13.906a.656.656,0,0,0-.656.656c0,.362.343.615.623.894L15.7,16.5a7.845,7.845,0,0,1-12.819-4.69H.226a10.475,10.475,0,0,0,17.333,6.552l1.879,1.879c.353.353.664.755,1.026.755a.656.656,0,0,0,.656-.656V13.781A.609.609,0,0,0,20.463,13.126ZM.79,7.868H7.347A.656.656,0,0,0,8,7.213c0-.362-.343-.615-.623-.894L5.557,4.5a7.845,7.845,0,0,1,12.819,4.69h2.65A10.475,10.475,0,0,0,3.694,2.633L1.816.755C1.462.4,1.152,0,.79,0A.656.656,0,0,0,.134.656V7.213A.608.608,0,0,0,.79,7.868Z" transform="translate(-0.134)" fill="#707070"/></g></g></svg>
                      </button>
                      <button onClick={ () => {this._playPause() }} id='recPlayPause'>
                        {this.state.playbtn && 
                          <svg className='playIcon' xmlns="http://www.w3.org/2000/svg" width="15.616" height="21" viewBox="0 0 15.616 21"><path d="M10.5,0,21,15.616H0Z" transform="translate(15.616) rotate(90)" fill="#707070"/></svg>
                        }
                        
                        <svg className='pauseIcon' xmlns="http://www.w3.org/2000/svg" width="15" height="21" viewBox="0 0 15 21"><g transform="translate(-815 -266.5)"><line y2="21" transform="translate(817.5 266.5)" fill="none" stroke="#707070" strokeWidth="5"/><line y2="21" transform="translate(827.5 266.5)" fill="none" stroke="#707070" strokeWidth="5"/></g></svg>
                      </button>

                      <button id='recStop'  onClick={ () => {this.stopBtn() }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21"><rect width="21" height="21" fill="#e75555"/></svg>
                      </button>
                    </div>
                    <div className='toolRight'>
                    <button onClick={ () => {this.closeRec() }} id='recclose'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17"><g transform="translate(-1113 -1178)"><circle cx="8.5" cy="8.5" r="8.5" transform="translate(1113 1178)" fill="rgba(123,117,117,0.68)"/><g transform="translate(1117.286 1182.316)"><path d="M7.877,6.437,5.592,4.151l2.12-2.12A1.026,1.026,0,0,0,6.262.58L4.141,2.7,1.917.476A1.026,1.026,0,0,0,.466,1.927L2.69,4.151.3,6.54A1.026,1.026,0,1,0,1.752,7.992L4.141,5.6,6.426,7.888A1.026,1.026,0,0,0,7.877,6.437Z" transform="translate(0 -0.175)" fill="rgba(255,255,255,0.7)"/></g></g></svg>
                    </button>
                    </div>
                    { this.state.DrawingTool && 
                        <div id="tools">
                        <div className="section files d-none">
                          <div id="reset" className="button d-none"><i className="fa fa-trash-o" aria-hidden="true"></i></div>
                          <div id="tool-save" className="button d-none"><i className="fa fa-save" aria-hidden="true"></i></div>
                          <div id="tool-load" className="button d-none"><i className="fa fa-folder-open-o" aria-hidden="true"></i></div>
                          <div id="tool-screenshot" className="button d-none"><i className="fa fa-camera-retro" aria-hidden="true"></i></div>
                        </div>

                        <div className="section drawing">
                          <div id="tool-pen" className="button"><img src={penfilled} /></div>
                          <div id="tool-highlighter" className="button"><img src={marker} /></div>
                          <div id="tool-rainbow" className="button rbw d-none"><i className="fa fa-magic" aria-hidden="true"></i></div>
                          <div id="tool-mandala" className="button mandala d-none"><i className="fa fa-snowflake-o" aria-hidden="true"></i></div>
                        </div>
                        <div className="section drawing">
                          <div id="tool-line" className="button line"><img src={Line9}  /></div>
                          <div id="tool-rectangle" className="button rect"><img src={Rectangle1411} /></div>
                          <div id="tool-circle" className="button circ"><img  src={Ellipse4321} /></div>
                          <div id="tool-type" className="button font"><img src={typography} /></div>



                          <div className="section rubber">
                            <div id="tool-eraser" className="button"><img src={clean}  /></div>
                            <div id="tool-cutout" className="button d-none"><i className="fa fa-scissors" aria-hidden="true"></i></div>
                          </div>
                          <div className="section special">
                            <div id="tool-rotate-viewport" className="button rotate-viewport"><i className="fa fa-circle-o-notch" aria-hidden="true"></i></div>
                            <div id="tool-move-viewport" className="button move-viewport d-none"><i className="fa fa-hand-paper-o" aria-hidden="true"></i></div>
                          </div>
                          <div className="section special">
                            <div id="tool-zoom-out" className="button d-none"><i className="fa fa-search-minus" aria-hidden="true"></i></div>
                            <div id="tool-zoom-1" className="button d-none"><i className="fa fa-home" aria-hidden="true"></i></div>
                            <div id="tool-zoom-in" className="button d-none"><i className="fa fa-search-plus" aria-hidden="true"></i></div>
                          </div>
                          <div className="section special">
                            <div id="tool-fast-undo" className="button f-backward d-none"><i className="fa fa-fast-backward" aria-hidden="true"></i></div>
                            <div id="tool-undo" className="button undo"><img src={undo}  /></div>
                            <div id="tool-redo" className="button redo"><img  src={undo1}  /></div>
                            <div id="tool-fast-redo" className="button f-forward d-none"><i className="fa fa-fast-forward" aria-hidden="true"></i></div>
                          </div>
                          <div style={{ display: 'none' }} className="section special">
                            <hr/>
                            <span id="toolName">Tool name</span>
                          </div>
                          <a id="size_box" href="#"> <img src={fontsizesvgrepocom}  />
                          <span className="size_box">
                            <div  id="size" className="section size">
                              {/* <input className="s" id="size-slider" type ="number" min ="1" max="20"/> */}
                              <input className="slider" id="size-slider" type ="range" min ="1" max="20" step ="1" />
                            </div>
                            </span>
                          </a>
                          <a id="color_Sel" href="#"> <img src={artistcolorpalettesvgrepocom}  />
                          <span className="color_Sel">
                            <div id="colorpaletteSection"  style={{ display: 'none' }} className="section colorpicker">
                              <div id="colorpalette" className="colorpalette"></div>
                            </div>
                            <div id="colorpaletteFillSection"  style={{ display: 'none' }} className="section colorpicker">
                              <div id="colorpaletteFill" className="colorpalette"></div>
                            </div>
                            </span>
                          </a>
                        </div>
                  {/* <div className='selectedColor'>
                  <img src={Logon} width="66" height="66"></img>
                  </div>
                  <div className='toolColors'>
                    <div className='toolColorsInner'>
                  

                  <span className="color" style={{ backgroundColor: '#9CB53B' }}>1</span>
                  <span className="color" style={{backgroundColor: '#d5a0d2'}}>2</span>
                  <span className="color" style={{backgroundColor: '#FFCE41'}}>3</span>
                  <span className="color" style={{backgroundColor: '#B5683B'}}>4</span>
                  <span className="color" style={{ backgroundColor: '#b53b71'}}>5</span>
                  <span className="color" style={{ backgroundColor: '#FE7A25'}}>6</span>
                  <span className="color" style={{backgroundColor: '#9f2e2e'}}>7</span>
                  <span className="color" style={{backgroundColor: '#2D6770'}}>8</span>
                  <span className="color" style={{backgroundColor: '#26a2ad'}}>9</span>
                  <span className="color" style={{backgroundColor: '#ad13b4'}}>0</span>
                  </div>
                  </div>
                  <div className="clear"></div> */}
                 
                </div>
                    }
                  </div>
                  
                </div>
                { this.state.DrawingTool && 
                  <DrawingNew/>
                }
              </div>
              <div id="recCon" style={{display: !this.state.RecordingStarted && !this.state.trimCut ? 'block':'none' }}  className='entry-container recContainer p-relative'>
              <nav style={{display:'none'}} className='nav_bar_2'>

                <div className="navigation-left nav-side">
                
                 <a  className="logo">
                    {/* <svg xmlns="http://www.w3.org/2000/svg" baseProfile="tiny" version="1.2" viewBox="0 0 230 72" width="229"><g transform="translate(-60 -45)"><g transform="translate(41)"><text transform="translate(94 83)" fill="#fff" fontSize="35" fontFamily="SegoeUI-Bold, Segoe UI" fontWeight="700"><tspan x="0" y="0">Snapbyte</tspan></text><text transform="translate(94 113)" fill="#fff" fontSize="15" fontFamily="SegoeUI, Segoe UI"><tspan x="0" y="0">by BigCommand</tspan></text></g><g transform="translate(59 55)"><rect width="57" height="57" rx="6" transform="translate(1 1)" fill="#fbe7e3"></rect><g transform="translate(14.3 14.3)"><path d="M23.2,8A15.2,15.2,0,1,0,38.4,23.2,15.2,15.2,0,0,0,23.2,8Z" transform="translate(-8 -8)" fill="#fc573b" fillRule="evenodd"></path><path d="M19.851,11.721a8.13,8.13,0,1,0,8.13,8.13A8.13,8.13,0,0,0,19.851,11.721Z" transform="translate(-4.651 -4.651)" fill="#f9aa9d" fillRule="evenodd"></path></g></g></g></svg> */}
                    <img style={{height: '25px',width:'25px'}} alt="Adilo" src={Logo} className="logo"></img>
              </a>
                    <span className='text_log'>Adilo Recorder</span>
                </div>

                <div className="navigation-right nav-side">
                    {/* <a href="#" onClick={() => window.snapNodeAPI.MAIN_API.Win.Minimize(window.location.search)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="4" viewBox="0 0 20 4"><line x2="16" transform="translate(2 2)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="4"/></svg>
                    </a> */}
                    <a  href="#" onClick={() => this.Exit(window.location.search)}>
                       <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 15.447 15.447">
                            <g id="close" transform="translate(1.415 1.414)">
                                <line id="Line_359" data-name="Line 359" x2="17.845" transform="translate(12.618) rotate(135)" fill="none" stroke="#182e45" strokeLinecap="round" strokeWidth="2"/>
                                <line id="Line_360" data-name="Line 360" x2="17.845" transform="rotate(45)" fill="none" stroke="#182e45" strokeLinecap="round" strokeWidth="2"/>
                            </g>
                        </svg>
                    </a>
                </div>
                </nav>
                <div  style={{display: !this.state.customCrop ? 'flex':'none' }} className="row h-100 align-items-center">
                  <div className='col-sm-6'>
                    <div className='rec_left'>
                      <button id="startBtn" onClick={ () => {this.startBtn() }} className="recButton button is-primary">
                      <svg style={{width:"100%"}} xmlns="http://www.w3.org/2000/svg" baseProfile="tiny" version="1.2" viewBox="0 0 148.979 148.979" width="149"><g transform="translate(-1166.021 -142.021)"><g transform="translate(1166.021 142.021)"><path d="M167.183,107.592A59.592,59.592,0,1,1,107.592,48,59.591,59.591,0,0,1,167.183,107.592Zm0,0" transform="translate(-33.102 -33.102)" fill="#fccfcf"></path><path d="M74.49,148.979a74.49,74.49,0,1,1,74.49-74.49A74.49,74.49,0,0,1,74.49,148.979Zm0-144.013A69.524,69.524,0,1,0,144.013,74.49,69.524,69.524,0,0,0,74.49,4.966Zm0,0" fill="#e75555"></path><path d="M197.524,162.762A34.762,34.762,0,1,1,162.762,128,34.762,34.762,0,0,1,197.524,162.762Zm0,0" transform="translate(-88.272 -88.272)" fill="#e61717"></path></g><text transform="translate(1214 226)" fill="#fff" fontSize="28" fontFamily="SegoeUI-Bold, Segoe UI" fontWeight="700"><tspan x="0" y="0">REC</tspan></text></g></svg>
                      </button>
                        <button id="stopBtn" onClick={ () => {this.stopBtn() }} className="recButton button is-warning d-none">Stop</button>
                        <div className="ratio recPreview ratio-16x9">
                        <video id="video"></video>
                        <video style={{display:'none'}} id="video_cam"></video>
                        </div>
                        <Form.Group className="my-3 w-100 text-left drawingTool" controlId="chk1">
                          <Form.Check type="checkbox" onChange={ e => {this.drawing_tool(e) }} label="Drawing tools" />
                      </Form.Group>
                      <div style={{display:this.state.uploadInProg ? 'none' : 'none'}} className="UploadMessage">
                          Uploading status <a  onClick={ () => {this.viewStatus('open') }} className="showUpload">View status</a>
                      </div>
                      <div  style={{display:this.state.uploadInProgSHow ? 'block' : 'none'}} className="UploadOuter">
                       {/* <input type="file" id="drag-drop-area"></input> */}
                       

                        <div className='uploadPopup'>
                        <div className='dropFile' id="drag-drop-area"></div>
                          {/* <div id="uploadStatus"></div>
                          <div className="progress">
                              <div className="progress-bar"></div>
                          </div> */}
                          <a  onClick={ () => {this.viewStatus('close') }} className="uploadDone">Close</a>
                        </div>
                        </div>
                        
                    </div>

                  </div>
                  <div className='col-sm-6'>
                 
                    {/* <h3>Recording settings</h3> */}
                    <div className='recRightRow'>
                    <button  onClick={ () => {this.getVideoSources() }} id="videoSelectBtn" className="button btn-text is-text">
                    Select your inputs 
                      </button>
          
                    </div>
                    <div className='redRightInner mt-3'>
                      
                    <div className='recRightRow'>
                    <label>Screen</label>
                    <select id="screen_source" accessibilityelementshidden="true" style={{width: '50%'}}  importantforaccessibility="no-hide-descendants" onChange={this.selectSource}>
                      <option value="" >Select Source</option>
                      <option value="custom">Custom Size</option>
                          {screenData}
                      </select>
                    <div className='recToolIcon screenicon'>
                    <a className='screenicon' onClick={() => this.enableDisableIcon('screenicon')} href='#'>
                      <span>
                      {!this.state.screenicon && 
                        <svg xmlns="http://www.w3.org/2000/svg" width="5.917" height="5.873" viewBox="0 0 5.917 5.873">
                          <g id="cancel" transform="translate(0 -0.175)">
                            <path id="Path_1132" data-name="Path 1132" d="M5.7,4.705,4.046,3.052,5.58,1.518A.742.742,0,0,0,4.53.468L3,2,1.387.392a.742.742,0,0,0-1.05,1.05L1.946,3.052.218,4.78a.742.742,0,0,0,1.05,1.05L3,4.1,4.649,5.755A.742.742,0,0,0,5.7,4.705Z" fill="rgba(255,255,255,0.7)"/>
                          </g>
                        </svg>
                      }
                    </span>
                       <svg xmlns="http://www.w3.org/2000/svg" width="20.718" height="19.053" viewBox="0 0 20.718 19.053"><g transform="translate(-732.601 -536.998)"><g transform="translate(730.398 495.87)"><g transform="translate(0 39.184)"><g transform="translate(0 0)"><path d="M122.388,316.082l-2.225,2.9h10.289l-2.225-2.9Z" transform="translate(-112.745 -297.988)" fill="#fff"/><path d="M19.1,39.184H1.614A1.657,1.657,0,0,0,0,40.881V51.347a1.657,1.657,0,0,0,1.614,1.7H19.1a1.657,1.657,0,0,0,1.614-1.7V40.881A1.657,1.657,0,0,0,19.1,39.184Z" transform="translate(2.203 -37.24)" fill="#fff"/></g></g></g></g></svg>
                    </a>
                      </div>
                      </div>
                      <div className='recRightRow'>
                    <label>Mic</label>
                    <select onChange={this.selectAudioSource} accessibilityelementshidden="true" style={{width: '50%'}}  importantforaccessibility="no-hide-descendants" id="audioSel">
                      <option value="">Select Source</option>
                          {audioData}
                      </select>
                    <div className='recToolIcon'>
                    <a className='micicon' onClick={() => this.enableDisableIcon('micicon')} href='#'>
                      <span>
                      {!this.state.micicon && 
                        <svg xmlns="http://www.w3.org/2000/svg" width="5.917" height="5.873" viewBox="0 0 5.917 5.873">
                          <g id="cancel" transform="translate(0 -0.175)">
                            <path id="Path_1132" data-name="Path 1132" d="M5.7,4.705,4.046,3.052,5.58,1.518A.742.742,0,0,0,4.53.468L3,2,1.387.392a.742.742,0,0,0-1.05,1.05L1.946,3.052.218,4.78a.742.742,0,0,0,1.05,1.05L3,4.1,4.649,5.755A.742.742,0,0,0,5.7,4.705Z" fill="rgba(255,255,255,0.7)"/>
                          </g>
                        </svg>
                      }
                    </span>

                       <svg xmlns="http://www.w3.org/2000/svg" width="13.526" height="19.538" viewBox="0 0 13.526 19.538"><g transform="translate(-736.052 -536.998)"><g transform="translate(662.965 536.998)"><g transform="translate(73.087)"><path d="M149.936,13.526a3.767,3.767,0,0,0,3.757-3.757V3.757a3.617,3.617,0,0,0-1.1-2.654,3.741,3.741,0,0,0-5.307,0,3.618,3.618,0,0,0-1.1,2.654V9.769a3.768,3.768,0,0,0,3.757,3.757Z" transform="translate(-143.173)" fill="#fff"/><path d="M86.39,182.947a.751.751,0,0,0-1.28.528v1.5a5.26,5.26,0,0,1-10.52,0v-1.5a.752.752,0,0,0-1.5,0v1.5a6.762,6.762,0,0,0,6.012,6.716v1.55H76.093a.752.752,0,0,0,0,1.5h7.514a.752.752,0,0,0,0-1.5H80.6v-1.55a6.763,6.763,0,0,0,6.012-6.716v-1.5A.722.722,0,0,0,86.39,182.947Z" transform="translate(-73.087 -175.209)" fill="#fff"/></g></g></g></svg>
                    </a>
                      </div>
                      </div>
                      <div className='recRightRow'>
                    <label>Camera</label>
                      <select id="vide_E" accessibilityelementshidden="true" style={{width: '50%'}}  importantforaccessibility="no-hide-descendants" onChange={this.selectVideoSource}>
                      <option value="">Select Source</option>
                          {videoData}
                      </select>
                    <div className='recToolIcon'>
                    <a className='camicon' onClick={() => this.enableDisableIcon('camicon')} href='#'>
                      <span>
                    {!this.state.camicon && 
                      <svg xmlns="http://www.w3.org/2000/svg" width="5.917" height="5.873" viewBox="0 0 5.917 5.873">
                        <g id="cancel" transform="translate(0 -0.175)">
                          <path id="Path_1132" data-name="Path 1132" d="M5.7,4.705,4.046,3.052,5.58,1.518A.742.742,0,0,0,4.53.468L3,2,1.387.392a.742.742,0,0,0-1.05,1.05L1.946,3.052.218,4.78a.742.742,0,0,0,1.05,1.05L3,4.1,4.649,5.755A.742.742,0,0,0,5.7,4.705Z" fill="rgba(255,255,255,0.7)"/>
                        </g>
                      </svg>
                    }
                    </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15.63" height="19.538" viewBox="0 0 15.63 19.538"><g transform="translate(-735 -536.998)"><g transform="translate(683.8 536.998)"><g transform="translate(51.2)"><path d="M59.015,0A7.815,7.815,0,1,0,66.83,7.815,7.838,7.838,0,0,0,59.015,0Zm0,11.723a3.908,3.908,0,1,1,3.908-3.908A3.919,3.919,0,0,1,59.015,11.723Z" transform="translate(-51.2)" fill="#fff"/></g><g transform="translate(57.061 5.861)"><path d="M206.754,153.6a.732.732,0,0,0-.488.1,1.018,1.018,0,0,1-1.368,1.368.732.732,0,0,0-.1.488,1.954,1.954,0,1,0,1.954-1.954Z" transform="translate(-204.8 -153.6)" fill="#fff"/></g><g transform="translate(52.198 16.119)"><path d="M89.444,422.4a9.655,9.655,0,0,1-5.178,1.465,9.189,9.189,0,0,1-5.178-1.465l-1.661,2.735a.439.439,0,0,0,.391.684h12.7a.646.646,0,0,0,.586-.684Z" transform="translate(-77.351 -422.4)" fill="#fff"/></g></g></g></svg>
                    </a>
                      </div>
                      </div>
                    </div>
                  
                  </div>
                </div>
                <div className='customScreenCrop' style={{display: this.state.customCrop ? 'flex':'none',position: 'fixed' }}  >
                <div id="edit-panel" style={{borderBottom: '1px solid'}}>
                    <div style={{display: 'none' }}>
                        <a id="downloadfile" >
                          <button type="button" className="btn btn-primary mb-4"> Download</button>
                        </a>
                    </div>
                    <div style={{display: 'none'}}>
                        <div>
                            <label htmlFor="x">X</label>
                            <input type="number" name="x" id="x" value="0" />
                            <label htmlFor="y">Y</label>
                            <input type="number" name="y" id="y" value="0" />
                        </div>
                        <div>
                            <label htmlFor="w">Width (-1 = Full size)</label>
                            <input type="number" name="w" id="w" value="-1" />
                        </div>
                        <div>
                            <label htmlFor="h">Height (-1 = Full size)</label>
                            <input type="number" name="h" id="h" value="-1" />
                        </div>

                        <button id="update" style={{display: 'none'}}>Update X-Y Width-Height Coordinates</button>
                        <strong>Start coordinates:</strong><span id="start"></span>
                        <strong>End coordinates:</strong><span id="end"></span>
                    </div>
                    <button id="btn-start-recording" style={{display: 'none' }} onClick={ () => {startRec() }}>Start Recording</button>
                    <button id="btn-stop-recording" onClick={ () => {stopRec() }}  style={{display: 'none'}}>Stop Recording</button>
                    <div className="component">
                        <div id="mydiv">
                            <div id="mydivheader"></div>
                            <div className="resizer resizer-r"></div>
                            <div className="resizer resizer-b"></div>
                            
                        </div>
                      <canvas style={{opacity:0}}  id="selection"></canvas>
                     <button style={{position: 'fixed'}} onClick={ () => {crop() }}  className="btn-crop js-crop">Crop<svg style={{width:"87px"}} xmlns="http://www.w3.org/2000/svg" baseProfile="tiny" version="1.2" viewBox="0 0 148.979 148.979" width="149"><g transform="translate(-1166.021 -142.021)"><g transform="translate(1166.021 142.021)"><path d="M167.183,107.592A59.592,59.592,0,1,1,107.592,48,59.591,59.591,0,0,1,167.183,107.592Zm0,0" transform="translate(-33.102 -33.102)" fill="#fccfcf"></path><path d="M74.49,148.979a74.49,74.49,0,1,1,74.49-74.49A74.49,74.49,0,0,1,74.49,148.979Zm0-144.013A69.524,69.524,0,1,0,144.013,74.49,69.524,69.524,0,0,0,74.49,4.966Zm0,0" fill="#e75555"></path><path d="M197.524,162.762A34.762,34.762,0,1,1,162.762,128,34.762,34.762,0,0,1,197.524,162.762Zm0,0" transform="translate(-88.272 -88.272)" fill="#e61717"></path></g><text transform="translate(1214 226)" fill="#fff" fontSize="28" fontFamily="SegoeUI-Bold, Segoe UI" fontWeight="700"><tspan x="0" y="0">REC</tspan></text></g></svg></button>
                    </div>
                </div>

                <video id="mediaElement" autoPlay={true} playsInline={true}></video>
                
              </div> 

              </div> 
                <div className='recordingCountDown'style={{display:'none'}} >
                  3
                </div>
              <div id="trimCUT" style={{display: this.state.trimCut ? 'block':'none' }}  className='entry-container recContainer p-relative'>
              { this.state.trimCut  &&
                <TrimCut typeV={typeV} handler = {this.handler} yuppy={yuppy} fileName={fileName} recordedChunks={recordedChunks} FileObject={FileObject} blobUrl={blobUrl}/>
              }
              </div> 
          </div>
      )
  }
    
}
export default compose(connect(), withTranslation())(Recording);