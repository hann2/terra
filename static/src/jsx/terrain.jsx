
var ProceduralCanvas = React.createClass({
  render: function() {
    var canvasStyle = {width: this.props.width, height: this.props.height};
    return <canvas className="proceduralCanvas"
                    width={this.props.width}
                    height={this.props.height}
                    style={canvasStyle}/>;
  },
  componentDidMount: function() {
    this.componentDidUpdate();
  },
  componentDidUpdate: function() {
    var canvas = React.findDOMNode(this);
    var signal = Signal2D
        .generatePerlin(this.props.width, this.props.height, 0.01, 0.01, this.props.seed)
        .add(1.0)
        .multiply(0.5 * 256);

    renderSignalToCanvas(canvas, signal);
  }
});

var ProceduralControls = React.createClass({
    render: function() {
        var inputStyle = {margin: 10};
        return (
            <div>
                <label>Seed</label>
                <input type="text" defaultValue={this.props.seed} style={inputStyle} ref="seed"/>
                <input onClick={this.handleReroll} type="submit" value="reroll"/>
                <br/>

                <label>Width</label>
                <input type="text" defaultValue={this.props.width} style={inputStyle} ref="width"/>
                <br/>

                <label>Height</label>
                <input type="text" defaultValue={this.props.height} style={inputStyle} ref="height"/>
                <br/>

                <input onClick={this.handleSubmit} type="submit" value="render"/>
            </div>
        );
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
                    <ProceduralControls width={this.state.width} height={this.state.height} seed={this.state.seed} submitRender={this.submitRender} />
                </div>
                <div>
                    <ProceduralCanvas width={this.state.width} height={this.state.height} seed={this.state.seed} />
                </div>
            </div>
        );
    },
    getInitialState: function() {
        return {
            width: 512,
            height: 512,
            seed: Math.random()
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
