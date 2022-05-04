
// @flow

import Navigation, { AkGlobalItem } from '@atlaskit/navigation';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SettingsButton, SettingsDrawer } from '../../settings';
import { isElectronMac } from '../../utils';
import { Dropdown } from 'react-bootstrap';

import Avatar from 'react-avatar';
import moment from 'moment';

import HelpButton from './HelpButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Landing, Body, FieldWrapper, Form, Header, Label, Wrapper } from '../styled';
import '../../dashboard/css/welcome.css';
import '../../dashboard/css/dashboard.css';
import '../../dashboard/css/electron-app.css';
import { getStore,getStoreSingle,getuserDetails,setStore,setStoreSingle} from '../../auth/functions';
import Logo from './Logo';
import axios from "axios";
import config from '../../config';
let ipcRenderer  =  window.snapNodeAPI.ipcRenderer;
let shell  =  window.snapNodeAPI.shell;

type Props = {

    /**
     * Whether Settings Drawer is open or not.
     */
    _isSettingsDrawerOpen: boolean;
    _userData: Object;
};

/**
 * Navigation Bar component.
 */
class Navbar extends Component<Props, *> {
    /**
     * Get the array of Primary actions of Global Navigation.
     *
     * @returns {ReactElement[]}
     */

     constructor(props: Props) {
        super(props);

        // Initialize url value in state if passed using location state object.
       

        this.state = {
            animateTimeoutId: undefined,
            generatedRoomname: '',
            roomPlaceholder: '',
            updateTimeoutId: undefined,

            currentStep: 1,
            email:  '',
            username: '',
            password: '', 
            allerros: [],
            success : false, 
           processing:false,
           loading:true
        };

        // Bind event handlers.
        // this._animateRoomnameChanging = this._animateRoomnameChanging.bind(this);
         this.changeWorkSpace = this.changeWorkSpace.bind(this);
         this.openPage = this.openPage.bind(this);
         this.markRead = this.markRead.bind(this);
        // this._onFormSubmit = this._onFormSubmit.bind(this);
        // this._onJoin = this._onJoin.bind(this);
        // this._updateRoomname = this._updateRoomname.bind(this);
    }


    _getPrimaryActions() {
        return [
            <AkGlobalItem key = { 0 }>
                <SettingsButton />
            </AkGlobalItem>
        ];
    }
    async changeWorkSpace(e,project_id,name) {
        console.log(e);

        const userData = getStore('user_Data');
        // var obj = {
        //     method: 'post',
        //     responseType: 'json',
        //     url: `${config.apiUrl}api/saveSession`,
        //     headers: { 
        //         'Authorization': `Bearer ${userData.access_token}`
        //     },
        //     data:{
        //         workspace_id : e
        //     }
        // };
        // await  axios(obj)
        setStoreSingle('selectedWorkspaceId',project_id);
        setStoreSingle('selectedWorkspaceUId',e);
        setStoreSingle('selectedWorkspaceIdName',name);
        location.reload();
       
    }

    /**
     * Get the array of Secondary actions of Global Navigation.
     *
     * @returns {ReactElement[]}
     */
    _getSecondaryActions() {
        return [
            <AkGlobalItem key = { 0 }>
                <HelpButton />
            </AkGlobalItem>
        ];
    }
    /**
     * Get the array of Secondary actions of Global Navigation.
     *
     * @returns {ReactElement[]}
     */
     openPage(action) {
        if(action == 'preference') {
            ipcRenderer.send('open-child', 'preference','Preference', 400, 510, false, false );
        } else if(action == 'update') {
            ipcRenderer.send('open-child', 'update','Check for update', 443, 315, false, false );
        } else if(action == 'openHelp') {
            shell.openExternal("https://help.bigcommand.com");
        } else if(action == 'openHome') {
            shell.openExternal("https://adilo.bigcommand.com/");
        } else if(action == 'signOut') {
            localStorage.clear();
            location.reload();
        } else if(action == 'createWork') {
            shell.openExternal("https://snapbyte.bigcommand.io?action=openCreateworkspace");
           // ipcRenderer.send('open-child', 'CreateWorkspace','Create Workspace', 443, 315, false, false );
        }
        
     }
     async markRead(id){
        if(id =='all'){
            const userData = getStore('user_Data');
            var obj = {
                method: 'get',
                responseType: 'json',
                url: `${config.apiUrl}api/notification-allread`,
                headers: { 
                    'Authorization': `Bearer ${userData.access_token}`
                },
            };
            await  axios(obj)
            //setStore('selectedWorkspaceId',e);
            location.reload();
        }
     }

    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        const { user ,session,notification_data,owner,all_projects} = this.props._userData;
       
