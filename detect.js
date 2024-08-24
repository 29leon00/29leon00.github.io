let currentStream;
const video = document.getElementById('video'); // Utilisation de l'ID "video" cohérent avec le HTML
const canvas = document.getElementById('canvas'); // Utilisation de l'ID "canvas" cohérent avec le HTML
const cameraSelect = document.getElementById('cameraSelect'); // Utilisation de l'ID "cameraSelect" cohérent avec le HTML

navigator.mediaDevices.enumerateDevices().then(devices => {
    devices.forEach(device => {
        if (device.kind === 'videoinput') {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
        }
    });

    if (cameraSelect.length > 0) {
        startCamera(cameraSelect.value);
    }
});

cameraSelect.onchange = () => {
    startCamera(cameraSelect.value);
};

function startCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            deviceId: deviceId ? { exact: deviceId } : undefined
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        currentStream = stream;
        video.srcObject = stream;
        video.style.display = 'block';
    }).catch(err => {
        console.error("Erreur d'accès à la caméra:", err);
    });
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef(); // Référence au canvas
    }

    async componentDidMount() {
        const model = await cocoSsd.load();
        this.detectFromVideoFrame(model, video);
    }

    detectFromVideoFrame = (model, video) => {
        const detect = async () => {
            const predictions = await model.detect(video);
            this.renderPredictions(predictions);
            requestAnimationFrame(detect);
        };
        detect();
    };

    renderPredictions = (predictions) => {
        const ctx = this.canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, this.canvasRef.current.width, this.canvasRef.current.height);
        ctx.drawImage(video, 0, 0, this.canvasRef.current.width, this.canvasRef.current.height);

        predictions.forEach(prediction => {
            ctx.beginPath();
            ctx.rect(...prediction.bbox);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "green";
            ctx.fillStyle = "green";
            ctx.stroke();
            ctx.fillText(
                `${prediction.class} : ${Math.round(prediction.score * 100)}%`,
                prediction.bbox[0],
                prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
            );
        });
    };

    render() {
        return <canvas ref={this.canvasRef} id="canvas" width="1280" height="720"></canvas>;
    }
}

const domContainer = document.querySelector('#video-container');
ReactDOM.render(React.createElement(App), domContainer);
