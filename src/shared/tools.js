import {Janus} from "../lib/janus";
import {
    JANUS_SRV_MKZLC,
    JANUS_SRV_EURFR,
    STUN_SRV_MKZ,
    STUN_SRV_GXY,
    JSDB_STATE,
    JSRP_STATE,
    ENC_URL
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

export const audioLevel = (stream, canvas, width) => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioContext = new AudioContext();
    let analyser = audioContext.createAnalyser();
    let microphone = audioContext.createMediaStreamSource(stream);
    let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 2048;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);

    javascriptNode.connect(audioContext.destination);

    let drawContext;
    let gradient;
    let mn = width/128;

    drawContext = canvas.getContext('2d');
    gradient = drawContext.createLinearGradient(0,0,width,10);
    gradient.addColorStop(0,'green');
    gradient.addColorStop(0.20,'#80ff00');
    gradient.addColorStop(0.85,'orange');
    gradient.addColorStop(1,'red');



    javascriptNode.onaudioprocess = function() {
        let average = getBufferAverage(analyser);
        drawContext.clearRect(0, 0, width, 40);
        drawContext.fillStyle=gradient;
        drawContext.fillRect(0,0,average*mn,10);
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

export const streamFetcher = (data, cb) => fetch(`${ENC_URL}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body:  JSON.stringify(data)
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Put Data error:", ex));

export const getState = (path, cb) => fetch(`${JSRP_STATE}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        } else {
            let data = {};
            cb(data);
        }
    })
    .catch(ex => Janus.log(`get ${path}`, ex));

export const putData = (path, data, cb) => fetch(`${JSDB_STATE}/${path}`, {
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
    let mn = width/128;

    let drawContext = canvas.getContext('2d');
    let gradient = drawContext.createLinearGradient(0,0,width,10);
    gradient.addColorStop(0,'green');
    gradient.addColorStop(0.20,'#80ff00');
    gradient.addColorStop(0.85,'orange');
    gradient.addColorStop(1,'red');

    let sampleAudioStream = () => {
        let average = getBufferAverage(analyser);
        drawContext.clearRect(0, 0, width, 40);
        drawContext.fillStyle=gradient;
        drawContext.fillRect(0,0,average*mn,10);
    };

    p[n] = setInterval(sampleAudioStream, 50);
};

const stereoVisualizer = (analyser1, analyser2, canvas, width, n) => {
    let mn = width/128;

    let drawContext = canvas.getContext('2d');
    let gradient = drawContext.createLinearGradient(0,0,width,10);
    gradient.addColorStop(0,'green');
    gradient.addColorStop(0.20,'#80ff00');
    gradient.addColorStop(0.85,'orange');
    gradient.addColorStop(1,'red');

    let sampleAudioStream = () => {
        let average1 = getBufferAverage(analyser1);
        let average2 = getBufferAverage(analyser2);
        drawContext.clearRect(0, 0, width, 40);
        drawContext.fillStyle=gradient;
        drawContext.fillRect(0,0,average1*mn,10);
        drawContext.fillRect(0,15, average2*mn,10);
    };

    p[n] = setInterval(sampleAudioStream, 50);
};

export const cloneStream = (stream, n, stereo) => {
    let context = new AudioContext();
    let source = context.createMediaStreamSource(stream);
    let destination = context.createMediaStreamDestination();
    source.connect(destination);
    window["out"+n] = new Audio();
    window["out"+n].srcObject = destination.stream;
    window["out"+n].play();
    let device = localStorage.getItem("device" + n);
    if(device) {
        window["out"+n].setSinkId(device)
            .then(() => Janus.log('Success, audio output device attached: ' + device))
            .catch((error) => Janus.error(error));
    }
    if(stereo) {
        let analyser1 = context.createAnalyser();
        let analyser2 = context.createAnalyser();
        let splitter = context.createChannelSplitter(2);
        source.connect(splitter);
        splitter.connect(analyser1,0,0);
        splitter.connect(analyser2,1,0);
        stereoVisualizer(analyser1, analyser2, document.getElementById('canvas'+n),250,n);
    } else {
        let analyzer = context.createAnalyser();
        source.connect(analyzer);
        streamVisualizer(analyzer, document.getElementById('canvas'+n),250,n);
    }
};

export const testContext = (cb) => {
    let mp3 = 'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
    let audio = new Audio();
    audio.src = mp3;
    audio.play();
    audio.onplay = () => {
        let context = new AudioContext();
        context.state === "running" ? cb(true) : cb (false);
    };
};

export const checkAutoPlay = () => {
    let promise = document.createElement("video").play();
    if(promise instanceof Promise) {
        promise.catch(function(error) {
            console.log("AUTOPLAY ERROR: ", error)
        }).then(function() {});
    }
};