// @flow

import Button from "@atlaskit/button";

import { FieldTextStateless } from "@atlaskit/field-text";
import { SpotlightTarget } from "@atlaskit/onboarding";
import Page from "@atlaskit/page";
import { AtlasKitThemeProvider } from "@atlaskit/theme";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { compose } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { Dropdown } from "react-bootstrap";

import { Navbar } from "../../navbar";
import StepWizard from "react-step-wizard";
import axios from "axios";
const baseURL = "https://snapbyte.bigcommand.io/";
import { ActionCreators } from "../../auth/actions";
import {
  getStore,
  getuserDetails,
  setStore,
  setStoreSingle,
  getStoreSingle,
} from "../../auth/functions";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Landing,
  Body,
  FieldWrapper,
  Form,
  Header,
  Label,
  Wrapper,
} from "../styled";
// import Uppy from '@uppy/core'

import "../css/welcome.css";
import "../css/dashboard.css";
import "../css/electron-app.css";
import config from "../../config";

var proID;
let ipcRenderer = window.snapNodeAPI.ipcRenderer;
let ipcMain = window.snapNodeAPI.ipcMain;
let shell = window.snapNodeAPI.shell;
let fs = window.snapNodeAPI.fs;
var uppy;

type Props = {
  /**
   * Redux dispatch.
   */
  dispatch: Dispatch<*>,

  /**
   * React Router location object.
   */
  location: Object,

  /**
   * I18next translate function.
   */
  t: Function,
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
  url: string,
};
function convertSecondsToTime(given_seconds) {
  let dateObj = new Date(given_seconds * 1000),
    hours = dateObj.getUTCHours(),
    minutes = dateObj.getUTCMinutes(),
    seconds = dateObj.getSeconds();
  return (
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}
/**
 * Welcome Component.
 */
class DashboardPage extends Component<Props, State> {
  /**
   * Initializes a new {@code Welcome} instance.
   *
   * @inheritdoc
   */
  constructor(props: Props) {
    super(props);
    this.record = this.record.bind(this);
    this.openPage = this.openPage.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.uploadfile = this.uploadfile.bind(this);
    this.state = {
      Files: [],
      pagination: {
        current_page: 1,
      },
    };
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
    
    ipcRenderer.on("uploadFIle", (event, { url, fileName, type }) => {
      $(".right_side").show();
      $(".c_container_outer").removeClass("add_height");
      this.uploadfile(url, type, fileName);

    });
    ipcRenderer.on("startRec", (event) => {
      this.record();
    });

    const userData = getStore("user_Data");
    const token = getStoreSingle("user_token");
    const selectedWorkspaceId = getStoreSingle("selectedWorkspaceId");
    const selectedWorkspaceUId = getStoreSingle("selectedWorkspaceUId");

    localStorage.getItem("countDown") == null
      ? localStorage.setItem("countDown", "true")
      : "";
    localStorage.getItem("openEditor") == null
      ? localStorage.setItem("openEditor", "true")
      : "";
    localStorage.getItem("launch") == null
      ? localStorage.setItem("launch", "true")
      : "";
    const { user, session, user_token } = userData;
    console.log("userDatauserDatauserDatauserData");
    console.log(userData.access_token);
    var meta_fields = {
      access_token: `Bearer ${token}`,
    };
    this.getFiles();
    uppy = new Uppy.Core({
      debug: true,
      autoProceed: true,
      allowMultipleUploadBatches: true,

      restrictions: {
        //maxFileSize: 1000000,
        maxNumberOfFiles: 10,
        minNumberOfFiles: 1,
        //allowedFileTypes: ['image/*', 'video/*'],
      },
      meta: meta_fields,
    })
      .use(Uppy.Dashboard, {
        inline: true,
        target: "#drag-drop-area",
        showProgressDetails: true,
        width: 368,
        height: 100,
        thumbnailWidth: 40,
      })
      .use(Uppy.AwsS3Multipart, {
        limit: 2,
        companionUrl: `${config.apiUrl}api`,
      });
    uppy.on("file-added", (file) => {
      console.log(file);
      console.log("file");
      let vidoeTag = document.createElement("video");
      this.videoComplete = false;
      vidoeTag.src = URL.createObjectURL(file.data);
      vidoeTag.ondurationchange = function () {
        let duration = convertSecondsToTime(this.duration);
        uppy.setFileMeta(file.id, {
          duration: this.duration,
          duration_formatted: duration,
          drm_protection: "false",
          projectId: "false",
          access_token: `Bearer ${token}`,
        });
      };
    });
    uppy.on("upload-success", async (file, response) => {
      if (getStoreSingle("selectedWorkspaceUId") == null) {
        if (all_projects.length > 0) {
          proID = all_projects[0].id;
          setStoreSingle("selectedWorkspaceUId", all_projects[0].id);
        }
      }

      console.info(file);
      console.info(response);
      var key = response.uploadURL;
      var arr = key.split("/");
      console.info(arr);
      var data = {
        video: {
          body: {
            location: key,
          },
          uploadURL: key,
        },
        // video_id: $this.video_id,
        video_id: arr[3],
        project_id: getStoreSingle("selectedWorkspaceUId"),
        fileType: file.type,
        duration: Math.floor(file.meta.duration),
        duration_formatted: this.TimeLap,
        drm_protection: "false",
        mediaType: "recordCamera",
        //folder_id: 0,
        filesize: file.data.size,
        videoHeight: 0,
        videoWidth: 0,
      };
      var obj = {
        method: "post",
        responseType: "json",
        url: `${config.apiUrl}api/video-upload/s3-sign/save`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: data,
      };
      await axios(obj).then((response) => {
        console.log(response.data);
        $(".right_side").hide();
        $(".c_container_outer").addClass("add_height");
      });
    });
  }

  /**
   * Stop all timers when unmounting.
   *
   * @returns {voidd}
   */
  componentWillUnmount() {}
  uploadfile(path, type, filename) {
    ipcRenderer.send("dashboard-focus");
    fs.readFile(path, async function (err, data) {
      const blob = new Blob([data.buffer], { type: "*" });
      // var audioURL = window.URL.createObjectURL(blob);

      var fileName = filename;
      var typeV = "video/mp4";
      if (type == "audio") {
        typeV = "audio/mp3";
      }
      // const buffer = Buffer.from(await blob.arrayBuffer());
      var fileObject = new File([blob], fileName, {
        type: typeV,
      });

      uppy.addFile({
        // .use(Uppy.addFile, {
        name: fileObject.name, // file name
        type: type, // file type
        data: fileObject, // file blob
        source: "#drag-drop-area", // optional, determines the source of the file, for example, Instagram.
        isRemote: false, // optional, set to true if actual file is not in the browser, but on some remote server, for example,
        // when using companion in combination with Instagram.
      });
    });
  }
  openPage(action, id = null) {
    if (action == "openFile") {
      shell.openExternal(id);
    } else if (action == "copyLink") {
      navigator.clipboard.writeText(id);
    } else if (action == "deleteFile") {
      this.deleteFile(id);
    } else if (action == "senEmaillink") {
      
      ipcRenderer.send(
        "open-child",
        "CreateWorkspace",
        "Share Via  Email",
        443,
        315,
        false,
        false,
        id
      );
    }
  }
  async deleteFile(id) {
    console.log(this.state.emails);
    const token = getStoreSingle("user_token");
    let ids = [];
    ids.push(id);
    var data = {
      bulkVideoIds: ids,
    };
    var obj = {
      method: "post",
      responseType: "json",
      url: `${config.apiUrl}api/editor/delete-video`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };
    await axios(obj).then((response) => {
      console.log(response.data);
      if (response.data.success) {
        swal("File deleted successfully");
        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        swal("Error");
      }
    });
  }
  record() {
    //alert('dd');
    ipcRenderer.send(
      "open-child",
      "recording",
      "Record",
      750,
      420,
      true,
      false
    );
  }

  /**
   * Render function of component.
   *
   * @returns {ReactElement}
   */
  render() {
    const Fl = this.state.Files;
    return (
      <Page>
        <AtlasKitThemeProvider mode="light">
          <Navbar />
          <Wrapper>{this.renderLandingPage(Fl)}</Wrapper>
        </AtlasKitThemeProvider>
      </Page>
    );
  }
  async getFiles(e) {
    // console.log(e);

    const userData = getStore("user_Data");

    const token = getStoreSingle("user_token");
    const { user, session, all_projects } = userData;
    console.log(getStoreSingle("selectedWorkspaceId"));
    console.log("getStoreSingle('selectedWorkspaceId')");
    console.log(all_projects);
    if (
      getStoreSingle("selectedWorkspaceId") == null ||
      getStoreSingle("selectedWorkspaceUId") == null ||
      getStoreSingle("selectedWorkspaceIdName") == null
    ) {
      if (all_projects.length > 0) {
        setStoreSingle("selectedWorkspaceId", all_projects[0].project_id);
        setStoreSingle("selectedWorkspaceUId", all_projects[0].id);
        setStoreSingle("selectedWorkspaceIdName", all_projects[0].title);
      }
    }
    const selectedWorkspaceId = getStoreSingle("selectedWorkspaceId");
    console.log(selectedWorkspaceId);
    console.log("2");
    var data = {
      id: selectedWorkspaceId,
    };
    var obj = {
      method: "get",
      responseType: "json",
      url: `${config.apiUrl}api/projects/show?id=${selectedWorkspaceId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      //data:data
    };
    await axios(obj).then((response) => {
      console.log(response.data.videos);
      this.setState({ Files: response.data.videos });
    });
  }

  /**
   * Renders the header for the welcome page.
   *
   * @returns {ReactElement}
   */
  renderLandingPage(Fl) {
    console.log(Fl);
    console.log("Fl");
    return (
      <Landing>
        <div className="entry-container dashboard">
          <div className="row">
            <div className="rightPanel">
              <a
                href="#"
                onClick={this.record}
                className="col-auto col-recbutton"
              >
                <svg
                  style={{ width: "87px" }}
                  xmlns="http://www.w3.org/2000/svg"
                  baseProfile="tiny"
                  version="1.2"
                  viewBox="0 0 148.979 148.979"
                  width="149"
                >
                  <g transform="translate(-1166.021 -142.021)">
                    <g transform="translate(1166.021 142.021)">
                      <path
                        d="M167.183,107.592A59.592,59.592,0,1,1,107.592,48,59.591,59.591,0,0,1,167.183,107.592Zm0,0"
                        transform="translate(-33.102 -33.102)"
                        fill="#fccfcf"
                      ></path>
                      <path
                        d="M74.49,148.979a74.49,74.49,0,1,1,74.49-74.49A74.49,74.49,0,0,1,74.49,148.979Zm0-144.013A69.524,69.524,0,1,0,144.013,74.49,69.524,69.524,0,0,0,74.49,4.966Zm0,0"
                        fill="#e75555"
                      ></path>
                      <path
                        d="M197.524,162.762A34.762,34.762,0,1,1,162.762,128,34.762,34.762,0,0,1,197.524,162.762Zm0,0"
                        transform="translate(-88.272 -88.272)"
                        fill="#e61717"
                      ></path>
                    </g>
                    <text
                      transform="translate(1214 226)"
                      fill="#fff"
                      fontSize="28"
                      fontFamily="SegoeUI-Bold, Segoe UI"
                      fontWeight="700"
                    >
                      <tspan x="0" y="0">
                        REC
                      </tspan>
                    </text>
                  </g>
                </svg>
              </a>
              <div className="drope_container alt">
                <div className="left_side">
                  Recent Recordings{" "}
                  <a
                    href="#"
                    onClick={() => {
                      location.reload();
                    }}
                    className="col-auto col-recbutton"
                  >
                    Refresh{" "}
                  </a>
                </div>
                <div style={{ display: "none" }} className="right_side">
                  <div className="dropFile" id="drag-drop-area"></div>
                </div>
              </div>
              <div className="c_container_outer add_height">
                <div className="c_container">
                  {Fl.map((wp, i) => {
                    return (
                      <div className="main-container flexbox">
                        <div className="left-hold flexbox">
                          <span className="file_thumb">
                            {wp.thumbnails != "" ? (
                              <img src={wp.thumbnail}></img>
                            ) : (
                              <img src="https://adilo.bigcommand.com/assets/media_processing.88bd134c.svg"></img>
                            )}
                          </span>
                          <span className="file_name">{wp.filename}</span>
                        </div>

                        <div className="right-hold">
                          <span>
                            <div className="moreIcon">
                              <Dropdown className="noDropArrow">
                                <Dropdown.Toggle
                                  variant=""
                                  id="moreDropdown"
                                  className="hoverIcon px-12 "
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="23"
                                    height="5"
                                    viewBox="0 0 23 5"
                                  >
                                    <circle
                                      cx="2.5"
                                      cy="2.5"
                                      r="2.5"
                                      fill="#919daa"
                                    />
                                    <circle
                                      cx="2.5"
                                      cy="2.5"
                                      r="2.5"
                                      transform="translate(9)"
                                      fill="#919daa"
                                    />
                                    <circle
                                      cx="2.5"
                                      cy="2.5"
                                      r="2.5"
                                      transform="translate(18)"
                                      fill="#919daa"
                                    />
                                  </svg>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="dropdown-xl">
                                  <Dropdown.Item
                                    onClick={() => {
                                      this.openPage(
                                        "copyLink",
                                        `https://adilo.bigcommand.com/watch/${wp.stored_name}`
                                      );
                                    }}
                                    href="#"
                                  >
                                    <b>Copy link</b>
                                  </Dropdown.Item>
                                  {/* <Dropdown.Item onClick={() =>{ this.openPage('senEmaillink',wp.id)}} href="#">Share via email</Dropdown.Item> */}
                                  <Dropdown.Item
                                    onClick={() => {
                                      this.openPage(
                                        "openFile",
                                        `https://adilo.bigcommand.com/video/${wp.stored_name}`
                                      );
                                    }}
                                    href="#"
                                  >
                                    Open in browser
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      this.openPage(
                                        "openFile",
                                        `https://adilo.bigcommand.com/projects/${wp.project.project_id}/edit/${wp.stored_name}`
                                      );
                                    }}
                                    href="#"
                                  >
                                    Open in editor
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      this.openPage("deleteFile", wp.id);
                                    }}
                                    className="text-danger"
                                    href="#"
                                  >
                                    Delete file
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Landing>
    );
  }
}
export default compose(connect(), withTranslation())(DashboardPage);
