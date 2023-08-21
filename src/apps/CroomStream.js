import React, { Component } from 'react';
import {Segment, Label, Button, Table, Menu} from 'semantic-ui-react';
import VolumeSlider from "../components/VolumeSlider";
import './AdminStreaming.css';
import mqtt from "../shared/mqtt";
import log from "loglevel";
import {JanusMqtt} from "../lib/janus-mqtt";
import {StreamingPlugin} from "../lib/streaming-plugin";

class CroomStream extends Component {

    state = {
        janus: null,
        videoStream: null,
        audioStream: null,
        audio: null,
        video: false,
        muted: true,
        started: false,
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
            this.initJanus(user, 'mkz')
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
                videoStream.watch(80).then(stream => {
                    log.info("[clinet] Got stream: ", stream)
                    let video = this.refs.remoteVideo;
                    video.srcObject = stream;
                })
            })
        })
    };

    audioMute = () => {
        let {Janus, audioStream, muted} = this.state;
        if (muted) {
            let audioStream = new StreamingPlugin();
            Janus.attach(audioStream).then(data => {
                this.setState({audioStream});
                console.log(data)
                audioStream.watch(81).then(stream => {
                    let audio = this.refs.remoteAudio;
                    audio.srcObject = stream;
                })
            })
        } else {
            Janus.detach(audioStream).then(() => {
                this.setState({audioStream: null});
            })
        }
        this.setState({muted: !muted});
    };

    setVolume = (value) => {
        this.refs.remoteAudio.volume = value;
    };

    toggleFullScreen = () => {
        let vid = this.refs.remoteVideo;
        if(vid) vid.webkitEnterFullscreen();
    };


    render() {

        const {muted} = this.state;

        //const url = ulpan === "Ulpan - 1" ? "ulpan1" : "ulpan2";

        return (


            <Segment textAlign='center' className="ingest_segment" raised secondary>
                <Menu secondary size='huge'>
                    <Menu.Item>
                        <Label size='massive'>
                            Conference Room
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        {/*<Select*/}
                        {/*    compact*/}
                        {/*    error={!audios}*/}
                        {/*    placeholder="Audio:"*/}
                        {/*    value={audios}*/}
                        {/*    options={this.state.ulpan === "Ulpan - 1" ? ulpan1_audio_options : ulpan2_audio_options}*/}
                        {/*    onChange={(e,{value}) => this.setAudio(value)} />*/}
                    </Menu.Item>
                </Menu>


                <video ref="remoteVideo"
                       id="remoteVideo"
                       width="100%"
                       height="100%"
                       muted
                       autoPlay={true}
                       controls={true}
                       playsInline={true} />

                <audio ref="remoteAudio"
                       id="remoteAudio"
                       autoPlay={true}
                       controls={false}
                       muted={muted} />

                <Table basic='very' fixed unstackable>
                    <Table.Row>
                        <Table.Cell width={5} >
                            <VolumeSlider volume={this.setVolume} />
                        </Table.Cell>
                        <Table.Cell width={1}>
                            <Button positive={!muted}
                                    negative={muted}
                                    icon={muted ? "volume off" : "volume up"}
                                    onClick={this.audioMute}/>
                        </Table.Cell>
                        <Table.Cell width={1}>
                            <Button color='blue'
                                    icon='expand arrows alternate'
                                    onClick={this.toggleFullScreen}/>
                        </Table.Cell>
                    </Table.Row>
                </Table>


            </Segment>

        );
    }
}

export default CroomStream;
