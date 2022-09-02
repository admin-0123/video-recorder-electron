
// @flow
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
// import { Wrapper } from '../styled';
// import '../css/video-app.css';
// import config from '../../config';
import crosshair from '../../../images/crosshair.png';
import $ from 'jquery';

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

var selectedColor = null; // A number from 0-9
var countDown;
	// Video recording
	var recordAudio;
	var canvasRecorder;
  	// Timer - 12:34:56
	var startTime;
	var timerInterval;
  var isDrawing = false;
  // Reference both canvases, define the initial stroke
	var canvas;
	var ctx;
	var canvas2;
	var ctx2;
	// For tracking the state
	var mouseX    = Infinity;
	var mouseY    = Infinity;
	var points    = [];
	var lastPoint = {};
	var lastAlt   = false;
	// Cache the canvas position (no need to calculate every time)
	var canvasX;
	var canvasY;
	var recordAudio;
	var canvasRecorder;
	// Countdown
	var countDown;

  function colorClick(el){
		setColor($(this).css('background-color'));
		selectedColor = parseInt($(this).text(), 10);
	}
	function setColor(color){
		ctx2.strokeStyle = color;
		ctx2.fillStyle   = color;
		$('#logo').css('background-color', color);
	}

	function startCountdown(){
		$('#start, #stop').hide();
		$('#count').text(3).show();
		countDown = setInterval(function(){
			var n = parseInt($('#count').text(), 10);
			if(n > 1){
				$('#count').text(--n);
			} else {
				startRecording();
				clearInterval(countDown);
			}
		}, 1000);
	}
	function cancelCountdown(){
		clearInterval(countDown);
		$('#stop, #count').hide();
		$('#start').show();
		stopTimer();
	}
	// Video recording

	function prepareRecorder(){
		canvasRecorder = RecordRTC($('#sketch')[0], {
			type: 'canvas',
			showMousePointer: false
		});
	}
	function startRecording(){
		//'Requesting microphone access...');
		// Request access to the microphone, then begin
		navigator.getUserMedia({ audio: true }, function(stream) {
			recordAudio = RecordRTC(stream, {
				type: 'audio',
				recorderType: StereoAudioRecorder // force WebAudio for all browsers even for Firefox/MS-Edge
			});
			recordAudio.initRecorder(function() {
				canvasRecorder.startRecording();
				recordAudio.startRecording();
			});
			// UI
			$('#start, #count').hide();
			$('#stop').show();
			startTimer();
		}, function(error){
			////log(error);
		});
	}
	function stopRecording(){
		////log('Stopping recording...');
		// UI
		$('#stop, #count').hide();
		$('#start').show();
		stopTimer();
		// Stop the audio + video
		recordAudio.stopRecording(function(){
			canvasRecorder.stopRecording(function(){
				//log('Merging Video and Audio streams (this may take a moment to begin)');
            	convertStreams(canvasRecorder.blob, recordAudio.blob);
				// window.open(urlA);
				// window.open(urlV);
			});
		});
	}
	// Timer - 12:34:56
	var startTime;
	var timerInterval;
	function startTimer(){
		stopTimer();
		startTime = Date.now();
		timerInterval = setInterval(renderTime, 50);
	}
	function stopTimer(){
		if(timerInterval){
			clearInterval(timerInterval);
		}
	}
	function renderTime(){
		if(startTime){
			var s = Math.round((Date.now()-startTime)/1000);
			var h = Math.floor(s/3600); s -= (h*3600);
			var m = Math.floor(s/60);   s -= (m*60);
			h = ('00'+h).substr(-2);
			m = ('00'+m).substr(-2);
			s = ('00'+s).substr(-2);
			$('#time').text(h+':'+m+':'+s);
		}
		setVolumePct(100*Math.random());
	}
	// Volume
	function setVolumePct(pct){
		$('#volume').css('width', pct+'%');
	}
	// Popup
	function showInfo(e){
		$('#warning-content').hide();
		$('#info-content').show();
		$('#popup').show();
		return false;
	}
	function hideInfo(){
		$('#popup').hide();
	}
	// Keyboard
	function keyDown(e){
		if(e.which >=48 && e.which <= 57){ // Numbers 0-9
			$('.color:contains("'+(e.which-48)+'")').click();
		} else if(e.which == 9){
			selectedColor += (e.shiftKey ? -1 : 1);
			selectedColor = (10+selectedColor)%10;
			$('.color:contains("'+selectedColor+'")').click();
			e.preventDefault();
			return false;
		}
	}
	



  function storeCanvasPosition(){
		var o = $('#canvas').offset();
		canvasX = o.left;
		canvasY = o.top;
	}

  function startDrawing(e){
		if(!isDrawing){
			isDrawing = true;
			addPoint();
			drawCurve();
		}
	}

  function updateDrawing(e){
		mouseX = (e.pageX-canvasX);
		mouseY = (e.pageY-canvasY);
		// HACK - holding the ALT key should also trigger drawings...
		if(!isDrawing && !lastAlt && e.altKey){
			startDrawing(e);
		}
		if(isDrawing){
			addPoint();
			drawCurve();
		}
		if(isDrawing && lastAlt && !e.altKey){
			endDrawing(e);
		}
		moveCursor();
		lastAlt = e.altKey;
	}
	function endDrawing(e){
		if(isDrawing){
			isDrawing = false;
			drawFinalCurve();
			clearPoints();
		}
	}
	function moveCursor(){
		$('#cursor').css({
			'top':  (mouseY-6)+'px',
			'left': (mouseX-6)+'px'
		});
	}
	// Curve handling
	function addPoint(){
		if(mouseX != lastPoint.x || mouseY != lastPoint.y){
			points.push({
				x: mouseX,
				y: mouseY,
			});
		}
		lastPoint.x = mouseX;
		lastPoint.y = mouseY;
	}
	function clearPoints(){
		points.length = 0;
		lastPoint.x = Infinity;
		lastPoint.y = Infinity;
	}
	function drawFinalCurve(){
		
		ctx.drawImage(canvas2, 0, 0); // Write down to real canvas
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height); // Clearing tmp canvas
	}
	function drawCurve(){
		//canvas.width = window.innerWidth
		//canvas.height = window.innerHeight
		// Clear before drawing
		ctx2.clearRect(0, 0, canvas.width, canvas.height);
		// Quadratics after we have 3 points
		if (points.length < 3) {
			var b = points[0];
			ctx2.beginPath();
			ctx2.arc(b.x, b.y, ctx2.lineWidth / 2, 0, Math.PI * 2, !0);
			ctx2.fill();
			ctx2.closePath();
			return;
		}
		// Quadratics
		ctx2.beginPath();
		ctx2.moveTo(points[0].x, points[0].y);
		for (var i = 1; i < points.length - 2; i++) {
			var c = (points[i].x + points[i + 1].x) / 2;
			var d = (points[i].y + points[i + 1].y) / 2;
			ctx2.quadraticCurveTo(points[i].x, points[i].y, c, d);
		}
		// For the last 2 points
		ctx2.quadraticCurveTo(
			points[i].x,
			points[i].y,
			points[i + 1].x,
			points[i + 1].y
		);
		ctx2.stroke();
	}


