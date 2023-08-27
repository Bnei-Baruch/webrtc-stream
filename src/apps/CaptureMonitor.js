import React, { Component } from 'react';
import { Segment, Header, Message, Grid } from 'semantic-ui-react';
import {JANUS_SRV_EURFR} from "../shared/consts";
import './AdminStreaming.css';
import mqtt from "../shared/mqtt";
import {JanusMqtt} from "../lib/janus-mqtt";
import {StreamingPlugin} from "../lib/streaming-plugin";
import log from "loglevel";

class CaptureMonitor extends Component {

    state = {
        janus: null,
        ulpan1: null,
        ulpan1_src: "mltcap",
        ulpan1_status: null,
        ulpan1_timer: "00:00:00",
        ulpan2: null,
        ulpan2_src: "maincap",
        ulpan2_status: null,
        ulpan2_timer: "00:00:00",
        audio: null,
        video: false,
        servers: `${JANUS_SRV_EURFR}`,
        videos: 1,
        audios: 15,
        muted: true,
        started: false,
        user: {id: "capture-status", email: "capture-status@bbdomain.org"}
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        this.state.janus.destroy();
    };

    initMQTT = () => {
        const {user} = this.state;
        mqtt.init(user, (data) => {
            console.log("[mqtt] init: ", data);
            this.initJanus(user);
            const topic = 'exec/service/data/#';
            mqtt.join(topic);
            mqtt.watch((message, topic) => {
                this.onMqttMessage(message, topic);
            }, false)
        })
    };

    initJanus = (user) => {
        let Janus = new JanusMqtt(user, "mkz", "MqttStream")
        let multiStream = new StreamingPlugin();
        let singleStream = new StreamingPlugin();

        Janus.init().then(data => {
            log.info(data)
            this.setState({Janus, user});
            Janus.attach(multiStream).then(data => {
                this.setState({multiStream});
                log.info(data)
                multiStream.watch(511).then(stream => {
                    log.info("[clinet] Got stream: ", stream)
                    let video = this.refs.ulpan1;
                    video.srcObject = stream;
                })
            })
            Janus.attach(singleStream).then(data => {
                this.setState({singleStream});
                log.info(data)
                singleStream.watch(521).then(stream => {
                    log.info("[clinet] Got stream: ", stream)
                    let video = this.refs.ulpan2;
                    video.srcObject = stream;
                })
            })
        })
    };

    onMqttMessage = (message, topic) => {
        const src = topic.split("/")[3]
        const {ulpan1_src,ulpan2_src} = this.state;
        let services = message.data;

        if(ulpan1_src === src) {
            let ulpan1_status = message.message === "On";
            let ulpan1_timer = ulpan1_status && services?.out_time ? services.out_time.split('.')[0] : "00:00:00";
            this.setState({ulpan1_timer, ulpan1_status});
        }
        if(ulpan2_src === src) {
            let ulpan2_status = message.message === "On";
            let ulpan2_timer = ulpan2_status && services?.out_time ? services.out_time.split('.')[0] : "00:00:00";
            this.setState({ulpan2_timer, ulpan2_status});
        }
    };


  render() {

      const {ulpan1_timer,ulpan1_status,ulpan2_timer,ulpan2_status} = this.state;


    return (

      <Segment compact>

          <Segment textAlign='center' raised secondary>
              <Grid columns={2} stackable textAlign='center'>
                  {/*<Divider vertical>Or</Divider>*/}

                  <Grid.Row verticalAlign='middle'>
                      <Grid.Column>
                          <Header as='h1'>Ulpan - 1</Header>
                          <Header as='h1'>
                              <Message compact
                                       negative={!ulpan1_status}
                                       positive={ulpan1_status}
                                       className='timer' >{ulpan1_timer}</Message>
                          </Header>
                          <video ref="ulpan1"
                                 id="ulpan1"
                                 width="100%"
                                 height="100%"
                                 autoPlay={true}
                                 controls={false}
                                 muted={true}
                                 playsInline={true}/>

                      </Grid.Column>
                      <Grid.Column>
                          <Header as='h1'>Ulpan - 2</Header>
                          <Header as='h1'>
                              <Message compact
                                       negative={!ulpan2_status}
                                       positive={ulpan2_status}
                                       className='timer' >{ulpan2_timer}</Message>
                          </Header>
                          <video ref="ulpan2"
                                 id="ulpan2"
                                 width="100%"
                                 height="100%"
                                 autoPlay={true}
                                 controls={false}
                                 muted={true}
                                 playsInline={true}/>

                      </Grid.Column>
                  </Grid.Row>
              </Grid>
          </Segment>


      </Segment>
    );
  }
}

export default CaptureMonitor;
