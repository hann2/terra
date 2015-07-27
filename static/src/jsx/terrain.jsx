
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
    var ctx = canvas.getContext('2d');

    var image = ctx.createImageData(this.props.width, this.props.height);
    var data = image.data;

    var start = Date.now();

    noise.seed(this.props.seed);
    for (var x = 0; x < this.props.width; x++) {
      for (var y = 0; y < this.props.height; y++) {
        var value = Math.abs(noise.perlin2(x / 100, y / 100) * 0.5 + 0.5);
        value *= 256;

        var cell = (x + y * this.props.width) * 4;
        data[cell] = data[cell + 1] = data[cell + 2] = value;
        data[cell + 3] = 255; // alpha.
      }
    }

    var end = Date.now();

    ctx.fillColor = 'black';
    ctx.fillRect(0, 0, 100, 100);
    ctx.putImageData(image, 0, 0);
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center';
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
            width: 1024,
            height: 728,
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