//const recordedChunks = [];
/**
 * Welcome Component.
 */
class Drawing extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

      
    }
  
    /**
     * Start Onboarding once component is mounted.
     * Start generating randdom room names.
     *
     * NOTE: It autonatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    componentDidMount() {
       setTimeout(()=>{
         canvas  = document.querySelector('#canvas');
         ctx     = canvas.getContext('2d');
         canvas2 = document.querySelector('#canvas2');
         ctx2    = canvas2.getContext('2d');
          ctx2.lineWidth   = 3;
          ctx2.lineJoin    = 'round';
          ctx2.lineCap     = 'round';
          ctx2.strokeStyle = 'blue';
          ctx2.fillStyle   = 'blue';
        $('#tools').on('click', '.color', colorClick);
        //prepareRecorder();
        $('#start').on('click', startCountdown);
        $('#count').on('click', cancelCountdown);
        $('#stop').on('click', stopRecording);
        $('.info').on('click', showInfo);
        $('#popup-close, #popup button').on('click', hideInfo);
        storeCanvasPosition();
        $(document).on('keydown', keyDown);
        $('#sketch').on('mousedown', startDrawing);
        $(document).on('mousemove',  updateDrawing);
        $(document).on('mouseup',    endDrawing);
        $('.color:contains("1")').click();
        
       },1500);
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
            // square, rectangle, default is circle
        <div >
         <div className="vid_wrapper">
          { this.renderLandingPage() }
          </div>
    
        </div>
            
        );
    }

   
 

    /**
     * Renders the header for the welcome page.
     *
     * @returns {ReactElement}
     */
     renderLandingPage() {
     
      return (
        <div id="container" >
        
          <div id="sketch">
            <canvas id="canvas" width="1920" height="1080"></canvas>
            <canvas id="canvas2" width="1920" height="1080"></canvas>
            <img id="cursor" src={crosshair}></img>
          </div>
        </div>
      )
  }
    
}
export default compose(connect(), withTranslation())(Drawing);