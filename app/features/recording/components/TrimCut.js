
// @flow
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
// import { Wrapper } from '../styled';
import '../css/trim.css';
// import config from '../../config';
import crosshair from '../../../images/crosshair.png';
import $ from 'jquery';
import * as noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
var slider;
var videotag;
let blobsD = [];
let fileObject = {};
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
     handler: Function;
	 recordedChunks:[];
	 blobUrl:String;
   FileObject:Object;
   fileName:String;
   yuppy:Object;
   typeV:String
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

let ipcRenderer  =  window.snapNodeAPI.ipcRenderer;
let ffmpeg  =  window.snapNodeAPI.ffmpeg;
let fs  =  window.snapNodeAPI.fs;

//const recordedChunks = [];
/**
 * Welcome Component.
 */
class TrimCut extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);
		this.state = {
			videoSrc:'',
      videoSrc2:'',
      CutPreviewmyVideo:'',
			nouislider:0,
			startTime:0,
			endTime:0,
      totalDuration:0,
			currentTime:0,
      fullpath:'',
      blobsD:[],
      publish:false,
      canEdit:false,
      uploadFilePath:''
		  };
		  this.loadProgress =  this.loadProgress.bind(this);
		  this.updateNextProgress =  this.updateNextProgress.bind(this);
		  this.countSeconds =  this.countSeconds.bind(this);
      this.trim =  this.trim.bind(this);
      this.reset =  this.reset.bind(this);
      this.cut =  this.cut.bind(this);
      this.concatBlobData =  this.concatBlobData.bind(this);
      this.publish =  this.publish.bind(this);
      this.deleteRec =  this.deleteRec.bind(this);


      
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
		console.log("motooo")
		console.log(this.props.recordedChunks)
		console.log(this.props.blobUrl)
		var blob = new Blob(this.props.recordedChunks)
		setTimeout(()=>{
			slider = document.getElementById('slider');
			this.loadProgress();
			
		},2500);
    var THIS = this;
    ipcRenderer.on("downloadComplete", (event, file) => {
      THIS.setState({fullpath:file})
      console.log(file); // Full file path
    });
		
		
		await this.setState({videoSrc:URL.createObjectURL(this.props.blobUrl)});
		await document.getElementById("myVideo").play();
		videotag = await document.getElementById('myVideo');
		while(videotag.duration === Infinity) {
			await new Promise(r => setTimeout(r, 1000));
			videotag.currentTime = 10000000*Math.random();
			//this.setState({endTime :videotag.currentTime});
      this.setState({totalDuration :videotag.currentTime});
		  }

		
		
    }

    /**
     * Stop all timers when unmounting.
     *
     * @returns {voidd}
     */
    componentWillUnmount() {
     
    }

    calculateTimeDuration(secs) {
      var hr = Math.floor(secs / 3600);
      var min = Math.floor((secs - (hr * 3600)) / 60);
      var sec = Math.floor(secs - (hr * 3600) - (min * 60));

      if (min < 10) {
          min = "0" + min;
      }

      if (sec < 10) {
          sec = "0" + sec;
      }

      return hr + ':' + min + ':' + sec;
  }
	countSeconds(str) {
		console.log(str);
		const [hh = '0', mm = '0', ss = '0'] = (str || '0:0:0').split(':');
		const hour = parseInt(hh, 10) || 0;
		const minute = parseInt(mm, 10) || 0;
		const second = parseInt(ss, 10) || 0;
		return (hour * 3600) + (minute * 60) + (second);
	}
	async loadProgress(){
    var THIS = this;
    var fileName = this.props.FileObject.name;

    var blob = new Blob(this.props.recordedChunks)
    
    fileObject = new File([blob], fileName, {
      type: 'video/mp4'
   });
   this.setState({uploadFilePath:this.state.fullpath})

   THIS.setState({publish:true});
		 slider = await document.getElementById('slider');
		 videotag = await document.getElementById('myVideo');

		 console.log(videotag.duration);
		 //this.setState({endTime :videotag.duration});
     this.setState({totalDuration :videotag.duration});
		 noUiSlider.create(slider, {
			start: [0, this.state.totalDuration],
			step: 1,
			connect: true,
			behaviour: 'drag',
			range: {
				'min': 0,
				'max': this.state.totalDuration
			},
		});
		const lower = document.querySelector('.noUi-handle-lower .noUi-touch-area');
		lower.innerHTML = '<span class="first">0:00:00</span><span class="drag"><img src="https://snapbyte.bigcommand.io/images/menu.svg" /></span>';
		const upper = document.querySelector('.noUi-handle-upper .noUi-touch-area');
		upper.innerHTML = '<span class="last">' + this.calculateTimeDuration(this.state.totalDuration) + '</span><span class="drag"><img src="https://snapbyte.bigcommand.io/images/menu.svg" /></span>';
		if (slider && slider.noUiSlider) {
            slider.noUiSlider.on('change', this.updateNextProgress);
        }
	}
	async updateNextProgress(step) {
    console.log(step);
		videotag = await document.getElementById('myVideo');
		this.setState({startTime :step[0]});
		this.setState({endTime :step[1]});
		videotag.currentTime = this.state.startTime;
		const lower = document.querySelector('.noUi-handle-lower .noUi-touch-area .first');
		lower.innerHTML = this.calculateTimeDuration(this.state.startTime);
		const upper = document.querySelector('.noUi-handle-upper .noUi-touch-area .last');
		upper.innerHTML = this.calculateTimeDuration(this.state.endTime);
    this.setState({canEdit:true});
	}
  callback(){

  }
  publish(){
    //localStorage.setItem('fileOBJ',fileObject)
    var url = this.state.uploadFilePath;
    var type = this.props.typeV;
    var fileName = fileObject.name;
    ipcRenderer.send('add-file',{url,fileName,type});
    // this.props.yuppy.addFile({
    //   // .use(Uppy.addFile, {
    //      name: fileObject.name, // file name
    //      type: this.props.typeV, // file type
    //      data: fileObject, // file blob
    //      // meta: {
    //      //   // optional, store the directory path of a file so Uppy can tell identical files in different directories apart.
    //      //   relativePath: webkitFileSystemEntry.relativePath,
    //      // },
    //      source: '#drag-drop-area', // optional, determines the source of the file, for example, Instagram.
    //      isRemote: false, // optional, set to true if actual file is not in the browser, but on some remote server, for example,
    //      // when using companion in combination with Instagram.
    //    })
      //  document.getElementById('recCon').style.display = "flex";
      //  document.getElementById('trimCUT').style.display = "none";
       
       document.getElementsByClassName('nav_bar')[0].style.display = 'flex';
       ipcRenderer.send( 'full-screen',false);
       ipcRenderer.send('resize-window', 'recording', 750, 310, false, false );
       $('.fwyqgM').removeClass('bgnewTrim');
       this.props.handler();
       
  }
  deleteRec(){
    swal({
      title: "Are you sure?",
      text: "This will delete your current Recording",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        ipcRenderer.send( 'full-screen',false);

        location.reload();
      } else {
       
      }
    });
  }
  async reset(){
    var THIS = this;
    var fileName = this.props.FileObject.name;
    this.setState({uploadFilePath:this.state.fullpath})
    var blob = new Blob(this.props.recordedChunks)
    
    fileObject = new File([blob], fileName, {
      type: 'video/mp4'
    });
    console.log(this.props.blobUrl)
    document.getElementsByClassName('myvideo')[0].style.display = "block";
    document.getElementsByClassName('CutPreviewmyVideo')[0].style.display = "none";
    document.getElementsByClassName('sliderActionLeft')[0].style.opacity = 1;
    document.getElementById('slider').style.opacity = 1;
    // await this.setState({videoSrc:URL.createObjectURL(this.props.blobUrl)});
		// await document.getElementById("myVideo").play();
		// videotag = await document.getElementById('myVideo');
    // document.getElementsByClassName('myvideo')[0].style.display = "none";
    // document.getElementsByClassName('CutPreviewmyVideo')[0].style.display = "block";
		// while(videotag.duration === Infinity) {
		// 	await new Promise(r => setTimeout(r, 1000));
		// 	videotag.currentTime = 10000000*Math.random();
		// 	//this.setState({endTime :videotag.currentTime});
    //   this.setState({totalDuration :videotag.currentTime});
      
		//   }

  }
    async trim(){
      if(this.state.canEdit== false){
        swal('Please select the duration for this feature, or you can publish original file.')
        return false;
      }
      this.setState({publish:false});
      $('.second').show();
      var THIS = this;
      console.log(this.state.fullpath);
      var outputName = 'trim_'+this.props.FileObject.name;
      console.log(this.props.FileObject);
      // var fileBuffer = Buffer.from([this.props.FileObject])
      // console.log(fileBuffer);
      // var file = fs.readFile(fileBuffer , async function (err, data) {
      //   console.log(data);
        var cmd =  await ffmpeg().input(this.state.fullpath).setStartTime(this.state.startTime)
        .setDuration(this.state.endTime)
        .output(outputName)
        .on('error', function(err) {
          console.log(err);
          $('.second').hide();
        })
        .on('end', 
          function() {
            console.log(outputName);
            fs.readFile(outputName , async function (err, data) {
              videotag = await document.getElementById('CutPreviewmyVideo');
              console.log(videotag);
              videotag.src = URL.createObjectURL(new Blob([data.buffer], {type: '*'}));
              document.getElementsByClassName('myvideo')[0].style.display = "none";
              document.getElementsByClassName('CutPreviewmyVideo')[0].style.display = "block";
              document.getElementsByClassName('sliderActionLeft')[0].style.opacity = 0;
              document.getElementById('slider').style.opacity = 0;
              const blob = new Blob([data.buffer], {type: '*'})
              // var audioURL = window.URL.createObjectURL(blob);
          
              var fileName = outputName;
          
              // const buffer = Buffer.from(await blob.arrayBuffer());
               fileObject = new File([blob], fileName, {
                type: 'video/mp4'
             });
              videotag.pause();
              THIS.setState({publish:true});
              $('.second').hide();
              this.setState({uploadFilePath:fileName});
              // var url = URL.createObjectURL(new Blob([data.buffer], {type: '*'}));;
              // THIS.setState({videoSrc2:url});
            })
            //console.log(this.state.startTime);
              //optional callback 
               // if(callback){
               //   //returning output name and input of cut
               //   callback(outputName, input)
               // }
          }).run();

        
          console.log('loading ffmpeg');
          console.log(cmd);
    //  });
      
    
      // ffmpeg.FS('writeFile', name, await fetchFile(filename))
      // console.log('writing a file');

      // // await ffmpeg.trim(name, 'trimed.mp4', `00:00:01`, `00:00:02`);
      // await ffmpeg.run('-i', name, '-ss', start, '-to', end, 'output.mp4');
      // console.log('trim a file');

      // //  await ffmpeg.run('-i', name, 'output.mp4')
      // const data = ffmpeg.FS('readFile', 'output.mp4')
      // console.log('output readfile');
      // ffmpeg.setProgress(({ratio}) => {
      //     console.log(ratio);
      // });
    }

    async cut(){
      if(this.state.canEdit== false){
        swal('Please select the duration for this feature, or you can publish original file.')
        return false;
      }
      this.setState({publish:false});
      $('.second').show();
      var THIS = this;
      let firstStart = 0.01;
      console.log(this.state.fullpath);
      var outputName = 'cut_'+this.props.FileObject.name;
      console.log(this.props.FileObject);
      // var fileBuffer = Buffer.from([this.props.FileObject])
      // console.log(fileBuffer);
      // var file = fs.readFile(fileBuffer , async function (err, data) {
      //   console.log(data);
        var cmd =  await ffmpeg().input(this.state.fullpath).setStartTime("00:00:01")
        .setDuration(this.state.startTime)
        .output(outputName)
        .on('error', function(err) {
          console.log(err);
          $('.second').hide();
        })
        .on('end', 
          function() {
            console.log(outputName);
            fs.readFile(outputName , async function (err, data) {
              blobsD.push(new Blob([data.buffer], {type: '*'}));
              // videotag = await document.getElementById('CutPreviewmyVideo');
              // console.log(videotag);
              // videotag.src = URL.createObjectURL(new Blob([data.buffer], {type: '*'}));
              var urr1 = URL.createObjectURL(new Blob([data.buffer], {type: '*'}))
              window.localStorage.setItem('firstcutVideoURL', urr1);
              var outputName2 = 'cut_2'+THIS.props.FileObject.name;
              var outputName3 = 'cut_3'+THIS.props.FileObject.name;
              let end = THIS.state.endTime;
              let secondend = THIS.state.totalDuration;
              
              console.log(THIS.state.totalDuration);
              console.log(THIS.state.endTime);
              var newend = end;
              if(secondend == end) {
                newend = end-1;
              }
              var cmd2 =  await ffmpeg().input(THIS.state.fullpath).setStartTime(THIS.state.endTime)
              .setDuration(THIS.calculateTimeDuration(secondend-1))
              .output(outputName2)
              .on('error', function(err) {
                $('.second').hide();
              })
              .on('end', 
                function() {
                  console.log(outputName2);
                  fs.readFile(outputName2 , async function (err, data) {
                    // videotag = await document.getElementById('CutPreviewmyVideo');
                    // console.log(videotag);
                    // videotag.src = URL.createObjectURL(new Blob([data.buffer], {type: '*'}));
                    // videotag.pause();
                    blobsD.push(new Blob([data.buffer], {type: '*'}));
                    var urr = URL.createObjectURL(new Blob([data.buffer], {type: '*'}))
                    window.localStorage.setItem('secondcutVideoURL', urr);
                    //THIS.concatBlobData();
                    ffmpeg(outputName)
                    .input(outputName2)
                    .on('error', function(err) {
                      $('.second').hide();
                      console.log('An error occurred: ' + err.message);
                    })
                    .on('end', function() {
                      fs.readFile(outputName3 , async function (err, data) {
                        document.getElementsByClassName('myvideo')[0].style.display = "none";
                        document.getElementsByClassName('CutPreviewmyVideo')[0].style.display = "block";
                        document.getElementsByClassName('sliderActionLeft')[0].style.opacity = 0;
                        document.getElementById('slider').style.opacity = 0;
                        videotag = await document.getElementById('CutPreviewmyVideo');
                        console.log(videotag);
                        videotag.src = URL.createObjectURL(new Blob([data.buffer], {type: '*'}));
                        var blob = new Blob([data.buffer], {type: '*'});
                        var fileName = outputName3;
              
                          // const buffer = Buffer.from(await blob.arrayBuffer());
                          fileObject = new File([blob], fileName, {
                            type: 'video/mp4'
                        });
                        videotag.pause();
                        THIS.setState({publish:true});
                        this.setState({uploadFilePath:outputName3});
                        console.log('Merging finished !');
                      })
                      
                      $('.second').hide();
                    })
                    .mergeToFile(outputName3, '');
                    // var url = URL.createObjectURL(new Blob([data.buffer], {type: '*'}));;
                    // THIS.setState({videoSrc2:url});
                  })
                  //console.log(this.state.startTime);
                    //optional callback 
                     // if(callback){
                     //   //returning output name and input of cut
                     //   callback(outputName, input)
                     // }
                }).run();
    
              //videotag.pause();
              // var url = URL.createObjectURL(new Blob([data.buffer], {type: '*'}));;
              // THIS.setState({videoSrc2:url});
            })
            //console.log(this.state.startTime);
              //optional callback 
               // if(callback){
               //   //returning output name and input of cut
               //   callback(outputName, input)
               // }
          }).run();
        
        
          console.log('loading ffmpeg');
          console.log(cmd);
    //  });
      
    
      // ffmpeg.FS('writeFile', name, await fetchFile(filename))
      // console.log('writing a file');

      // // await ffmpeg.trim(name, 'trimed.mp4', `00:00:01`, `00:00:02`);
      // await ffmpeg.run('-i', name, '-ss', start, '-to', end, 'output.mp4');
      // console.log('trim a file');

      // //  await ffmpeg.run('-i', name, 'output.mp4')
      // const data = ffmpeg.FS('readFile', 'output.mp4')
      // console.log('output readfile');
      // ffmpeg.setProgress(({ratio}) => {
      //     console.log(ratio);
      // });
    }

    async concatBlobData() {
      var item = localStorage.getItem("firstcutVideoURL");
      var secondcutVideoURL = localStorage.getItem("secondcutVideoURL");

      var that = this;
      var videotagg = await document.getElementById('CutPreviewmyVideo');
      console.log(blobsD);
      var newBlob = blobsD.slice(item, secondcutVideoURL, 'video/webm; codecs=vorbis,vp8');

     // const newBlob = blobsD.reduce((a, b)=> new Blob([a, b], {type: "video/webm"}));

      console.log(newBlob);

      videotagg.src = URL.createObjectURL(new Blob([newBlob]));
      videotagg.pause();

  }
    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            // square, rectangle, default is circle
        <div className='trimcut' >
         {/* <video
			id="video"
			height={'300px'}
			controls 
			autoplay='true'
			src={this.state.videoSrc}>
		</video> */}
    <div className="videoContainer myvideo"> 
			<video id="myVideo" width="320" height="240" controls>
			  <source src={this.state.videoSrc} type="video/mp4"/>
			</video>
      </div>
      <div className="videoContainer CutPreviewmyVideo"> 
      <video id="CutPreviewmyVideo" width="320" height="240" controls>
			  <source src={this.state.videoSrc2} type="video/mp4"/>
			</video>
      </div>
		{/* <Nouislider
          start={[0,3]}
		  step={1}
          connect={true}
          behaviour='drag'
          range={{
            min: 0,
            max: 100
          }}
        /> */}
        <div className='sliderContainer'>
         {this.state.fullpath =='' ?
            <span id="wait">
              <p >Please wait whie its loading</p>
            </span>
            : 
            <span className='sliderActionLeft'>
              <a href='#' onClick={()=>{ this.trim() }}><svg id="crop" xmlns="http://www.w3.org/2000/svg" width="36.867" height="36.867" viewBox="0 0 36.867 36.867">
                <g id="Group_95" data-name="Group 95">
                  <g id="Group_94" data-name="Group 94">
                    <path id="Path_78" data-name="Path 78" d="M184.073,102.091h3.352V88.685a3.351,3.351,0,0,0-3.352-3.352H170.667v3.352h13.406v13.406Z" transform="translate(-157.261 -78.63)" fill="#fff"/>
                    <path id="Path_79" data-name="Path 79" d="M10.055,26.813V0H6.7V6.7H0v3.352H6.7V26.813a3.351,3.351,0,0,0,3.352,3.352H26.813v6.7h3.352v-6.7h6.7V26.813Z" fill="#fff"/>
                  </g>
                </g>
              </svg>
              </a>
              <a href='#' onClick={()=>{ this.cut() }}><svg id="scissors" xmlns="http://www.w3.org/2000/svg" width="33.209" height="29.509" viewBox="0 0 33.209 29.509">
                  <g id="Group_93" data-name="Group 93" transform="translate(0 0)">
                    <path id="Path_77" data-name="Path 77" d="M33.209,33.628a4.89,4.89,0,0,0-6.777-1.234l-11.27,7.891-4.1-2.87A5.926,5.926,0,1,0,8.569,39.76l5.019,3.514L8.57,46.789a5.932,5.932,0,1,0,2.494,2.345l4.1-2.87,11.27,7.891a4.89,4.89,0,0,0,6.777-1.235L19.431,43.275ZM5.943,37.537a3.074,3.074,0,1,1,3.074-3.074A3.074,3.074,0,0,1,5.943,37.537Zm0,17.624a3.074,3.074,0,1,1,3.074-3.074A3.074,3.074,0,0,1,5.943,55.161Z" transform="translate(0 -28.52)" fill="#fff"/>
                  </g>
                </svg>
                </a>
            </span>
          }
          <div id='slider'></div>
          <span className='span_side'>
              {this.calculateTimeDuration(this.state.startTime)} /
                {this.calculateTimeDuration(this.state.endTime) == "0:00:00" ?
                this.calculateTimeDuration(this.state.totalDuration)
                :
                this.calculateTimeDuration(this.state.endTime)
                }
            </span>
           <span>
              <a href='#' onClick={()=>{ this.reset() }}>
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                width="20px" height="20px" viewBox="0 0 512.000000 512.000000"
                preserveAspectRatio="xMidYMid meet">

                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                fill="#000000" stroke="none">
                <path d="M2730 4493 c-556 -39 -1056 -295 -1401 -719 -191 -234 -336 -541
                -398 -839 -12 -55 -27 -166 -33 -247 l-12 -148 -161 159 c-135 135 -166 160
                -198 166 -118 22 -220 -86 -188 -198 11 -36 60 -89 334 -364 364 -364 357
                -359 465 -328 55 16 67 27 379 338 274 275 323 328 334 365 32 111 -70 219
                -188 198 -33 -7 -68 -37 -247 -214 l-208 -207 5 145 c12 310 98 584 261 835
                451 693 1359 940 2098 570 393 -196 693 -542 828 -954 62 -190 74 -274 74
                -511 0 -185 -3 -229 -22 -317 -128 -589 -539 -1052 -1096 -1235 -324 -106
                -700 -107 -1015 -3 -120 40 -296 124 -388 185 -35 23 -67 39 -72 36 -5 -3 -48
                -60 -96 -126 -101 -140 -107 -116 50 -211 318 -192 636 -279 1011 -279 366 1
                685 86 989 265 597 351 965 994 965 1685 0 1022 -782 1868 -1804 1950 -124 10
                -168 10 -266 3z"/>
                </g>
                </svg>
                </a>
            </span>
            {this.state.publish  &&
              <span className='publish'>
                <a href='#' onClick={()=>{ this.publish() }}>Publish</a>
              </span>
            }
              <span className='delete'>
                <a href='#' onClick={()=>{ this.deleteRec() }}>Delete Recording</a>
              </span>
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
        
		
        </div>
      )
  }
    
}
export default compose(connect(), withTranslation())(TrimCut);