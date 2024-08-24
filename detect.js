class App extends React.Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();  // Référence à l'élément vidéo
        this.canvasRef = React.createRef(); // Référence au canvas
    }

    async componentDidMount() {
        // Attendre que la vidéo soit prête avant de charger le modèle et de commencer la détection
        this.videoRef.current.addEventListener('loadeddata', async () => {
            const model = await cocoSsd.load();
            this.detectFromVideoFrame(model, this.videoRef.current);
        });

        // Démarrer la caméra par défaut au démarrage
        this.startCamera();
    }

    startCamera(deviceId) {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined
            }
        };

        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            this.currentStream = stream;
            this.videoRef.current.srcObject = stream;
            this.videoRef.current.style.display = 'block';
        }).catch(err => {
            console.error("Erreur d'accès à la caméra:", err);
        });
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
        ctx.drawImage(this.videoRef.current, 0, 0, this.canvasRef.current.width, this.canvasRef.current.height);

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
        return (
           
        );
    }
}

ReactDOM.render(React.createElement(App), document.getElementById('video-container'));
