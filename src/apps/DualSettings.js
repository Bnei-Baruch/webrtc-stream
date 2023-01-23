import React, { Component } from 'react';
import {Button, Label, Segment, Grid, Message, Select} from 'semantic-ui-react';
import {getState, putData} from "../shared/tools";
import {dual_languages} from "../shared/consts";

class DualSettings extends Component {

    state = {
        disabled: false,
        loading: false,
        dual: this.props.dual,
        status: true,
    };

    componentDidMount() {
        this.encoderStatus();
    };

    saveState = (dual) => {
        putData(`webrtc/dual`, dual, (cb) => {
            console.log("Save state: ",cb);
        });
    };

    setDual = (value,id,side) => {
        const dual = Object.assign({}, this.state.dual)
        dual[id][side] = value;
        this.setState({dual});
        this.saveState(dual);
    };

    encoderStatus = () => {
        getState('streamer/encoders/mac-str-main',  (service) => {
            console.log(":: Got Encoder status: ", service);
            this.setState({service});
        });
        getState('webrtc/sound',  (sound) => {
            console.log(":: Got sound status: ", sound);
            this.setState({sound});
        });
    };

    saveService = () => {
        this.setState({disabled: true, loading: true});
        setTimeout(() => this.setState({disabled: false, loading: false}), 2000);
        let {dual, sound, service} = this.state;
        for(let i in dual) {
            console.log(i)
            for(let s in service.services) {
                console.log(s)
                if(service.services[s].id === "dual1" && i === "d1") {
                    let l = sound[dual[i].left].ffmpeg_channel
                    let r = sound[dual[i].right].ffmpeg_channel
                    service.services[s].args[16] = `pan=stereo|c0=c${l}|c1=c${r},volume=+10dB`;
                    console.log(service.services[s].args[16])
                    return
                }
                if(service.services[s].id === "dual2" && i === "d2") {
                    let l = sound[dual[i].left].ffmpeg_channel
                    let r = sound[dual[i].right].ffmpeg_channel
                    service.services[s].args[16] = `pan=stereo|c0=c${l}|c1=c${r},volume=+10dB`;
                    return
                }
                if(service.services[s].id === "dual3" && i === "d3") {
                    let l = sound[dual[i].left].ffmpeg_channel
                    let r = sound[dual[i].right].ffmpeg_channel
                    service.services[s].args[16] = `pan=stereo|c0=c${l}|c1=c${r},volume=+10dB`;
                    return
                }
                if(service.services[s].id === "dual4" && i === "d4") {
                    let l = sound[dual[i].left].ffmpeg_channel
                    let r = sound[dual[i].right].ffmpeg_channel
                    service.services[s].args[16] = `pan=stereo|c0=c${l}|c1=c${r},volume=+10dB`;
                    return
                }
            }
        }
        putData('streamer/encoders/mac-str-main',  (service) => {
            console.log(":: service status: ",service);
            this.setState({service});
        });
    };


    render() {

        const {dual,loading} = this.state;

        let dual_selection = Object.keys(dual).map((id, i) => {
            let data = dual[id];
            let {left,right} = data;
            return (
                <Grid stretched key={i}>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Select
                                placeholder="Left:"
                                value={left}
                                options={dual_languages}
                                onChange={(e,{value}) => this.setDual(value,id,"left")} />
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Select
                                placeholder="Right:"
                                value={right}
                                options={dual_languages}
                                onChange={(e,{value}) => this.setDual(value,id,"right")} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )
        });

        return (
            <Segment textAlign='center' color='grey' >
                <Label attached='top'>
                    Dual Settings
                </Label>
                <Message>
                    {dual_selection}
                </Message>
                <Button fluid
                        //disabled={status}
                        loading={loading}
                        positive
                        onClick={this.saveService} >
                    Save
                </Button>
            </Segment>
        );
    }
}

export default DualSettings;
