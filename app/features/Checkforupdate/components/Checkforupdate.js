import Page from '@atlaskit/page';
import { Checkbox } from '@atlaskit/checkbox';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import React, { Component } from 'react';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import '../css/checkforupdate.css';

let ipcRenderer  =  window.snapNodeAPI.ipcRenderer;
let appVersion  =  window.snapNodeAPI.appVersion;

type Props = {

    /**
     * Redux dispatch.
     */
    dispatch: Dispatch<*>;

    /**
     * React Router location object.
     */
    location: Object;
};
/**
 * Welcome Component.
 */
class Checkforupdate extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);
        this.state = { 
                checkingUpdate: true,
                updateAvailable: false,
                progress: '',
                downloadingProgress: false,
        };
    }

    /**
     * Start Onboarding once component is mounted.
     *
     * NOTE: It autonatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    componentDidMount() {
        ipcRenderer.send( 'check-for-update' );
        ipcRenderer.on('update-available-info', (event,args) => {
            this.setState({
                updateAvailable:true,
                checkingUpdate:false,
            })
        })
        ipcRenderer.on('downloading-process', (event,args) => {
            this.setState({
                updateAvailable:false,
                downloadingProgress: true,
                progress:'Downloading is in progress, After download Remotepc will be updated!',
                checkingUpdate: false
            });
        })
        ipcRenderer.on('no-update-available', (event,args) => {
            this.setState({
                updateAvailable:false,
                downloadingProgress: true,
                progress:'No update available!',
                checkingUpdate: false
            });
        })
    }

    componentWillMount()
    {
    }
      /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            // <Page navigation = { <Navbar /> }>
            <Page>
                <AtlasKitThemeProvider mode = 'light'>
                    {this.renderInfoPage()}
                </AtlasKitThemeProvider>
            </Page>
        );
    }

    renderInfoPage() {
        return (
            <div className="container join-popup" >
                <div className='row'>
                    <div className='col-sm-12'>
                        <div className="remotePC-info">
                            <div style={{marginBottom:'10px'}}>
                            <img style={{height: '47px'}} alt="Adilo" src="https://adilo.bigcommand.com/assets/logov2.b4ac263b.svg" className="logo"></img>
                            </div>
                            <p>Version: { appVersion }</p>
                            <p>Copyright ©2021-2022 By BigCommand.</p>
                            <p>All rights reserved.</p>
                        </div>
                        <div className="check-update-box row">
                            { this.state.checkingUpdate ? (
                                <p className="checkingUpdate">Checking for new version...</p>
                                ) : '' }
                            { this.state.updateAvailable ? (
                                <div className="updateAvailable">
                                    <span>A new version of Snapbyte is available!</span>
                                    <span className="buttons">
                                        <a onClick={this.whatsNew}>What's new</a>
                                        <a onClick={this.updateNow}>Update Now</a>
                                    </span>
                                </div>
                                ) : ''
                            }
                            { this.state.downloadingProgress ? (<p className="checkingUpdate">{ this.state.progress }</p>) : '' 
                            }
                        </div>
                    </div>

                 </div>
             </div>
        )
    }
    whatsNew() {
        return '';
    }
    updateNow() {
        console.log('fdsfjhds');
        ipcRenderer.send('downloadNow');
    }
}

export default connect()(Checkforupdate);
