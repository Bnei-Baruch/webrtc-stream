import React, {Component} from 'react';
import './FullScreenStream.css';
import mqtt from "../shared/mqtt";
import log from "loglevel";
import {JanusMqtt} from "../lib/janus-mqtt";
import {StreamingPlugin} from "../lib/streaming-plugin";

class FullScreenStream extends Component {

    state = {
        Janus: null,
        videoStream: null,
        srv: `str1`,
    };

    componentDidMount() {
        let user = {role: "guest"}
        this.initMQTT(user);
    }

    componentWillUnmount() {
        if(this.state.Janus) this.state.Janus.destroy();
    };

    initMQTT = (user) => {
        mqtt.init(user, (data) => {
            log.info("[mqtt] init: ", data);
            mqtt.watch();
            this.initJanus(user, 'str1')
        });
    };

    initJanus = (user, srv) => {
        let Janus = new JanusMqtt(user, srv, "MqttStream")
        let videoStream = new StreamingPlugin();

        Janus.init().then(data => {
            log.info(data)
            this.setState({Janus, user});
            Janus.attach(videoStream).then(data => {
                this.setState({videoStream});
                log.info(data)
                videoStream.watch(102).then(stream => {
                    log.info("[clinet] Got stream: ", stream)
                    let video = this.refs.remoteVideo;
                    video.srcObject = stream;
                })
            })
        })
    };

    render() {
        return (
            <video className="videoContainer"
                    ref="remoteVideo"
                   id="remoteVideo"
                   width="100%"
                   height="100%"
                   autoPlay={true}
                   controls={false}
                   muted={true}
                   playsInline={true}/>
        );
    }
}

export default FullScreenStream;
