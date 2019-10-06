import React, { Component } from 'react';
import { Janus } from "../lib/janus";
import {Segment, Button, Table, Message, Header} from 'semantic-ui-react';
import './AdminStreaming.css';
import {initJanus,audioLevel,streamFetcher} from "../shared/tools";

class StreamCapture extends Component {

    state = {
        disabled: false,
        loading: false,
        janus: null,
        videostream: null,
        audiostream: null,
        audio: null,
        video: false,
        muted: true,
        started: false,
        status: "Off",
        timer: "00:00:00",
    };

    componentDidMount() {
        this.captureStatus();
        this.initApp(this.props.id);
    };

    componentWillUnmount() {
        this.state.janus.destroy();
    };

    initApp = () => {
        initJanus(janus => {
            this.setState({janus});
            this.initVideoStream(70);
            this.initAudioStream(71);
        }, er => {
            setTimeout(() => {
                this.initApp();
            }, 5000);
        }, true);
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

    initAudioStream = (id) => {
        let {janus} = this.state;
        janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: "audiostream-"+Janus.randomString(12),
            success: (audiostream) => {
                Janus.log(audiostream);
                this.setState({audiostream});
                audiostream.send({message: {request: "watch", id: id}});
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
                this.checkAutoPlay();
                Janus.attachMediaStream(audio, stream);
                let canvas = this.refs.canvas;
                audioLevel(stream, canvas, 250);
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

    runTimer = () => {
        if(this.state.ival)
            clearInterval(this.state.ival);
        let ival = setInterval(() => {
            let req = {"req": "progress", "id": "stream"};
            streamFetcher(req, (data) => {
                let timer = data.stdout ? data.stdout.split(".")[0] : "00:00:00";
                //console.log(":: Got Capture progress: ", data);
                this.setState({timer});
            });
        }, 1000);
        this.setState({ival});
    };

    captureStatus = () => {
        let req = {req: "strstat", id: "status"};
        streamFetcher(req,  (data) => {
            let status = data.jsonst.capture;
            console.log(":: Got Capture status: ",status);
            this.setState({status: status});
            status === "On" ? this.runTimer() : clearInterval(this.state.ival);
        });
    };

    encoderExec = () => {
        this.setState({disabled: true, loading: true});
        setTimeout(() => this.setState({disabled: false, loading: false}), 5000);
        let {status} = this.state;
        let req = {id: "stream", req: status === "On" ? "stop" : "start"};
        streamFetcher(req,  (data) => {
            console.log(":: Start Encoder status: ",data);
            status = status === "On" ? "Off" : "On";
            this.setState({status});
            status === "On" ? this.runTimer() : clearInterval(this.state.ival);
        });
    };


    render() {
        const {muted,status,timer,disabled,loading} = this.state;

        return (


            <Segment textAlign='center' className='stream_segment' compact raised secondary>
                <Header as='h1'>
                    <Message compact
                             negative={status === "Off"}
                             positive={status === "On"}
                             className='timer' >{timer}</Message>
                </Header>

                <video ref="remoteVideo"
                       id="remoteVideo"
                       width="100%"
                       height="100%"
                       muted
                       defaultMuted
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
                        <Table.Cell>
                            <Message className='vu'>
                                <canvas ref={"canvas"} id={"canvas"} width="250" height="10" />
                            </Message>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <Button fluid size='huge'
                                    disabled={disabled}
                                    loading={loading}
                                    positive={status === "Off"}
                                    negative={status === "On"}
                                    onClick={this.encoderExec} >
                                {status === "On" ? "Stop Record" : "Start Record"}
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                </Table>


            </Segment>

        );
    }
}

export default StreamCapture;
