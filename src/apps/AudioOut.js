import React, { Component } from 'react';
import { Janus } from "../lib/janus";
import {Segment, Menu, Select, Button, Grid, Message} from 'semantic-ui-react';
import {cloneStream, initJanus} from "../shared/tools";
import VolumeSlider from "../components/VolumeSlider";
import {admin_videos_options, audio_options, JANUS_SRV_EURFR} from "../shared/consts";
import './AdminStreaming.css';

class AudioOut extends Component {

    state = {
        janus: null,
        videostream: null,
        audiostream: null,
        datastream: null,
        audio: null,
        video: false,
        servers: `${JANUS_SRV_EURFR}`,
        videos: 1,
        audios: 15,
        muted: true,
        started: false,
        audio_devices: [],
    };

    componentDidMount() {
        this.initApp();
    };

    componentWillUnmount() {
        this.state.janus.destroy();
    };

    initApp = () => {
        initJanus(janus => {
            this.setState({janus});
            this.setState({started: true});
            this.initDevices(true);
        }, er => {
            setTimeout(() => {
                this.initApp();
            }, 5000);
        }, false);
    };

    checkAutoPlay = () => {
        let promise = document.createElement("video").play();
        if(promise instanceof Promise) {
            promise.catch(function(error) {
                console.log("AUTOPLAY ERROR: ", error)
            }).then(function() {});
        }
    };

    initDevices = () => {
        Janus.listDevices(devices => {
            if (devices.length > 0) {
                let audio_devices = devices.filter(device => device.kind === "audiooutput");
                // Be sure device still exist
                // let audio_device = localStorage.getItem("audio_device");
                // let achk = audio_devices.filter(a => a.deviceId === audio_device).length > 0;
                // let audio_id = audio_device !== "" && achk ? audio_device : audio_devices[0].deviceId;
                Janus.log(" :: Got Audio output devices: ", audio_devices);
                this.setState({audio_devices});
                //this.setDevice(audio_id);
            } else {
                //Try to get audio fail reson
                //testDevices(false, true, steam => {});
                alert(" :: No output devices found ::");
                this.setState({audio_device: null});
            }
        }, { audio: true, video: false });
    };

    setDevice = (audio_device) => {
        if(audio_device !== this.state.audio_device) {
            this.setState({audio_device});
            if(this.state.audio_device !== "") {
                localStorage.setItem("audio_device", audio_device);
                Janus.log(" :: Going to check Devices: ");
                let audio = this.refs.remoteAudio;
                window["aout"+1].setSinkId(audio_device)
                    .then(() => console.log('Success, audio output device attached: ' + audio_device))
                    .catch((error) => console.error(error));
                // getDevicesStream(audio_device,stream => {
                //     Janus.log(" :: Check Devices: ", stream);
                //     let myaudio = this.refs.localVideo;
                //     Janus.attachMediaStream(myaudio, stream);
                //     if(this.state.audioContext) {
                //         this.state.audioContext.close();
                //     }
                //     micLevel(stream ,this.refs.canvas1,audioContext => {
                //         this.setState({audioContext,stream});
                //     });
                // })
            }
        }
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
                audio.muted = true;
                audio.pause();
                Janus.attachMediaStream(audio, stream);
                cloneStream(stream, 1)
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


  render() {

      const {audios, muted, audio_devices, audio_device} = this.state;

      let adevices_list = audio_devices.map((device,i) => {
          const {label, deviceId} = device;
          return ({ key: i, text: label, value: deviceId})
      });

    return (

      <Segment compact>

          <Segment raised secondary>
              <Menu secondary>
                  <Menu.Item>
                      <Button positive={!muted}
                              negative={muted}
                              icon={muted ? "volume off" : "volume up"}
                              onClick={this.audioMute} />
                  </Menu.Item>
                  <Menu.Item>
                      <Select
                          compact
                          error={!audios}
                          placeholder="Audio:"
                          value={audios}
                          options={audio_options}
                          onChange={(e,{value}) => this.setAudio(value)} />
                  </Menu.Item>
                  <Menu.Item>
                      <Select
                              disabled={false}
                              error={!audio_device}
                              placeholder="Select Device:"
                              value={audio_device}
                              options={adevices_list}
                              onChange={(e, {value}) => this.setDevice(value)}/>
                  </Menu.Item>
              </Menu>
              <Message className='vu'>
                  <canvas id="canvas_1" width="250" height="10" />
              </Message>
              <VolumeSlider volume={this.setVolume} />
          </Segment>

          <audio ref="remoteAudio"
                 id="remoteAudio"
                 autoPlay={true}
                 controls={false}
                 muted={muted} />
      </Segment>
    );
  }
}

export default AudioOut;
