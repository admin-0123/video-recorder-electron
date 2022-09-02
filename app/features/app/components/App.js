// @flow

import { AtlasKitThemeProvider } from "@atlaskit/theme";

import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router";
import { connect } from "react-redux";
import { ConnectedRouter as Router, push } from "react-router-redux";

import config from "../../config";
import { history } from "../../router";
import { createConferenceObjectFromURL } from "../../utils";
import { Welcome } from "../../welcome";
import { DashboardPage } from "../../dashboard";
import { Recording } from "../../recording";
import { Preference } from "../../preference";
import { Checkforupdate } from "../../Checkforupdate";
import { CreateWorkspace } from "../../CreateWorkspace";
import Video from "../../recording/components/video";
import Drawing from "../../recording/components/Drawing";
import "../css/navbar.css";
import { getStore } from "../../auth/functions";
import Logo from "../../../images/Logo-new.png";
/**
 * Main component encapsulating the entire application.
 */

function AuthenticatedRoute({ component: Component, ...rest }) {
  console.log(getStore("user_Data"));

  return (
    <Route
      {...rest}
      render={(props) =>
        getStore("user_Data") ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/", state: { from: props.location } }} />
        )
      }
    />
  );
}

class App extends Component {
  /**
   * Initializes a new {@code App} instance.
   *
   * @inheritdoc
   */
  constructor(props) {
    super(props);

    document.title = config.appName;
    this.Exit = this.Exit.bind(this);
    this._listenOnProtocolMessages = this._listenOnProtocolMessages.bind(this);
    this.state = {
      classname: "Main-common",
    };
  }
  Exit(par) {
    console.log(par);
    if (
      localStorage.getItem("trim") == "true" &&
      par == "?action=recording&mid=undefined"
    ) {
      swal({
        title: "Are you sure?",
        text: "This will delete your current Recording",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          window.snapNodeAPI.MAIN_API.Win.Exit(window.location.search);
        } else {
        }
      });
    } else {
      window.snapNodeAPI.MAIN_API.Win.Exit(window.location.search);
    }
    //window.snapNodeAPI.MAIN_API.Win.Exit(window.location.search)
  }

  /**
   * Implements React's {@link Component#componentDidMount()}.
   *
   * @returns {void}
   */
  componentDidMount() {
    // start listening on this events
    window.snapNodeAPI.ipc.on(
      "protocol-data-msg",
      this._listenOnProtocolMessages
    );

    // send notification to main process
    window.snapNodeAPI.ipc.send("renderer-ready");
    var windowTopBar = document.createElement("div");
    windowTopBar.style.width = "100%";
    windowTopBar.style.height = "10px";
    windowTopBar.style.backgroundColor = "#fbfbfb00";
    windowTopBar.style.position = "absolute";
    windowTopBar.style.top = windowTopBar.style.left = 0;
    windowTopBar.style.webkitAppRegion = "drag";
    document.body.appendChild(windowTopBar);
  }

  /**
   * Implements React's {@link Component#componentWillUnmount()}.
   *
   * @returns {void}
   */
  componentWillUnmount() {
    // remove listening for this events
    window.snapNodeAPI.ipc.removeListener(
      "protocol-data-msg",
      this._listenOnProtocolMessages
    );
  }

  // _listenOnProtocolMessages: (*) => void;

  /**
   * Handler when main proccess contact us.
   *
   * @param {Object} event - Message event.
   * @param {string} inputURL - String with room name.
   *
   * @returns {void}
   */
  _listenOnProtocolMessages(event, inputURL) {
    // Remove trailing slash if one exists.
    if (inputURL.substr(-1) === "/") {
      inputURL = inputURL.substr(0, inputURL.length - 1); // eslint-disable-line no-param-reassign
    }

    const conference = createConferenceObjectFromURL(inputURL);

    // Don't navigate if conference couldn't be created
    if (!conference) {
      return;
    }

    // change route when we are notified
    // this.props.dispatch(push('/conference', conference));
  }

  /**
   * Implements React's {@link Component#render()}.
   *
   * @inheritdoc
   * @returns {ReactElement}
   */
  render() {
    return (
      <div className={this.state.classname}>
        <div className="second"></div>
        <nav className="nav_bar">
          <div className="navigation-left nav-side">
            <a className="logo">
              {/* <svg xmlns="http://www.w3.org/2000/svg" baseProfile="tiny" version="1.2" viewBox="0 0 230 72" width="229"><g transform="translate(-60 -45)"><g transform="translate(41)"><text transform="translate(94 83)" fill="#fff" fontSize="35" fontFamily="SegoeUI-Bold, Segoe UI" fontWeight="700"><tspan x="0" y="0">Snapbyte</tspan></text><text transform="translate(94 113)" fill="#fff" fontSize="15" fontFamily="SegoeUI, Segoe UI"><tspan x="0" y="0">by BigCommand</tspan></text></g><g transform="translate(59 55)"><rect width="57" height="57" rx="6" transform="translate(1 1)" fill="#fbe7e3"></rect><g transform="translate(14.3 14.3)"><path d="M23.2,8A15.2,15.2,0,1,0,38.4,23.2,15.2,15.2,0,0,0,23.2,8Z" transform="translate(-8 -8)" fill="#fc573b" fillRule="evenodd"></path><path d="M19.851,11.721a8.13,8.13,0,1,0,8.13,8.13A8.13,8.13,0,0,0,19.851,11.721Z" transform="translate(-4.651 -4.651)" fill="#f9aa9d" fillRule="evenodd"></path></g></g></g></svg> */}
              <img
                style={{ height: "25px" }}
                alt="Adilo"
                src={Logo}
                className="logo"
              ></img>
            </a>
          </div>

          <div className="navigation-right nav-side">
            <a
              href="#"
              onClick={() =>
                window.snapNodeAPI.MAIN_API.Win.Minimize(window.location.search)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="9"
                height="1"
                viewBox="0 0 19.845 2"
              >
                <line
                  id="minimize"
                  x2="17.845"
                  transform="translate(1 1)"
                  fill="none"
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </a>
            <a href="#" onClick={() => this.Exit(window.location.search)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="9"
                height="9"
                viewBox="0 0 15.447 15.447"
              >
                <g id="close" transform="translate(1.415 1.414)">
                  <line
                    id="Line_359"
                    data-name="Line 359"
                    x2="17.845"
                    transform="translate(12.618) rotate(135)"
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                  <line
                    id="Line_360"
                    data-name="Line 360"
                    x2="17.845"
                    transform="rotate(45)"
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </g>
              </svg>
            </a>
          </div>
        </nav>

        <Router history={history}>
          <Switch>
            <Route component={Welcome} exact={true} path="/" />
            <AuthenticatedRoute
              exact
              path="/dashboard"
              component={DashboardPage}
            />
            <AuthenticatedRoute exact path="/recording" component={Recording} />
            <AuthenticatedRoute
              exact
              path="/preference"
              component={Preference}
            />
            <AuthenticatedRoute
              exact
              path="/update"
              component={Checkforupdate}
            />
            <AuthenticatedRoute
              exact
              path="/CreateWorkspace"
              component={CreateWorkspace}
            />
            <AuthenticatedRoute exact path="/video" component={Video} />
            <AuthenticatedRoute exact path="/drawing" component={Drawing} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default connect()(App);