        if( getStoreSingle('selectedWorkspaceIdName') == null) {
            if(all_projects.length > 0 ) {  
                setStoreSingle('selectedWorkspaceIdName',all_projects[0].title);
            }
           
        }
        console.log("this.props._userData");
        console.log(this.props._userData);
        console.log(notification_data);
        console.log("this.props._userData");
        return (
            // <Navigation
            //     drawers = { [
            //         <SettingsDrawer
            //             isOpen = { this.props._isSettingsDrawerOpen }
            //             key = { 0 } />
            //     ] }
            //     globalPrimaryActions = { this._getPrimaryActions() }
            //     globalPrimaryIcon = { <Logo /> }
            //     globalSecondaryActions = { this._getSecondaryActions() }
            //     isElectronMac = { isElectronMac() }
            //     isOpen = { false }
            //     isResizeable = { false } />
            <div className='profileNav d-flex justify-content-between'>
            <div className='profilLeft d-flex align-items-center'>
                {/* <figure className='profileImage mb-0'>
                    <img src={user.userProfile.profile_image} alt="" />
                   
                </figure> */}
                <Avatar className='profileImage mb-0' name={owner.name} src={owner.photo_url} ></Avatar>
                <div className='profileMeta'>
                    <label>{owner.name}</label>
                    <Dropdown>
                        <Dropdown.Toggle variant='' id="profileDropdown">
                        {getStoreSingle('selectedWorkspaceIdName')}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                        {all_projects.map((wp, i) => {     
                           return  (<Dropdown.Item data-id={wp.project_id} key={wp.id} onClick={() =>{ this.changeWorkSpace(wp.id,wp.project_id,wp.title)}} href="#">{wp.title}</Dropdown.Item>)
                           // return (<Answer key={answer} answer={answer} />) 
                        })}
                            
                            {/* <Dropdown.Item className='ItemHighlight' onClick={() =>{ this.openPage('createWork')}} href="#">Create new workspace</Dropdown.Item> */}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            <div className='profileRight d-flex align-items-center'>
              

                <div onClick={() =>{ this.openPage('openHome')}}  className='homeIcon'>
                <div className='hoverIcon px-12'>
                <svg xmlns="http://www.w3.org/2000/svg" width="24.79" height="24" viewBox="0 0 24.79 24"><g transform="translate(0 -4.89)"><path d="M24.48,16.6a1.182,1.182,0,0,0-.1-1.692L13.3,5.214a1.381,1.381,0,0,0-1.8.021L.385,15.425a1.175,1.175,0,0,0-.053,1.689l.279.29a1.215,1.215,0,0,0,1.668.128l.831-.744V27.681A1.209,1.209,0,0,0,4.319,28.89H8.652a1.209,1.209,0,0,0,1.209-1.209V20.06h5.527v7.62a1.143,1.143,0,0,0,1.136,1.209h4.592a1.209,1.209,0,0,0,1.209-1.209V16.942l.513.45c.283.248.876.049,1.326-.446Z" transform="translate(0)" fill="#919daa"/></g></svg>
                </div>
                 </div>

                 <div className='moreIcon'>
                <Dropdown className='noDropArrow'>
                <Dropdown.Toggle variant='' id="moreDropdown" className='hoverIcon px-12 '>
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="5" viewBox="0 0 23 5"><circle cx="2.5" cy="2.5" r="2.5" fill="#919daa"/><circle cx="2.5" cy="2.5" r="2.5" transform="translate(9)" fill="#919daa"/><circle cx="2.5" cy="2.5" r="2.5" transform="translate(18)" fill="#919daa"/></svg>
                 </Dropdown.Toggle>

                <Dropdown.Menu className='dropdown-xl'>
                    <Dropdown.Item onClick={() =>{ this.openPage('preference')}} href="#">Preferences</Dropdown.Item>
                    <Dropdown.Item onClick={() =>{ this.openPage('update')}} href="#">Check for updates</Dropdown.Item>
                    <Dropdown.Item onClick={() =>{ this.openPage('openHelp')}} href="#">Get help</Dropdown.Item>
                    <Dropdown.Item onClick={() => window.snapNodeAPI.MAIN_API.Win.Exit()} href="#">Quit Adilo</Dropdown.Item>
                    <Dropdown.Item onClick={() =>{ this.openPage('signOut')}}  className='ItemHighlight' href="#">Sign out</Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown>
                </div>
           
            
            </div>
        </div>
        );
    }
}

/**
 * Maps (parts of) the redux state to the React props.
 *
 * @param {Object} state - The redux state.
 * @returns {{
 *     _isSettingsDrawerOpen: boolean
 * }}
 */
function _mapStateToProps(state: Object) {
    return {
        _isSettingsDrawerOpen: state.navbar.openDrawer === SettingsDrawer,
        _userData:  getStore('user_Data')
    };
}


export default connect(_mapStateToProps)(Navbar);
