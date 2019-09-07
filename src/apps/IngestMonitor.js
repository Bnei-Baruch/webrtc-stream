import React, { Component } from 'react';
//import { Janus } from "../lib/janus";
import {Segment, Grid} from 'semantic-ui-react';
import './AdminStreaming.css';
import {initJanus} from "../shared/tools";
import LocalStream from "./LocalStream";

class IngestMonitor extends Component {

    state = {
        janus: null,
        ulpan1: null,
        ulpan2: null,
        audio: null,
        video: false,
        videos: 1,
        audios: 15,
        muted: true,
        started: false
    };

    componentDidMount() {
        this.initApp()
    };

    componentWillUnmount() {
        this.state.janus.destroy();
    };

    initApp = () => {
        initJanus(janus => {
            this.setState({janus});
            this.setState({started: true});
        }, er => {
            setTimeout(() => {
                this.initApp();
            }, 5000);
        }, true);
    };


  render() {

      return (
          <Segment compact>
              <Grid columns={2} stackable textAlign='center'>
                  <Grid.Row verticalAlign='middle'>
                      <Grid.Column>
                          <LocalStream {...this.state} id={511}/>
                      </Grid.Column>
                      <Grid.Column>
                          <LocalStream {...this.state} id={521}/>
                      </Grid.Column>
                  </Grid.Row>

              </Grid>
          </Segment>
      );
  }
}

export default IngestMonitor;
