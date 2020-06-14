import React, {Component, Fragment} from 'react';
import { Janus } from "../lib/janus";
import { Segment, Menu, Select, Button, Grid } from 'semantic-ui-react';
import VolumeSlider from "../components/VolumeSlider";
import {servers_options, admin_videos_options, audio_options, JANUS_STR_SRV_GR} from "../shared/consts";
import {kc} from "../components/UserManager";
import LoginPage from "../components/LoginPage";
import './AdminStreaming.css';

class AdminStreaming extends Component {

    state = {
        user: null,
        ice: null,
        janus: null,
        videostream: null,
        audiostream: null,
        datastream: null,
        audio: null,
        video: false,
        servers: `${JANUS_STR_SRV_GR}`,
        videos: 1,
        audios: 15,
        muted: true,
        started: false
    };

    checkPermission = (user) => {
        const bb_user = kc.hasRealmRole("bb_user");
        if (bb_user) {
            delete user.roles;
            user.role = "user";
            this.setState({user})
            Janus.init({debug: ["log","error"], callback: this.initJanus});
        } else {
            alert("Access denied!");
            window.location = 'https://stream.kli.one';
        }
    };

    componentWillUnmount() {
        this.state.janus.destroy();
    };

    checkAutoPlay = () => {
        let promise = document.createElement("video").play();
        if(promise instanceof Promise) {
            promise.catch(function(error) {
                console.log("AUTOPLAY ERROR: ", error)
            }).then(function() {});
        }
    };

    initJanus = (servers) => {
        if(this.state.janus)
           this.state.janus.destroy();
        if(!servers)
            servers = this.state.servers;
        Janus.log(" -- Going to connect to: " + servers);
        let janus = new Janus({
            server: servers,
            iceServers: [{urls: "stun:stream.kli.one:3478"}],
            success: () => {
                Janus.log(" :: Connected to JANUS");
                this.setState({started: true});
                this.initDataStream();
                let {videostream,audiostream} = this.state;
                if(videostream)
                    this.initVideoStream();
                if(audiostream)
                    this.initAudioStream();
            },
            error: (error) => {
                Janus.log(error);
            },
            destroyed: () => {
                Janus.log("kill");
            }
        });
        this.setState({janus});
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

    initVideoStream = () => {
        if(this.state.videostream)
            this.state.videostream.detach();
        let {janus,videos} = this.state;
        janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: "videostream-"+Janus.randomString(12),
            success: (videostream) => {
                Janus.log(videostream);
                this.setState({videostream, video_stream: null});
                videostream.send({message: {request: "watch", id: videos}});
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
                if(this.state.video_stream) return;
                let stream = new MediaStream();
                stream.addTrack(track.clone());
                this.setState({video_stream: stream});
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
        if(this.state.audiostream)
            this.state.audiostream.detach();
        let {janus,audios} = this.state;
        janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: "audiostream-"+Janus.randomString(12),
            success: (audiostream) => {
                Janus.log(audiostream);
                this.setState({audiostream, audio_stream: null});
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

    initDataStream() {
        if(this.state.datastream)
            this.state.datastream.detach();
        this.state.janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: "datastream-"+Janus.randomString(12),
            success: (datastream) => {
                Janus.log(datastream);
                this.setState({datastream});
                let body = { request: "watch", id: 101 };
                datastream.send({"message": body});
            },
            error: (error) => {
                Janus.log("Error attaching plugin: " + error);
            },
            iceState: (state) => {
                Janus.log("ICE state changed to " + state);
                this.setState({ice: state});
                if(state === "disconnected") {
                    this.iceState();
                }
            },
            onmessage: (msg, jsep) => {
                this.onStreamingMessage(this.state.datastream, msg, jsep, true);
            },
            ondataopen: (data) => {
                Janus.log("The DataStreamChannel is available!");
            },
            ondata: (data) => {
                let json = JSON.parse(data);
                Janus.log("We got data from the DataStreamChannel! ", json);
                //checkData();
            },
            onremotestream: (stream) => {
                Janus.log("Got a remote stream!", stream);
            },
            oncleanup: () => {
                Janus.log("Got a cleanup notification");
            }
        });
    }

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
        if(this.state.videostream ) {
            this.state.videostream.hangup();
        }
        if(this.state.audiostream) {
            this.state.audiostream.hangup();
        }
        this.setState({servers, video: false, videostream: null, video_stream: null, audiostream: null, audio_stream: null, muted: true});
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

      const {user, servers, videos, audios, muted, video} = this.state;

      let login = (<LoginPage user={user} checkPermission={this.checkPermission} />);

      let content = (
          <Segment compact color='brown' raised>
              <Segment textAlign='center' className="ingest_segment" raised secondary>
                  <Menu secondary size='huge'>
                      <Menu.Item>
                          <Select compact
                                  error={!servers}
                                  placeholder="Server:"
                                  value={servers}
                                  options={servers_options}
                                  onChange={(e, {value}) => this.setServer(value)} />
                          <Button positive={video} negative={!video} size='huge'
                                  icon={video ? "eye" : "eye slash"}
                                  onClick={this.videoMute} />
                      </Menu.Item>
                      <Menu.Item>
                          <Select
                              compact
                              error={!videos}
                              placeholder="Video:"
                              value={videos}
                              options={admin_videos_options}
                              onChange={(e,{value}) => this.setVideo(value)} />
                      </Menu.Item>
                      <Menu.Item>
                          <Select
                              compact={true}
                              error={!audios}
                              placeholder="Audio:"
                              value={audios}
                              options={audio_options}
                              onChange={(e,{value}) => this.setAudio(value)} />
                          <Button positive={!muted} size='huge'
                                  negative={muted}
                                  icon={muted ? "volume off" : "volume up"}
                                  onClick={this.audioMute}/>
                      </Menu.Item>
                      {/*<canvas ref="canvas1" id="canvas1" width="25" height="50" />*/}
                  </Menu>
              </Segment>
              { !video ? '' :
                  <video ref="remoteVideo"
                         id="remoteVideo"
                         width="640"
                         height="360"
                         autoPlay={true}
                         controls={false}
                         muted={true}
                         playsInline={true} /> }

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
              {/*<VolumeMeter audioContext={this.remoteAudio.current} width={600} height={200}/>*/}
              {/*<AudioMeter/>*/}
          </Segment>
      );

    return (
        <Fragment>
            {user ? content : login}
        </Fragment>
    );
  }
}

export default AdminStreaming;
