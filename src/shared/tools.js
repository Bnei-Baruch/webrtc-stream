import {Janus} from "../lib/janus";
import {
    JANUS_SRV_MKZLC,
    JANUS_SRV_EURFR,
    STUN_SRV_MKZ,
    STUN_SRV_GXY,
    WFDB_STATE,
    WFRP_STATE
} from "./consts";


export const initJanus = (cb,er,lcl) => {
    Janus.init({
        debug: process.env.NODE_ENV !== 'production' ? ["log", "error"] : ["error"],
        callback: () => {
            let janus = new Janus({
                server: lcl ? JANUS_SRV_MKZLC : JANUS_SRV_EURFR,
                iceServers: [{urls: lcl ? STUN_SRV_MKZ : STUN_SRV_GXY}],
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

export const getData = (url, cb) => fetch(`${url}`)
    .then((response) => {
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

function getBufferAverage(analyser) {
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var average = getAverageVolume(array);
    return average;
}

function getAverageVolume(array) {
    var values = 0;
    var average;
    var length = array.length;
    for (var i = 0; i < length; i++) {
        values += array[i];
    }
    average = values / length;
    return average;
}

var p = {};

const streamVisualizer = (analyser, canvas, width, n) => {
    //var canvas;
    //var canvasctx;
    var drawContext;
    var gradient;
    var mn = width/128;

    drawContext = canvas.getContext('2d');
    gradient = drawContext.createLinearGradient(0,0,width,10);
    gradient.addColorStop(0,'green');
    gradient.addColorStop(0.20,'#80ff00');
    gradient.addColorStop(0.85,'orange');
    gradient.addColorStop(1,'red');

    var sampleAudioStream = function() {
        var average = getBufferAverage(analyser);
        drawContext.clearRect(0, 0, width, 40);
        drawContext.fillStyle=gradient;
        drawContext.fillRect(0,0,average*mn,10);
    };

    p[n] = setInterval(sampleAudioStream, 50);
}

export const cloneStream = (stream, n) => {
    console.log(" --::-- clone called: ",stream,n);
    window["a"+n] = stream;
    window["ac"+n] = new AudioContext();
    window["ac"+n].createMediaStreamSource(window.window["a"+n]);
    window["ws"+n] = window["ac"+n].createMediaStreamSource(window.window["a"+n]);
    window["wa"+n] = window["ac"+n].createMediaStreamDestination();
    window["ws"+n].connect(window["wa"+n]);
    window["aout"+n] = new Audio();
    window["aout"+n].src = URL.createObjectURL(window["wa"+n].stream);
    window["aout"+n].play();
    let device = localStorage.getItem("device" + n);
    if(device) {
        window["aout"+n].setSinkId(device)
            .then(() => Janus.log('Success, audio output device attached: ' + device))
            .catch((error) => Janus.error(error));
    }
    window["an"+n] = window["ac"+n].createAnalyser();
    window["ws"+n].connect(window["an"+n]);
    streamVisualizer(window["an"+n], document.getElementById('canvas_'+n),250,n);
    //var streamVisualizer2 = new streamVisualizer(window["an"+n], document.getElementById('canvas_'+n),250);
    //freqs = new Uint8Array(analyser.frequencyBinCount);
    //times = new Uint8Array(analyser.frequencyBinCount);
}