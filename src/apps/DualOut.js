import React, { Component } from 'react';
import { Janus } from "../lib/janus";
import {Segment, Menu, Select, Label, Message, Modal, Button} from 'semantic-ui-react';
import {cloneStream, getState, initJanus, testContext} from "../shared/tools";
import {JANUS_SRV_EURFR} from "../shared/consts";
import './AdminStreaming.css';
import DualSettings from "./DualSettings";
//import VolumeSlider from "../components/VolumeSlider";

class DualOut extends Component {

    state = {
        janus: null,
        videostream: null,
        audiostream: null,
        datastream: null,
        handles:[
            {panel: {audios:
                        Number(localStorage.getItem("lang0")) || 22,
                    muted: true,
                    audio_device: localStorage.getItem("device0") || null,
                    audiostream: null}},
            {panel: {audios:
                        Number(localStorage.getItem("lang1")) || 19,
                    muted: true,
                    audio_device: localStorage.getItem("device1") || null,
                    audiostream: null}},
            {panel: {audios:
                        Number(localStorage.getItem("lang2")) || 20,
                    muted: true,
                    audio_device: localStorage.getItem("device2") || null,
                    audiostream: null}},
            {panel: {audios:
                        Number(localStorage.getItem("lang3")) || 21,
                    muted: true,
                    audio_device: localStorage.getItem("device3") || null,
                    audiostream: null}},
            {panel: {audios:
                        Number(localStorage.getItem("lang4")) || 18,
                    muted: true,
                    audio_device: localStorage.getItem("device4") || null,
                    audiostream: null}}
            ],
        audio: null,
        video: false,
        servers: `${JANUS_SRV_EURFR}`,
        videos: 1,
        audios: 15,
        muted: true,
        started: false,
        audio_devices: [],
        dual: {
            d1: { left: "", right: ""},
            d2: { left: "", right: ""},
            d3: { left: "", right: ""},
            d4: { left: "", right: ""},
            d5: { left: "", right: ""}
        }
    };

