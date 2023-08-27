import React, { Component } from 'react';
//import { Janus } from "../lib/janus";
import {Segment, Grid} from 'semantic-ui-react';
import './AdminStreaming.css';
import {initJanus} from "../shared/tools";
import LocalStream from "./LocalStream";
import mqtt from "../shared/mqtt";
import {JanusMqtt} from "../lib/janus-mqtt";

class IngestMonitor extends Component {

    state = {
        Janus: null,
        ulpan1: null,
        ulpan2: null,
        audio: null,
        video: false,
        videos: 1,
        audios: 15,
        muted: true,
        started: false,
        user: {id: "ingest-monitor", email: "ingest-monitor@bbdomain.org"}
    };

    componentDidMount() {
        this.initApp()
    };

    componentWillUnmount() {
        this.state.janus.destroy();
    };

    initApp = () => {
        const {user} = this.state;
        mqtt.init(user, (data) => {
            console.log("[mqtt] init: ", data);
            mqtt.watch();
            this.initJanus(user, 'mkz')
        });
    };

    initJanus = (user, srv) => {
        let Janus = new JanusMqtt(user, srv, "MqttStream")

        Janus.init().then(data => {
            console.log(data)
            this.setState({Janus, user});
        })
    };


  render() {

      return (
          <Segment compact>
              <Grid columns={2} stackable textAlign='center'>
                  <Grid.Row verticalAlign='middle'>
                      <Grid.Column>
                          <LocalStream {...this.state} video_id={511} audio_id={512} ulpan="Ulpan - 1" />
                      </Grid.Column>
                      <Grid.Column>
                          <LocalStream {...this.state} video_id={521} audio_id={522} ulpan="Ulpan - 2"/>
                      </Grid.Column>
                  </Grid.Row>

              </Grid>
          </Segment>
      );
  }
}

export default IngestMonitor;
