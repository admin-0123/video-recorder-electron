import Page from '@atlaskit/page';
import { Checkbox } from '@atlaskit/checkbox';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import React, { Component } from 'react';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
// import { InputList }'./index';
import '../css/createworkspace.css';
import { getStore,getuserDetails,setStore} from '../../auth/functions';
import axios from "axios";
import config from '../../config';
import { ReactMultiEmail, isEmail } from 'react-multi-email';
import 'react-multi-email/style.css';

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
class CreateWorkspace extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);
        this.state = { 
                workspaceName:'',
                status:false,
                wkerr:null,
                emails: [],
        };
        this.CreateWorkspace = this.CreateWorkspace.bind(this);
    }

    /**
     * Start Onboarding once component is mounted.
     *
     * NOTE: It autonatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    componentDidMount() {
       
    }

    componentWillMount()
    {
    }
   async CreateWorkspace(){
        console.log(this.state.emails);
        const userData = getStore('user_Data');
        const file_id = getStore('file_id');
        const { user ,session} = userData;
        var data ={
            "folder_id":  file_id,
            "emails": this.state.emails,
            "type":'file'
        };
        var obj = {
            method: 'post',
            responseType: 'json',
            url: `${config.apiUrl}api/shareFileEmail`,
            headers: { 
                'Authorization': `Bearer ${userData.access_token}`
            },
            data:data
        };
        await  axios(obj)
              .then((response)=>{
               console.log(response.data);
               if(response.data.errors) {
                // this.goNext()
                this.setState({wkerr:response.data.errors[0]});
             } else {
                this.setState({wkerr:response.data.message});
                
             }
            
        })
       
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
        const { emails } = this.state;

        return (
            <div className="container join-popup" >
                <div className='row'>
                    <div className='col-sm-12'>
                    <h5 id="CreateWorkspace___BV_modal_title_" className="modal-title">SHARE THIS FILE</h5>
                        <div className="remotePC-info">
                        <div id="CreateWorkspace___BV_modal_body_" className="modal-body">
                                <p>Anyone you share this folder with will be able view all of it’s content without restrictions.</p>
                                <form action="javascript:void(0)" className="mt-3 pt-2">
                                    <div className="form-group mb-0">
                                        
                                            <ReactMultiEmail
                                                    placeholder="Enter email address"
                                                    emails={emails}
                                                    onChange={(_emails: string[]) => {
                                                        this.setState({ emails: _emails });
                                                    }}
                                                    validateEmail={email => {
                                                        return isEmail(email); // return boolean
                                                    }}
                                                    getLabel={(
                                                        email: string,
                                                        index: number,
                                                        removeEmail: (index: number) => void,
                                                    ) => {
                                                        return (
                                                        <div data-tag key={index}>
                                                            {email}
                                                            <span data-tag-handle onClick={() => removeEmail(index)}>
                                                            ×
                                                            </span>
                                                        </div>
                                                        );
                                                    }}
                                                    />
                                                     {this.state.wkerr}
                                    </div>
                                    <button onClick={this.CreateWorkspace}>Create</button>
                                </form>
                            </div>
                        </div>
                        <div className="check-update-box row">
                          
                        </div>
                    </div>

                 </div>
             </div>
        )
    }
}

export default connect()(CreateWorkspace);