    componentDidMount() {
        getState(`webrtc/dual`, (dual) => {
            console.log("Got state: ", dual);
            this.setState({dual});
            this.initApp();
        });
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

    initDevices = () => {
        Janus.listDevices(devices => {
            if (devices.length > 0) {
                let audio_devices = devices.filter(device => device.kind === "audiooutput");
                Janus.log(" :: Got Audio output devices: ", audio_devices);
                this.setState({audio_devices});
                this.autoStart();
            } else {
                //Try to get audio fail reson
                //testDevices(false, true, steam => {});
                alert(" :: No output devices found ::");
                this.setState({audio_device: null});
            }
        }, { audio: true, video: false });
    };

    autoStart = () => {
        testContext(result => {
            if(result) {
                let {handles} = this.state;
                handles.forEach((h,i) => {
                    let device = localStorage.getItem("device" + i);
                    if(device) {
                        this.audioMute(i);
                    }
                })
            }
        });
    };

    setDevice = (audio_device,i) => {
        let {handles} = this.state;
        if(handles[i].panel.audio_device !== audio_device) {
            if(handles[i].panel.audiostream) {
                handles[i].panel.audio_device = audio_device;
                this.setState({handles});
            }
            if(handles[i].panel.audio_device !== "" && window["out"+i]) {
                localStorage.setItem("device" + i, audio_device);
                Janus.log(" :: Going to check Devices: ");
                //let audio = this.refs.remoteAudio;
                window["out"+i].setSinkId(audio_device)
                    .then(() => Janus.log('Success, audio output device attached: ' + audio_device))
                    .catch((error) => Janus.error(error));
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

    initAudioStream = (i) => {
        let {janus} = this.state;
        janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: "audiostream-"+Janus.randomString(12),
            success: (audiostream) => {
                Janus.log(audiostream);
                let {handles} = this.state;
                let id = handles[i].panel.audios;
                handles[i].panel.audiostream = audiostream;
                this.setState({handles});
                audiostream.send({message: {request: "watch", id}});
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
                this.onStreamingMessage(this.state.handles[i].panel.audiostream, msg, jsep, false);
            },
            onremotetrack: (track, mid, on) => {
                Janus.debug(" ::: Got a remote audio track event :::");
                Janus.debug("Remote audio track (mid=" + mid + ") " + (on ? "added" : "removed") + ":", track);
                if(!on) return;
                let stream = new MediaStream();
                stream.addTrack(track.clone());
                Janus.log("Created remote audio stream:", stream);
                let audio = this.refs["a" + i];
                audio.muted = true;
                audio.pause();
                Janus.attachMediaStream(audio, stream);
                // This make multiple audio stream out throw separate output devices
                cloneStream(stream, i, true);
                //let canvas = this.refs["canvas" + i];
                //audioLevel(stream, canvas, 250);
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

    setAudio = (audios,i) => {
        let {handles} = this.state;
        if(handles[i].panel.audiostream) {
            handles[i].panel.audios = audios;
            localStorage.setItem("lang" + i, audios);
            this.setState({handles});
            handles[i].panel.audiostream.send({message: {request: "switch", id: audios}});
        }
    };

    setVolume = (value) => {
        this.refs.remoteAudio.volume = value;
    };

    audioMute = (i) => {
        let {handles} = this.state;
        handles[i].panel.muted = !handles[i].panel.muted;
        this.setState({handles});
        this.refs["a" + i].muted = !handles[i].panel.muted;
        if(!handles[i].panel.audiostream && !handles[i].panel.muted) {
            this.initAudioStream(i);
        } else {
            //window["aout"+i].muted = true;
            //handles[i].panel.audiostream.hangup();
            //this.setState({audiostream: null, audio_stream: null});
        }
    };

    modalClose = () => {
        getState(`webrtc/dual`, (dual) => {
            console.log("Got state: ", dual);
            this.setState({dual});
        });
    };


  render() {

      const {audio_devices, handles, dual} = this.state;

      const dual_options = [
          { key: 2, value: 22, text: dual.d1.left + "-" + dual.d1.right },
          { key: 3, value: 19, text: dual.d2.left + "-" + dual.d2.right },
          { key: 4, value: 20, text: dual.d3.left + "-" + dual.d3.right },
          { key: 5, value: 21, text: dual.d4.left + "-" + dual.d4.right },
          { key: 6, value: 18, text: dual.d5.left + "-" + dual.d5.right },
          { key: 'heru', value: 10, text: 'heb-rus' },
          { key: 'heen', value: 17, text: 'heb-eng' },
      ];

      let adevices_list = audio_devices.map((device,i) => {
          const {label, deviceId} = device;
          return ({ key: i, text: label, value: deviceId})
      });

      let audio_panels = handles.map((o,i) => {
          return (
              <div key={i}>
                  <Segment raised secondary>
                      <Menu secondary>
                          <Menu.Item>
                              <Button positive={!handles[i].panel.muted}
                                      negative={handles[i].panel.muted}
                                      icon={handles[i].panel.muted ? "volume off" : "volume up"}
                                      disabled={handles[i].panel.audiostream}
                                      onClick={() => this.audioMute(i)} />
                          </Menu.Item>
                          <Menu.Item>
                              <Select
                                  className='lang_dropdown'
                                  compact
                                  error={!handles[i].panel.audios}
                                  placeholder="Audio:"
                                  value={handles[i].panel.audios}
                                  options={dual_options}
                                  onChange={(e,{value}) => this.setAudio(value,i)} />
                          </Menu.Item>
                          <Menu.Item>
                              <Select
                                  disabled={false}
                                  error={!handles[i].panel.audio_device}
                                  placeholder="Select Device:"
                                  value={handles[i].panel.audio_device}
                                  options={adevices_list}
                                  onChange={(e, {value}) => this.setDevice(value,i)}/>
                          </Menu.Item>
                      </Menu>
                      <Message className='vu'>
                          <canvas className='canvas_vu' ref={"canvas" + i} id={"canvas" + i} width="250" height="25" />
                      </Message>
                      {/*<VolumeSlider volume={() => this.setVolume(i)} />*/}
                  </Segment>

                  <audio ref={"a" + i}
                         id={"a" + i}
                         autoPlay={true}
                         controls={false}
                         muted={true} />
              </div>
          )
      });


    return (

      <Segment compact >
          <Modal trigger={<Label as='a' color='grey' corner='right' icon='settings' />} onClose={this.modalClose} >
              <DualSettings dual={dual} />
          </Modal>
          {audio_panels}
      </Segment>
    );
  }
}

export default DualOut;
