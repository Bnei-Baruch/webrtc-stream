import React, { Component, Fragment } from 'react';
import 'semantic-ui-css/semantic.min.css';
import AdminStreaming from "./apps/AdminStreaming";

class App extends Component {

  render() {
    return (
        <Fragment>
           <AdminStreaming/>
        </Fragment>
    );
  }
}

export default App;