import React, { Component, Fragment } from 'react';
import 'semantic-ui-css/semantic.min.css';
// import AdminStreaming from "./apps/AdminStreaming";
import AudioOut from "./apps/AudioOut";

class App extends Component {

  render() {
    return (
        <Fragment>
           {/*<AdminStreaming/>*/}
           <AudioOut />
        </Fragment>
    );
  }
}

export default App;