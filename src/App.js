import React, { Component, Fragment } from 'react';
import 'semantic-ui-css/semantic.min.css';
import CaptureMonitor from "./apps/CaptureMonitor";
// import AdminStreaming from "./apps/AdminStreaming";
// import AudioOut from "./apps/AudioOut";

class App extends Component {

  render() {
    return (
        <Fragment>
           {/*<AdminStreaming/>*/}
           {/*<AudioOut />*/}
           <CaptureMonitor />
        </Fragment>
    );
  }
}

export default App;