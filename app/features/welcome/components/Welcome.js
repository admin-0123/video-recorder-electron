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

import { Navbar } from '../../navbar';
import StepWizard from "react-step-wizard";
import axios from "axios";

import { ActionCreators } from '../../auth/actions';
import { getStore,getuserDetails,setStore,login,setStoreSingle} from '../../auth/functions';
import config from '../../config';



import 'bootstrap/dist/css/bootstrap.min.css';
import { Landing, Body, FieldWrapper, Form, Header, Label, Wrapper } from '../styled';
import '../css/welcome.css';
import '../css/electron-app.css';
let shell  =  window.snapNodeAPI.shell;

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

/**
 * Welcome Component.
 */
class Welcome extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        // Initialize url value in state if passed using location state object.
        let url = '';

        // Check and parse url if exists in location state.
        if (props.location.state) {
            const { room, serverURL } = props.location.state;

            if (room && serverURL) {
                url = `${serverURL}/${room}`;
            }
        }

        this.state = {
            animateTimeoutId: undefined,
            generatedRoomname: '',
            roomPlaceholder: '',
            updateTimeoutId: undefined,
            url,
            currentStep: 1,
            //email:'preciousngwu2@gmail.com',
            email:  '',
            username: '',
            //password: 'Unseeded45y%', 
            password: '', 
            allerros: [],
            success : false, 
           processing:false,
           loading:true,
           passwrong:''
        };
        this.openPage = this.openPage.bind(this);
        // Bind event handlers.
        // this._animateRoomnameChanging = this._animateRoomnameChanging.bind(this);
        // this._onURLChange = this._onURLChange.bind(this);
        // this._onFormSubmit = this._onFormSubmit.bind(this);
        // this._onJoin = this._onJoin.bind(this);
        // this._updateRoomname = this._updateRoomname.bind(this);
    }
    getUrlVars()
    {
       var vars = [], hash;
       var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
       for(var i = 0; i < hashes.length; i++)
       {
           hash = hashes[i].split('=');
           vars.push(hash[0]);
           vars[hash[0]] = hash[1];
       }
       return vars;
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
      document.getElementsByClassName('loader')[0].style.display = 'none';
      
    }

     /**
     * 
     *
     * @returns {ReactElement[]}
     */
      openPage(action) {
        if(action == 'openSignup') {
          shell.openExternal("https://adilo.com");
        }  else if(action == 'forgotPass') {
          shell.openExternal("https://adilo.bigcommand.com/forgot-password");
          
        } 
        
     }

    /**
     * Stop all timers when unmounting.
     *
     * @returns {voidd}
     */
    componentWillUnmount() {
    }
    componentWillMount(){
      const action = this.getUrlVars()['action'];
      const mid = this.getUrlVars()['mid'];
      this.authCheck(action,mid);
      
    }
    async login(currentStep){
        this.processing = true
        await axios.post(config.apiUrl+'api/check-email',{"email":this.state.email}).then(({data})=>{
            
            if(data.result) {
                //this.goNext()
                this.setState({
                    currentStep: currentStep
                  })
            } else {
                // this.allerros = data.message;
                // this.success = false;
                // this.setState({
                //     currentStep: 1
                //   })
               
            }
           
        }).catch((error) => {
            // console.log("hreeee");
            // console.log(error.response.data.errors);
            // this.allerros = error.response.data.errors;
            //alert(error.message);
            if(error.message == "Request failed with status code 500"){
              alert(error.message);
              location.reload();
            }
             this.setState({
                allerros: error.response.data.errors
              })
             //this.success = false;
             console.log(this.state.allerros);
            //  this.setState({
            //     currentStep: 1
            //   })
        }).finally(()=>{
             this.processing = false
        })
    }

    handleChange = event => {
        const {name, value} = event.target
        this.setState({
          [name]: value
        })    
      }
       
      handleSubmit = async (event) => {
        event.preventDefault()
        const { email, username, password } = this.state
        const user = {
          email,password
        }
        const userData = getStore('user_Data');
        console.log("userData =>>>>>>");
        console.log(userData);
        console.log("userData =>>>>>>0990909");
        if(userData !==  null) {
        //if(userData.access_token !==  undefined) {
          const details = await getuserDetails(userData.access_token);
          setStore('user_token',details.access_token);
          setStore('user_Data',details);
          setStore('notificationData',details.notification_data);
          this.props.history.push('/dashboard')
          console.log(details);
        } else{
         // alert('adas');
         // var error = {"email":["We couldn\u2019t find your Bigcommand Account."]};
         
          //console.log(this.state.passwrong);
           //var result  = this.props.dispatch(ActionCreators.login(user));
           var result = await  login(user.email,user.password);
           console.log(result);
           if(result.message != undefined){
              this.setState({
                passwrong: 'Password mismatch'
              })
              return;
           } 
           this.props.dispatch(ActionCreators.login(user))
            setTimeout(() => {
            this.props.history.push('/dashboard')
          }, 1000);
          //this.props.history.push('/dashboard')
        }
       
      }
      
      _next = () => {
        let currentStep = this.state.currentStep
        currentStep = currentStep >= 1? 2: currentStep + 1
        //alert(currentStep);
        this.login(currentStep);
       
      }
        
      _prev = () => {
        let currentStep = this.state.currentStep
        currentStep = currentStep <= 1? 1: currentStep - 1
        this.setState({
          currentStep: currentStep
        })
      }
    
    /*
    * the functions for our button
    */
    previousButton() {
      let currentStep = this.state.currentStep;
      if(currentStep !==1){
        return (
          <>
          <div className='text-center'>
          <h2>Welcome!</h2>
          <button 
            className="btn btn-secondary-outline btn-user-email m-auto mb-4 mt-2" 
            type="button" onClick={this._prev}>
          <svg className='me-3' xmlns="http://www.w3.org/2000/svg" width="29.053" height="29.053" viewBox="0 0 29.053 29.053"><g transform="translate(-1480 -67)"><circle cx="12.5" cy="12.5" r="12.5" transform="translate(1482 68.908)" fill="#21455e"/><g transform="translate(1480 67)"><path d="M17.026,2.5A14.526,14.526,0,1,0,31.553,17.026,14.54,14.54,0,0,0,17.026,2.5Zm0,8.318a4.557,4.557,0,1,1-4.557,4.557A4.568,4.568,0,0,1,17.026,10.818ZM9.075,25.834v-.673a3.517,3.517,0,0,1,3.517-3.517h8.869a3.517,3.517,0,0,1,3.517,3.517v.673a11.866,11.866,0,0,1-15.9,0Z" transform="translate(-2.5 -2.5)" fill="#e8ecee"/></g></g></svg>
            {this.state.email}
          <svg className='ms-2' xmlns="http://www.w3.org/2000/svg" width="9.709" height="5.395" viewBox="0 0 9.709 5.395"><path d="M15.582,33.5a.328.328,0,0,0-.463,0l-4.075,4.083L6.959,33.5a.328.328,0,1,0-.463.463L10.8,38.267a.32.32,0,0,0,.232.1.334.334,0,0,0,.232-.1l4.307-4.307A.321.321,0,0,0,15.582,33.5Z" transform="translate(-6.168 -33.168)" fill="#21455e" stroke="#21455e" strokeWidth="0.4"/></svg>
          </button>
          </div>
          </>
        )
      }
      return null;
    }
    
    nextButton(){
      let currentStep = this.state.currentStep;
      if(currentStep <2){
        return (
          <div className='text-end mt-5'>
          <button 
            className="btn btn-primary float-right" 
            type="button" onClick={this._next}>
          Next
          </button>  
          </div>      
        )
      }
      return null;
    }
    async authCheck(action,mid){
      const userData = getStore('user_Data');
      console.log("userData =>>>>>>");
      console.log(userData);
      console.log("userData =>>>>>>0990909");
      if(userData !==  null) {
        if(userData.access_token.length == undefined){
          this.setState({loading:false}); 
          localStorage.clear();
          location.reload();
          
        }
        let index = userData.access_token.length;
        if(index > 0) {
          index = index-1;
        }
       
        const details = await getuserDetails(userData.access_token[index].token);
        console.log(details)
        if(details.error != undefined){
          this.setState({loading:false}); 
          localStorage.clear();
          location.reload();
        }
        console.log(details.access_token[index].token)
        let index2 = details.access_token.length;
        if(index2 > 0) {
          index2 = index2-1;
        }
        //return false;
        setStoreSingle('user_token',details.access_token[index2].token);
        setStore('user_Data',details);
        setStore('notificationData',details.notification_data);
        // if(details.session.id !== undefined){
        //   setStore('selectedWorkspaceId',details.session.id);
        // }
        if(action == 'recording') {
          this.props.dispatch(push('/recording', {
              token:'ccccc'
          }));
        } else if(action == 'preference') {
          this.props.dispatch(push('/preference', {
              token:'ccccc'
          }));
        } else if(action == 'update') {
          this.props.dispatch(push('/update', {
              token:'ccccc'
          }));
        } else if(action == 'CreateWorkspace') {
          setStore('file_id',mid);
          this.props.dispatch(push('/CreateWorkspace', {
              token:'ccccc'
          }));
        } else if(action == 'video') {
          setStore('streamID',mid);
          this.props.dispatch(push('/video', {
              token:'ccccc'
          }));
        } else if(action == 'drawing') {
          this.props.dispatch(push('/drawing', {
              token:'ccccc'
          }));
        } else{
          this.props.history.push('/dashboard')
        }
       
      } else {
        this.setState({loading:false}); 
        this.props.history.push('/')
        
      }
    }
    
    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
     
        return (
            <Page>
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

        return (
            <Landing>
              {!this.state.loading &&
                <div className='entry-container welcome'>
                  <div className='d-flex pill-wrapper'>
                    <span className='btn-pill'>Sign in</span>
                    Or
                  <a className='btn-pill pill-link' onClick={() =>{ this.openPage('openSignup')}} href="#">Create account</a>
                  </div>
                    {/* <div className = 'header-text'>
                        SnapByte                   
                     </div> */}
                    <div className='entry-box'>
                      
                        {/* <button className="btn btn-primary-ouline btn-block" onClick={this.loginOpen}>Sign In</button>
                        <button className="btn btn-primary btn-block" onClick={this.joinmeeingOpen}>Create new account</button> */}
                        
                            {/* <p>Step {this.state.currentStep} </p>  */}

                            <form onSubmit={this.handleSubmit}>
                            {/* 
                                render the form steps and pass required props in
                            */}
                                <Step1 
                                currentStep={this.state.currentStep} 
                                allerros={this.state.allerros}
                                handleChange={this.handleChange}
                                handleopen={this.openPage}
                                email={this.state.email}
                                />
                               
                                 {this.previousButton()}
                                <Step2 
                                passwrong={this.state.passwrong}
                                currentStep={this.state.currentStep} 
                                handleopen={this.openPage}
                                handleChange={this.handleChange}
                                password={this.state.password}
                                />
                               
                                {this.nextButton()}

                            </form>
                    </div>
                </div>
              }
            </Landing>
        )
    }
    
}
function Step1(props) {
    if (props.currentStep !== 1) {
      return null
    } 
    // let show = false;
    // console.log(props.allerros);
    // if(props.allerros.email !== undefined){
    //     show = true;
    // }
    return(
      
      <div className="form-group pt-3">
        <label className='form-label' htmlFor="email">Email address</label>
        <input
          className={"form-control " + (props.allerros.email ? 'is-invalid' : '')}
          id="email"
          name="email"
          type="text"
          placeholder="Enter email"
          value={props.email}
          onChange={props.handleChange}
          />
          <div className="form-text text-end mt-3"><a href='#'  onClick={() =>{ props.handleopen('forgotPass')}}>Forgot Password?</a></div>
          {/* <div className='text-center f-14 mt-4'>
            <label>Or Sign in with</label>
            <div className='mt-2 pt-1'>
            <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="41.938" height="41.938" viewBox="0 0 41.938 41.938"><path d="M9.294,152.286l-1.46,5.45-5.336.113a21.006,21.006,0,0,1-.154-19.581h0l4.75.871,2.081,4.722a12.514,12.514,0,0,0,.118,8.426Z" transform="translate(0 -126.942)" fill="#fbbb00"/><path d="M281.77,208.176a20.961,20.961,0,0,1-7.475,20.27h0l-5.983-.305-.847-5.286a12.5,12.5,0,0,0,5.377-6.382H261.628v-8.3H281.77Z" transform="translate(-240.198 -191.124)" fill="#518ef8"/><path d="M62.106,321.386h0a20.976,20.976,0,0,1-31.6-6.415l6.8-5.563a12.471,12.471,0,0,0,17.971,6.385Z" transform="translate(-28.01 -284.065)" fill="#28b446"/><path d="M60.633,4.827,53.84,10.389a12.47,12.47,0,0,0-18.384,6.529l-6.831-5.593h0a20.973,20.973,0,0,1,32.009-6.5Z" transform="translate(-26.279)" fill="#f14336"/></svg></a>
            <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="41.938" height="41.938" viewBox="0 0 41.938 41.938"><circle cx="20.969" cy="20.969" r="20.969" transform="translate(0 0)" fill="#3b5998"/><path d="M49.919,35.418H46.177V49.126H40.508V35.418h-2.7V30.6h2.7V27.483c0-2.229,1.059-5.72,5.719-5.72l4.2.018v4.676H47.38a1.154,1.154,0,0,0-1.2,1.313v2.835h4.237Z" transform="translate(-23.678 -13.628)" fill="#fff"/></svg></a>
            </div>
            </div> */}
      </div>
    );
  }
  
//   function Step2(props) {
//     if (props.currentStep !== 2) {
//       return null
//     } 
//     return(
//       <div className="form-group">
//         <label htmlFor="username">Username</label>
//         <input
//           className="form-control"
//           id="username"
//           name="username"
//           type="text"
//           placeholder="Enter username"
//           value={props.username}
//           onChange={props.handleChange}
//           />
//       </div>
//     );
//   }
  
  function Step2(props) {
    if (props.currentStep !== 2) {
      return null
    } 
    return(
      <React.Fragment>
      <div className="form-group mb-5">
        <label className='form-label' htmlFor="password">Password</label>
        <input
           className={"form-control " + (props.passwrong ? 'is-invalid' : '')}
          id="password"
          name="password"
          type="password"
          placeholder="Enter password"
          value={props.password}
          onChange={props.handleChange}
          />      
          <div className="form-text text-end mt-3"><a href='#' onClick={() =>{ props.handleopen('forgotPass')}}>Forgot Password?</a></div>
      </div>
      <div className='text-end'>
      <button className="btn btn-primary">Sign In</button>
      </div>
      </React.Fragment>
    );
}
export default compose(connect(), withTranslation())(Welcome);
