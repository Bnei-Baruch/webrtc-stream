import React, { Component } from 'react';
import { Janus } from "../lib/janus";
import {Segment, Label, Select, Button, Grid, Menu} from 'semantic-ui-react';
import VolumeSlider from "../components/VolumeSlider";
import {ulpan1_audio_options, ulpan2_audio_options, JANUS_SRV_EURFR} from "../shared/consts";
import './AdminStreaming.css';
import {initJanus} from "../shared/tools";

class LocalStream extends Component {

    state = {
        janus: null,
        videostream: null,
        audiostream: null,
        audio: null,
        video: false,
        servers: `${JANUS_SRV_EURFR}`,
        audios: 15,
        muted: true,
        started: false,
        ulpan: "Ulpan - 1",
    };

    componentDidMount() {
        this.initApp(this.props.id);
    };

    componentWillUnmount() {
        this.state.janus.destroy();
    };

    initApp = (id) => {
        if(id) {
            setTimeout(() => {
                let ulpan = id === 511 ? "Ulpan - 1" : "Ulpan - 2";
                let audios = id === 511 ? 512 : 522;
                this.setState({ulpan, audios, janus: this.props.janus} , () => {
                    this.initVideoStream(511);
                });
            }, 1000);
        } else {
            initJanus(janus => {
                let id = this.state.ulpan === "Ulpan - 1" ? 511 : 521;
                let audios = id === 511 ? 512 : 522;
                this.setState({janus,audios});
                this.initVideoStream(id);
            }, er => {
                setTimeout(() => {
                    this.initApp();
                }, 5000);
            }, true);
        }
    };

    checkAutoPlay = () => {
        let promise = document.createElement("video").play();
        if(promise instanceof Promise) {
            promise.catch(function(error) {
                console.log("AUTOPLAY ERROR: ", error)
            }).then(function() {});
        }
    };

