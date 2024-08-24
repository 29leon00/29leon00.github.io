class App extends React.Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.state = {
      currentStream: null,
      model: null,
      cameras: [],
      currentCameraIndex: 0,
    };
  }

  async componentDidMount() {
    const model = await cocoSsd.load();
    this.setState({ model });
    await this.initCamera();
  }

  initCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.setState({ cameras: videoDevices });

      if (videoDevices.length > 0) {
        this.switchCamera();
      } else {
        alert('Aucune caméra détectée');
      }
    } catch (error) {
      console.error("Erreur lors de l'accès à la caméra:", error);
    }
  };

  switchCamera = async () => {
    const { cameras, currentCameraIndex, currentStream } = this.state;
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
    const selectedCamera = cameras[nextCameraIndex];

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: selectedCamera.deviceId },
    });

    this.videoRef.current.srcObject = stream;
    this.setState({ currentStream: stream, currentCameraIndex: nextCameraIndex });

    this.detectFromVideoFrame(this.state.model, this.videoRef.current);
  };

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
        prediction.class + " : " + Math.round(prediction.score * 100) + "%",
        prediction.bbox[0],
        prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
      );
    });
  };

  render() {
    return (
      <div>
        <video
          ref={this.videoRef}
          style={{ display: "none" }}
          autoPlay
          muted
          playsInline
          width="720"
          height="600"
        />
        <canvas ref={this.canvasRef} width="720" height="600" />
      </div>
    );
  }
}

const domContainer = document.querySelector('#root');
const appInstance = ReactDOM.render(React.createElement(App), domContainer);
