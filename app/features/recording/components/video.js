
// @flow
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Wrapper } from '../styled';
import '../css/video-app.css';
import config from '../../config';
import $ from 'jquery';
import icons8drag50 from '../../../images/icons8-drag-50.png';

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
//const recordedChunks = [];
/**
 * Welcome Component.
 */
class Video extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);
        this.startBtn = this.startBtn.bind(this);
        this.startBtn = this.startBtn.bind(this);
        this.viewLayout = this.viewLayout.bind(this);
        this.closeCam = this.closeCam.bind(this);
        this.state = {
          viewClass : 'circle'
        }

      
    }
   async startBtn(){
      const constraints = {
        video: true
      };
      
    
      // Create a Stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(stream);
      console.log("stream");
      const videoElement2 = document.getElementById('video_cam_circle');
      // Preview the source in a video element
      videoElement2.srcObject = stream;
      videoElement2.play();
    }
    viewLayout(action){
      this.setState({viewClass:action});
    }
    closeCam(action){
      window.close();
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
        document.getElementsByClassName('nav_bar')[0].style.display = 'none';
          this.startBtn();
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
        <div className={'Main-video ' + this.state.viewClass}>
        
         <div className="vid_wrapper">
          
          { this.renderLandingPage() }
          </div>
          <div className="dragcon">
            <span className='containerim'><img style={{height:"26px","-webkit-app-region":"drag"}}  src={icons8drag50}/></span>
          </div>
          <div className="videoOrient">
         
            <div onClick={ () => { this.viewLayout('circle') } } className="vid_circle"></div>
            <div onClick={ () => { this.viewLayout('square') } } className="vid_square">1:1</div>
            <div onClick={ () => { this.viewLayout('rectangle') } } className="Vid_rect"></div>
            <div onClick={ () => { this.closeCam('square') } } className="Vid_close">+</div>
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
             
               <video id="video_cam_circle"></video>
               
          
      )
  }
    
}
export default compose(connect(), withTranslation())(Video);