    initVideoStream = (id) => {
        let {janus} = this.state;
        janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: "videostream-"+Janus.randomString(12),
            success: (videostream) => {
                Janus.log(videostream);
                this.setState({videostream});
                videostream.send({message: {request: "watch", id: id}});
            },
            error: (error) => {
                Janus.log("Error attaching plugin: " + error);
            },
            iceState: (state) => {
                Janus.log("ICE state changed to " + state);
            },
            webrtcState: (on) => {
                Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            },
            slowLink: (uplink, lost, mid) => {
                Janus.log("Janus reports problems " + (uplink ? "sending" : "receiving") +
                    " packets on mid " + mid + " (" + lost + " lost packets)");
            },
            onmessage: (msg, jsep) => {
                this.onStreamingMessage(this.state.videostream, msg, jsep, false);
            },
            onremotetrack: (track, mid, on) => {
                Janus.debug(" ::: Got a remote video track event :::");
                Janus.debug("Remote video track (mid=" + mid + ") " + (on ? "added" : "removed") + ":", track);
                if(!on) return;
                let stream = new MediaStream();
                stream.addTrack(track.clone());
                Janus.log("Created remote video stream:", stream);
                let video = this.refs.remoteVideo;
                Janus.attachMediaStream(video, stream);
            },
            oncleanup: () => {
                Janus.log("Got a cleanup notification");
            }
        });
    };

    initAudioStream = () => {
        let {janus,audios} = this.state;
        janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: "audiostream-"+Janus.randomString(12),
            success: (audiostream) => {
                Janus.log(audiostream);
                this.setState({audiostream});
                audiostream.send({message: {request: "watch", id: audios}});
                audiostream.muteAudio()
            },
            error: (error) => {
                Janus.log("Error attaching plugin: " + error);
            },
            iceState: (state) => {
                Janus.log("ICE state changed to " + state);
            },
            webrtcState: (on) => {
                Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            },
            slowLink: (uplink, lost, mid) => {
                Janus.log("Janus reports problems " + (uplink ? "sending" : "receiving") +
                    " packets on mid " + mid + " (" + lost + " lost packets)");
            },
            onmessage: (msg, jsep) => {
                this.onStreamingMessage(this.state.audiostream, msg, jsep, false);
            },
            onremotetrack: (track, mid, on) => {
                Janus.debug(" ::: Got a remote audio track event :::");
                Janus.debug("Remote audio track (mid=" + mid + ") " + (on ? "added" : "removed") + ":", track);
                if(this.state.audio_stream) return;
                let stream = new MediaStream();
                stream.addTrack(track.clone());
                this.setState({audio_stream: stream});
                Janus.log("Created remote audio stream:", stream);
                let audio = this.refs.remoteAudio;
                Janus.attachMediaStream(audio, stream);
                //StreamVisualizer2(stream, this.refs.canvas1.current,50);
            },
            oncleanup: () => {
                Janus.log("Got a cleanup notification");
            }
        });
    };

    onStreamingMessage = (handle, msg, jsep, initdata) => {
        Janus.log("Got a message", msg);

        if(jsep !== undefined && jsep !== null) {
            Janus.log("Handling SDP as well...", jsep);

            // Answer
            handle.createAnswer({
                jsep: jsep,
                media: { audioSend: false, videoSend: false, data: initdata },
                success: (jsep) => {
                    Janus.log("Got SDP!", jsep);
                    let body = { request: "start" };
                    handle.send({message: body, jsep: jsep});
                },
                customizeSdp: (jsep) => {
                    Janus.debug(":: Modify original SDP: ",jsep);
                    jsep.sdp = jsep.sdp.replace(/a=fmtp:111 minptime=10;useinbandfec=1\r\n/g, 'a=fmtp:111 minptime=10;useinbandfec=1;stereo=1;sprop-stereo=1\r\n');
                },
                error: (error) => {
                    Janus.log("WebRTC error: " + error);
                }
            });
        }
    };

    setServer = (servers) => {
        Janus.log(servers);
        this.setState({servers});
        this.initJanus(servers);
    };

    setVideo = (videos) => {
        if(this.state.videostream) {
            this.setState({videos});
            this.state.videostream.send({message: { request: "switch", id: videos }});
        }
    };

    setAudio = (audios) => {
        if(this.state.audiostream) {
            this.setState({audios});
            this.state.audiostream.send({message: {request: "switch", id: audios}});
        }
    };

    setVolume = (value) => {
        this.refs.remoteAudio.volume = value;
    };

    audioMute = () => {
        this.setState({muted: !this.state.muted});
        this.refs.remoteAudio.muted = !this.state.muted;
        if(!this.state.audiostream && this.state.muted) {
            this.initAudioStream();
        } else {
            this.state.audiostream.hangup();
            this.setState({audiostream: null, audio_stream: null});
        }
    };

    videoMute = () => {
        let video = this.state.video;
        if(!this.state.videostream && !video) {
            this.initVideoStream();
        } else {
            this.state.videostream.hangup();
            this.setState({videostream: null, video_stream: null});
        }
        this.setState({video: !video});
    };

    toggleFullScreen = () => {
        let vid = this.refs.remoteVideo;
        if(vid) vid.webkitEnterFullscreen();
    };


    render() {

        const {servers, videos, audios, muted, ulpan} = this.state;

        return (


            <Segment textAlign='center' className="ingest_segment" raised secondary>
                <Menu secondary size='huge'>
                    <Menu.Item>
                        <Label size='massive'>
                            {ulpan}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Select
                            compact
                            error={!audios}
                            placeholder="Audio:"
                            value={audios}
                            options={this.state.ulpan === "Ulpan - 1" ? ulpan1_audio_options : ulpan2_audio_options}
                            onChange={(e,{value}) => this.setAudio(value)} />
                    </Menu.Item>
                    <Menu.Item>
                        <Button positive={!muted} size='huge'
                                negative={muted}
                                icon={muted ? "volume off" : "volume up"}
                                onClick={this.audioMute}/>
                    </Menu.Item>
                </Menu>


                <video ref="remoteVideo"
                       id="remoteVideo"
                       width="100%"
                       height="100%"
                       autoPlay={true}
                       controls={false}
                       muted={true}
                       playsInline={true} />

                <audio ref="remoteAudio"
                       id="remoteAudio"
                       autoPlay={true}
                       controls={false}
                       muted={muted} />

                <Grid columns={3}>
                    <Grid.Column>
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <VolumeSlider volume={this.setVolume} />
                    </Grid.Column>
                    <Grid.Column width={1}>
                        <Button color='blue'
                                icon='expand arrows alternate'
                                onClick={this.toggleFullScreen}/>
                    </Grid.Column>
                </Grid>
            </Segment>

        );
    }
}

export default LocalStream;
