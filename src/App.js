import React, { Component, Fragment } from 'react';
import 'semantic-ui-css/semantic.min.css';
// import CroomStream from "./apps/CroomStream";
// import StreamCapture from "./apps/StreamCapture";
import DualOut from "./apps/DualOut";
// import CaptureMonitor from "./apps/CaptureMonitor";
// import LocalStream from "./apps/LocalStream";
// import IngestMonitor from "./apps/IngestMonitor";
// import AdminStreaming from "./apps/AdminStreaming";
// import AudioOut from "./apps/AudioOut";

class App extends Component {

  render() {
    return (
        <Fragment>
           {/*<AdminStreaming/>*/}
           {/*<AudioOut />*/}
           <DualOut />
           {/*<CaptureMonitor />*/}
           {/*<LocalStream />*/}
           {/*<IngestMonitor />*/}
           {/*<CroomStream />*/}
           {/*<StreamCapture />*/}
        </Fragment>
    );
  }
}

export default App;