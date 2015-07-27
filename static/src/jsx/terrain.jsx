
var ProceduralCanvas = React.createClass({
    render: function() {
        var canvasStyle = {width: this.props.width, height: this.props.height};
        return (
            <div>
                <canvas ref='canvas' className='proceduralCanvas'
                    width={this.props.width}
                    height={this.props.height}
                    style={canvasStyle}/>
                <div>Rendering progress: ... {this.state.loadingPercentage}% ...</div>
            </div>
        );
    },
    componentDidMount: function() {
        var completeCallback = this.completeCallback
        console.log('mount');
        var signal2D = Signal2D
            .generatePerlin(this.props.width, this.props.height, 0.01, 0.01, this.props.seed, this.inProgressCallback,
                function(signal) {
                    signal.add(1.0, null, function(signal) {
                        signal.multiply(0.5 * 256, null, completeCallback);
                    });
                });
    },
    inProgressCallback: function(loadingPercentage) {
        this.setState({
            loadingPercentage: loadingPercentage
        });
    },
    completeCallback: function(signal2D) {
        console.log('complete');
        var canvas = React.findDOMNode(this.refs.canvas);
        renderSignalToCanvas(canvas, signal2D);
        this.setState({
            loadingPercentage: 100
        });
    },
    getInitialState: function() {
        return {
            loadingPercentage: 0
        };
    }
});

var ProceduralControls = React.createClass({
    render: function() {
        var inputStyle = {margin: 10};
        return (
            <div>
                <label>Signal</label>
                <select value={this.props.signal} onChange={this.handleSignalChange} style={inputStyle} ref='signal'>
                  <option value='perlin'>Perlin noise</option>
                  <option value='turbulence'>Turbulence</option>
                  <option value='gaussian'>Gaussian</option>
                </select>
                <br/>

                <label>Seed</label>
                <input type='text' defaultValue={this.props.seed} style={inputStyle} ref='seed'/>
                <input onClick={this.handleReroll} type='submit' value='reroll'/>
                <br/>

                <label>Width</label>
                <input type='text' defaultValue={this.props.width} style={inputStyle} ref='width'/>
                <br/>

                <label>Height</label>
                <input type='text' defaultValue={this.props.height} style={inputStyle} ref='height'/>
                <br/>

                <input onClick={this.handleSubmit} type='submit' value='render'/>
            </div>
        );
    },
    handleSignalChange: function() {
        var signal = React.findDOMNode(this.refs.signal).value.trim();

        this.props.submitRender({
            signal: signal
        });
    },
    handleSubmit: function() {
        var seed = React.findDOMNode(this.refs.seed).value.trim();
        var width = React.findDOMNode(this.refs.width).value.trim();
        var height = React.findDOMNode(this.refs.height).value.trim();

        this.props.submitRender({
            seed: seed,
            width: width,
            height: height
        });
    },
    handleReroll: function() {
        var seed = Math.random();
        React.findDOMNode(this.refs.seed).value = seed;
        this.handleSubmit();
    }
});

var Procedural = React.createClass({
    render: function() {
        return (
            <div>
                <div style={{'width': 300, 'float': 'left'}}>
                    <ProceduralControls
                        signal={this.state.signal}
                        width={this.state.width}
                        height={this.state.height}
                        seed={this.state.seed}
                        submitRender={this.submitRender} />
                </div>
                <div>
                    <ProceduralCanvas
                        signal={this.state.signal}
                        width={this.state.width}
                        height={this.state.height}
                        seed={this.state.seed} />
                </div>
            </div>
        );
    },
    getInitialState: function() {
        return {
            width: 512,
            height: 512,
            seed: Math.random(),
            signal: 'perlin'
        };
    },
    submitRender: function(data) {
        this.setState(data);
    }
});

React.render(
  <Procedural />,
  document.getElementById('content')
);
