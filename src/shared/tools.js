import {Janus} from "../lib/janus";
import {
    JANUS_ADMIN_GXY,
    JANUS_ADMIN_VRT,
    JANUS_SRV_VRT,
    JANUS_SRV_GXY,
    ADMIN_SECRET,
    STUN_SRV_GXY,
    WFDB_STATE,
    WFRP_STATE
} from "./consts";


export const initJanus = (cb,er,mlt) => {
    Janus.init({
        debug: process.env.NODE_ENV !== 'production' ? ["log", "error"] : ["error"],
        callback: () => {
            let janus = new Janus({
                server: mlt ? JANUS_SRV_GXY : JANUS_SRV_VRT,
                iceServers: [{urls: STUN_SRV_GXY}],
                success: () => {
                    Janus.log(" :: Connected to JANUS");
                    cb(janus);
                },
                error: (error) => {
                    Janus.log(error + " -- reconnect after 10 sec");
                    er(true);
                },
                destroyed: () => {
                    Janus.log(" :: Janus destroyed -- reconnect after 10 sec :: ");
                    setTimeout(() => {
                        window.location.reload();
                    }, 100000);
                }
            });
        }
    })
};

export const micLevel = (stream, canvas, cb) => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    //let audioContext = null;
    //let mn = 25/128;
    let audioContext = new AudioContext();
    cb(audioContext);
    let analyser = audioContext.createAnalyser();
    let microphone = audioContext.createMediaStreamSource(stream);
    let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 2048;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);

    javascriptNode.connect(audioContext.destination);

    let canvasContext = canvas.getContext("2d");
    let gradient = canvasContext.createLinearGradient(0,0,0,55);
    gradient.addColorStop(1,'green');
    gradient.addColorStop(0.35,'#80ff00');
    gradient.addColorStop(0.10,'orange');
    gradient.addColorStop(0,'red');

    javascriptNode.onaudioprocess = function() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
            values += (array[i]);
        }

        var average = values / length;

//          Janus.log(Math.round(average - 40));

        canvasContext.clearRect(0, 0, 15, 35);
        canvasContext.fillStyle = gradient;
        //canvasContext.fillRect(0, 35-average*mn, 15, 35);
        canvasContext.fillRect(0, 35-average, 15, 35);
    }
};

export const checkNotification = () => {
    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if ( !iOS && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
};

export const getDevicesStream = (audioid,videoid,cb) => {
    //FIXME: Safari does not agree to give nHD resolution
    let height = (Janus.webRTCAdapter.browserDetails.browser === "safari") ? 480 : 360;
    let video = videoid ? { height:height,width:640,deviceId: {exact: videoid}} : "";
    let audio = audioid ? { deviceId: {exact: audioid}} : "";
        navigator.mediaDevices
            .getUserMedia({ audio: audio, video: video }).then(stream => {
            cb(stream);
        });
};

export const testDevices = (video,audio,cb) => {
    navigator.mediaDevices.getUserMedia({ audio: audio, video: video }).then(stream => {
        cb(stream);
    }, function (e) {
        var message;
        switch (e.name) {
            case 'NotFoundError':
            case 'DevicesNotFoundError':
                message = 'No input devices found.';
                break;
            case 'SourceUnavailableError':
                message = 'Your input device is busy';
                break;
            case 'PermissionDeniedError':
            case 'SecurityError':
                message = 'Permission denied!';
                break;
            default: Janus.log('Permission devices usage is Rejected! You must grant it.', e);
                return;
        }
        Janus.log(message);
    });
};

export const getState = (path, cb) => fetch(`${WFRP_STATE}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        } else {
            let data = {};
            cb(data);
        }
    })
    .catch(ex => Janus.log(`get ${path}`, ex));

export const putData = (path, data, cb) => fetch(`${WFDB_STATE}/${path}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body:  JSON.stringify(data)
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => Janus.log("Put Data error:", ex));

export const getData = (url, request, cb) => fetch(`${url}`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body:  JSON.stringify(request)
    }).then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => Janus.log(`get ${url}`, ex));

export const geoInfo = (url,cb) => fetch(`${url}`)
    .then((response) => {
    if (response.ok) {
        return response.json().then(data => cb(data));
    }
})
    .catch(ex => console.log(`get geoInfo`, ex));
