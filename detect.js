class App extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef(); // Référence au canvas
    }

    async componentDidMount() {
       
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
        ctx.clearRect(80, 80, canvas.width, canvas.height);
        ctx.drawImage(video, 80, 80, canvas.width, canvas.height);

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

ReactDOM.render(React.createElement(App), document.getElementById('video-container'));

