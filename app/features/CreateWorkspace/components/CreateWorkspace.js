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
                                        {/* <input type="text" placeholder="Enter email address" name="workSpaceName" id="workSpaceName" value={this.state.workspaceName}
                                            onChange={(e) => this.setState({workspaceName:e.target.value})} className="form-control form-control"></input>
                                            {this.state.wkerr && 
                                                <span className="invalid-feedback d-flex align-items-center">
                                                
                                                    <svg xmlns="http://www.w3.org/2000/svg" baseProfile="tiny" version="1.2" viewBox="0 0 18.088 18.088" width="18" height="18" class="mr-2">
                                                        <g id="Group_8570" data-name="Group 8570" transform="translate(-628 -479)">
                                                            <circle id="Ellipse_4260" data-name="Ellipse 4260" cx="9.044" cy="9.044" r="9.044" transform="translate(628 479)" fill="#ee5951"></circle>
                                                            <g id="Group_8569" data-name="Group 8569" transform="translate(638.103 492.812) rotate(180)">
                                                                <circle id="Ellipse_4259" data-name="Ellipse 4259" cx="0.994" cy="0.994" r="0.994" transform="translate(0)" fill="#fff"></circle>
                                                                <path id="Path_8229" data-name="Path 8229" d="M.595,0A.6.6,0,0,0,0,.595V5.648a.595.595,0,1,0,1.189,0V.595A.6.6,0,0,0,.595,0Z" transform="translate(0.435 3.61)" fill="#fff"></path>
                                                            </g>
                                                        </g>
                                                    </svg>
                                                    {this.state.wkerr}
                                                </span>
                                            } */}
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
