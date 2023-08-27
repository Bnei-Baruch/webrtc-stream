import React, { Component } from 'react';
import {Segment, Label, Select, Button, Table, Menu} from 'semantic-ui-react';
import VolumeSlider from "../components/VolumeSlider";
import {ulpan1_audio_options, ulpan2_audio_options} from "../shared/consts";
import './AdminStreaming.css';
import {StreamingPlugin} from "../lib/streaming-plugin";

class LocalStream extends Component {

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

    setAudio = (audio_id) => {
        this.setState({audio_id}, () => {
            const {audioStream} = this.state;
            if(audioStream) {
                audioStream.switch(audio_id);
            } else {
                this.audioMute();
            }
        });
    };

    setVolume = (value) => {
        this.refs.remoteAudio.volume = value;
    };

    videoMute = () => {
        const {video_id, Janus} = this.props;
        const {videoStream, video} = this.state;
        if (!video) {
            let videoStream = new StreamingPlugin();
            Janus.attach(videoStream).then(data => {
                this.setState({videoStream});
                console.log(data)
                videoStream.watch(video_id).then(stream => {
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
        const {audio_id, Janus} = this.props;
        let {audioStream, audio} = this.state;
        audio = !audio
        if (audio) {
            let audioStream = new StreamingPlugin();
            Janus.attach(audioStream).then(data => {
                this.setState({audioStream});
                console.log(data)
                audioStream.watch(audio_id).then(stream => {
                    let audio = this.refs.remoteAudio;
                    audio.srcObject = stream;
                })
            })
        } else {
            Janus.detach(audioStream).then(() => {
                this.setState({audioStream: null});
            })
        }
        this.setState({audio});
    };

    toggleFullScreen = () => {
        let vid = this.refs.remoteVideo;
        if(vid) vid.webkitEnterFullscreen();
    };


    render() {
        const {ulpan, audio_id} = this.props;
        const {audios, audio, video} = this.state;

        const url = ulpan === "Ulpan - 1" ? "ulpan1" : "ulpan2";

        return (
            <Segment textAlign='center' className="ingest_segment" raised secondary>
                <Menu secondary size='huge'>
                    <Menu.Item>
                        <Label as='a' onClick={() => window.open(`${url}`, "_self")} size='massive'>
                            {ulpan}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Select
                            compact
                            error={!audio_id}
                            placeholder="Audio:"
                            value={audio_id}
                            options={ulpan === "Ulpan - 1" ? ulpan1_audio_options : ulpan2_audio_options}
                            onChange={(e,{value}) => this.setAudio(value)} />
                    </Menu.Item>
                </Menu>

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
                       muted={false} />

                <Table basic='very' fixed unstackable>
                    <Table.Row>
                        <Table.Cell width={5} >
                            <VolumeSlider volume={this.setVolume} />
                        </Table.Cell>
                        <Table.Cell width={1}>
                            <Button positive={video} negative={!video}
                                    icon={video ? "eye" : "eye slash"}
                                    onClick={this.videoMute} />
                        </Table.Cell>
                        <Table.Cell width={1}>
                            <Button positive={audio}
                                    negative={!audio}
                                    icon={!audio ? "volume off" : "volume up"}
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

export default LocalStream;
