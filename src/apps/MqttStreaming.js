import React, {Component, Fragment} from 'react';
import { Segment, Menu, Select, Button, Grid } from 'semantic-ui-react';
import VolumeSlider from "../components/VolumeSlider";
import {videos_options, audios_options} from "../shared/consts";
import {kc} from "../components/UserManager";
import LoginPage from "../components/LoginPage";
import './AdminStreaming.css';
import mqtt from "../shared/mqtt";
import {JanusMqtt} from "../lib/janus-mqtt";
import {StreamingPlugin} from "../lib/streaming-plugin";

class MqttStreaming extends Component {

    state = {
        user: null,
        ice: null,
        Janus: null,
        videoStream: null,
        audioStream: null,
        srv: `str1`,
        video_id: "",
        audio_id: "",
        video: false,
        audio: false,
        started: false
    };

    checkPermission = (user) => {
        delete user.roles;
        user.role = "guest";
        this.setState({user})
        this.initMQTT(user);
    };

    componentWillUnmount() {
        if(this.state.Janus) this.state.Janus.destroy();
    };

    initMQTT = (user) => {
        mqtt.init(user, (data) => {
            console.log("[mqtt] init: ", data);
            mqtt.watch();
            this.initJanus(user, 'str1')
        });
    };

    initJanus = (user, srv) => {
        let Janus = new JanusMqtt(user, srv, "MqttStream")

        Janus.init().then(data => {
            console.log(data)
            this.setState({Janus, user});
        })
    };

    iceState = () => {
        let count = 0;
        let chk = setInterval(() => {
            count++;
            if(count < 11 && this.state.ice === "connected") {
                clearInterval(chk);
            }
            if(count >= 10) {
                clearInterval(chk);
                this.initJanus();
            }
        },1000);
    };

    setServer = (srv) => {
        this.setState({srv});
        const {Janus, user} = this.state;
        if(Janus) {
            Janus.destroy().then(() => {
                this.initJanus(user, srv);
                this.setState({audio: false, video: false, audioStream: null, videoStream: null});
            });
        } else {
            this.initJanus(user, srv);
        }
    };

    setVideo = (video_id) => {
        this.setState({video_id});
        const {videoStream} = this.state;
        if(videoStream) {
            videoStream.switch(video_id);
        } else {
            this.videoMute();
        }
    };

    setAudio = (audio_id) => {
        this.setState({audio_id});
        const {audioStream} = this.state;
        if(audioStream) {
            audioStream.switch(audio_id);
        } else {
            this.audioMute();
        }
    };

    setVolume = (value) => {
        this.refs.remoteAudio.volume = value;
    };

    videoMute = () => {
        const {Janus, videoStream, video} = this.state;
        if (!video) {
            let videoStream = new StreamingPlugin();
            Janus.attach(videoStream).then(data => {
                this.setState({videoStream});
                console.log(data)
                videoStream.watch(1).then(stream => {
                    console.log("[clinet] Got stream: ", stream)
                    let video = this.refs.remoteVideo;
                    video.srcObject = stream;
                })
            })
        } else {
            Janus.detach(videoStream).then(() => {
                this.setState({videoStream: null});
            })
        }
        this.setState({video: !video});
    };

    audioMute = () => {
        const {Janus, audioStream, audio} = this.state;
        if (!audio) {
            let audioStream = new StreamingPlugin();
            Janus.attach(audioStream).then(data => {
                this.setState({audioStream});
                console.log(data)
                audioStream.watch(15).then(stream => {
                    let audio = this.refs.remoteAudio;
                    audio.srcObject = stream;
                })
            })
        } else {
            Janus.detach(audioStream).then(() => {
                this.setState({audioStream: null});
            })
        }
        this.setState({audio: !audio});
    };

    toggleFullScreen = () => {
        let vid = this.refs.remoteVideo;
        if(vid) vid.webkitEnterFullscreen();
    };


    render() {

        const {user, servers, video_id, audio_id, audio, video} = this.state;

        let login = (<LoginPage user={user} checkPermission={this.checkPermission} />);

        let content = (
            <Segment compact secondary className="stream_segment">
                <Segment textAlign='center' className="ingest_segment" raised>
                    <Menu secondary>
                        <Menu.Item>
                            <Select
                                compact
                                error={!video_id}
                                placeholder="Video:"
                                value={video_id}
                                options={videos_options}
                                onChange={(e, {value}) => this.setVideo(value)}/>
                        </Menu.Item>
                        <Menu.Item>
                            <Select
                                compact={false}
                                scrolling={false}
                                error={!audio_id}
                                placeholder="Audio:"
                                value={audio_id}
                                options={audios_options}
                                onChange={(e, {value, options}) => this.setAudio(value, options)}/>
                        </Menu.Item>
                        <canvas ref="canvas1" id="canvas1" width="25" height="50"/>
                    </Menu>
                </Segment>
                <Segment>
                    <div className='mediaplayer' ref="mediaplayer" >
                        <video ref="remoteVideo"
                               id="remoteVideo"
                               width="640"
                               height="360"
                               autoPlay={true}
                               controls={false}
                               muted={true}
                               playsInline={true}/>
                        {/*{talking ? <Label className='talk' size='massive' color='red' >*/}
                        {/*    <Icon name='microphone' />On*/}
                        {/*</Label> : ''}*/}
                    </div>
                    <audio ref="remoteAudio"
                           id="remoteAudio"
                           autoPlay={true}
                           controls={false}
                           muted={!audio}
                           playsInline={true}/>
                    <audio ref="trlAudio"
                           id="trlAudio"
                           autoPlay={true}
                           muted={true}
                           controls={false}
                           playsInline={true}/>
                </Segment>
                <Grid columns={3}>
                    <Grid.Column width={2}>
                        <Button color='blue'
                                icon='expand arrows alternate'
                                onClick={this.toggleFullScreen}/>
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <VolumeSlider volume={this.setVolume}/>
                    </Grid.Column>
                    <Grid.Column width={2}>
                        <Button positive={audio}
                                negative={!audio}
                                icon={!audio ? "volume off" : "volume up"}
                                onClick={this.audioMute}/>
                    </Grid.Column>
                </Grid>
            </Segment>
        );

        return (
            <Fragment>
                {user ? content : login}
            </Fragment>
        );
    }
}

export default MqttStreaming;
