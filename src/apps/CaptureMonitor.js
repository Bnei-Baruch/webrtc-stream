import React, { Component } from 'react';
import { Janus } from "../lib/janus";
import { Segment, Header, Message, Grid } from 'semantic-ui-react';
//import VolumeSlider from "../components/VolumeSlider";
import {JANUS_SRV_EURFR} from "../shared/consts";
import './AdminStreaming.css';
import {initJanus,toHms} from "../shared/tools";
import mqtt from "../shared/mqtt";

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
        this.initApp();
        this.initMQTT();
    };

    componentWillUnmount() {
        this.state.janus.destroy();
    };

    initApp = () => {
        initJanus(janus => {
            this.setState({janus});
            this.setState({started: true});
            this.initVideoStream("ulpan1", 511);
            this.initVideoStream("ulpan2", 521)
        }, er => {
            setTimeout(() => {
                this.initApp();
            }, 5000);
        }, true);
    };

    initMQTT = () => {
        mqtt.init(this.state.user, (data) => {
            console.log("[mqtt] init: ", data);
            const topic = 'exec/service/data/#';
            mqtt.join(topic);
            mqtt.watch((message, topic) => {
                this.onMqttMessage(message, topic);
            }, false)
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

    checkAutoPlay = () => {
        let promise = document.createElement("video").play();
        if(promise instanceof Promise) {
            promise.catch(function(error) {
                console.log("AUTOPLAY ERROR: ", error)
            }).then(function() {});
        }
    };

    initVideoStream = (u, id) => {
        let {janus} = this.state;
        janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: "videostream-"+Janus.randomString(12),
            success: (videostream) => {
                Janus.log(videostream);
                this.setState({[u]: videostream});
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
                this.onStreamingMessage(this.state[u], msg, jsep, false);
            },
            onremotetrack: (track, mid, on) => {
                Janus.debug(" ::: Got a remote video track event :::");
                Janus.debug("Remote video track (mid=" + mid + ") " + (on ? "added" : "removed") + ":", track);
                if(!on) return;
                let stream = new MediaStream();
                stream.addTrack(track.clone());
                Janus.log("Created remote video stream:", stream);
                let video = this.refs[u];
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
