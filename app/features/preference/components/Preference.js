// @flow

import Button from '@atlaskit/button';


import { FieldTextStateless } from '@atlaskit/field-text';
import { SpotlightTarget } from '@atlaskit/onboarding';
import Page from '@atlaskit/page';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Dropdown } from 'react-bootstrap';
import {Form, Row, Col, Grid } from 'react-bootstrap';

import { Navbar } from '../../navbar';
import StepWizard from "react-step-wizard";
import axios from "axios";
const baseURL = "https://snapbyte.bigcommand.io/";
import { ActionCreators } from '../../auth/actions';
import { getStore,getuserDetails,setStore} from '../../auth/functions';

// const videoSelectBtn = document.getElementById('videoSelectBtn');
// videoSelectBtn.onclick = getVideoSources;


let desktopCapturer  =  window.snapNodeAPI.desktopCapturer;



import 'bootstrap/dist/css/bootstrap.min.css';
import { Landing, Body, FieldWrapper, Header, Label, Wrapper } from '../styled';
import '../css/welcome.css';
import '../css/dashboard.css';
import '../css/electron-app.css';
import $ from 'jquery';
let ipcRenderer  =  window.snapNodeAPI.ipcRenderer;

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
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];
/**
 * Welcome Component.
 */
class Preference extends Component<Props, State> {
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
            countdown: localStorage.getItem('countDown'),
            openEditor: localStorage.getItem('openEditor'),
            launch: localStorage.getItem('launch')
        };
        this.checkbox = this.checkbox.bind(this);
        document.getElementsByClassName('navigation-right')[0].style.display = 'none';

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
       // document.getElementsByClassName('navigation-right')[0].style.display = 'none';
       $('.cyUEve').addClass('bgnewTrim')

        // ipcRenderer.send( 'resize-to-default' );
        // this.props.dispatch(push('/', {
        //     token:''
        // }));
        // this.props.dispatch(startOnboarding('welcome-page'));

        // this._updateRoomname();
    }

    /**
     * Stop all timers when unmounting.
     *
     * @returns {voidd}
     */
    componentWillUnmount() {
     
    }
    checkbox(e,action){
        var v;
        if( localStorage.getItem(action) == 'true' ||  localStorage.getItem(action) ==true) {
            v = 'false';
        } else {
        //if( localStorage.getItem(action) == 'false' ||  localStorage.getItem(action) ==false) {
            v = 'true';
        }
        console.log(localStorage.getItem(action));
        console.log(v);
        localStorage.setItem(action,v);

    }
 
    handleShortcut = (event) => {
        console.log(event);
        const keyCode = event.keyCode;
        const key = event.key;

        if ((keyCode >= 16 && keyCode <= 18) || keyCode === 91) return;
        
        const value = [];
        event.ctrlKey ? value.push("Control") : null;
        event.shiftKey ? value.push("Shift") : null;
        event.isAlt ? value.push("Alt") : null;
        value.push(key.toUpperCase());
        console.log(value)
        // document.getElementById("hotkey").value = value.join("+");
    }
    
    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            <Page >
                <AtlasKitThemeProvider mode = 'light'>
                
                    <Wrapper>
                   
                      
                      { this.renderLandingPage() }
                
                    </Wrapper>
                </AtlasKitThemeProvider>
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
        const Co = this.state.countdown == 'true' ? true :false;
        const launch = this.state.launch == 'true' ? true :false;
        const openEditor = this.state.openEditor == 'true' ? true :false;
        return (
            <Landing>
                
                <div  className='entry-container preference text-left'>
                    <div className='ec-inner'>
                  <h2 className='p-title'>Preferences</h2>
                  <Form className='cForm'>
                  <Form.Group className="mb-3" controlId="chk1">
                    <Form.Check type="checkbox" defaultChecked={launch}  onChange={(e)=>{ this.checkbox(e,'launch')}} label="Launch app at login" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="chk2">
                    <Form.Check type="checkbox" defaultChecked={openEditor} onChange={(e)=>{ this.checkbox(e,'openEditor')}} label="Open file editor after capture" />
                </Form.Group>
                {/* <Form.Group className="mb-3" controlId="chk3">
                    <Form.Check type="checkbox" onChange={(e)=>{ this.checkbox()}} label="Open file in SnapByte dashboard after saving" />
                </Form.Group> */}
                <Form.Group className="mb-3" controlId="chk4">
                 
                 <Form.Check defaultChecked={Co} type="checkbox" onChange={(e)=>{ this.checkbox(e,'countDown')}} label="Show countdown before recording" />
                
                   
                </Form.Group>
                {/* <Form.Group className="mb-3" controlId="chk5">
                    <Form.Check type="checkbox" onChange={(e)=>{ this.checkbox()}} label="Show app notifications on desktop" />
                </Form.Group> */}
                {/* <Form.Group as={Row} className='align-items-center' >
                <Form.Label column xs="5">
                Recording quality
                    </Form.Label>
                    <Col xs="7">
                    <Form.Select className='selectSM' aria-label="Default select example">
                    <option>1080p HD</option>
                    <option>1080p HD</option>
                    <option>1080p HD</option>
                    </Form.Select>
                    </Col>
           
                </Form.Group>  */}

                <div className='mt-3' mt-3><b>Shortcuts</b></div>
                <Form.Group as={Row} className='align-items-center' >
                <Form.Label column xs="5">
                Record audio / video
                    </Form.Label>
                    <Col xs="7">
                        <input type="text" value="CTRL ALT 5" onKeyUp={(e) => { this.handleShortcut(e) }} />
                        <div className='shortcode'><span>CTRL ALT 5</span></div>
                    </Col>
           
                </Form.Group> 

                <Form.Group as={Row} className='align-items-center' >
                <Form.Label column xs="5">
                Pause/Play recording
                    </Form.Label>
                    <Col xs="7">
                        <div className='shortcode'><span>CTRL ALT 6</span></div>
                    </Col>
           
                </Form.Group> 
                <Form.Group as={Row} className='align-items-center' >
                <Form.Label column xs="5">
                Stop recording
                    </Form.Label>
                    <Col xs="7">
                        <div className='shortcode'><span>CTRL ALT 7</span></div>
                    </Col>
           
                </Form.Group> 
                <div className="d-flex justify-content-center">
                <Button onClick={()=>{ window.close();}} variant="primary" type="submit">
                        Done
                    </Button>
                </div>
                

                  </Form>
                </div>
                </div>
            </Landing>
        )
    }
    
}
export default compose(connect(), withTranslation())(Preference);
