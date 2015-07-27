
var ProceduralCanvas = React.createClass({
  render: function() {
    var canvasStyle = {width: this.props.width, height: this.props.height};
    return <canvas className='proceduralCanvas'
                    width={this.props.width}
                    height={this.props.height}
                    style={canvasStyle}/>;
  },
  componentDidMount: function() {
    this.componentDidUpdate();
  },
  componentDidUpdate: function() {
    var canvas = React.findDOMNode(this);
    var signal;
    console.log('this.props.signal '+ this.props.signal);
    switch (this.props.signal) {
        case 'perlin':
            signal = Signal2D
                .generatePerlin(this.props.width, this.props.height, this.props.xScale, this.props.yScale, this.props.seed)
                .add(1.0)
                .multiply(0.5 * 256);
            break;
        case 'turbulence':
            signal = Signal2D
                .generateTurbulence(this.props.width,
                    this.props.height,
                    this.props.xScale,
                    this.props.yScale,
                    this.props.persistence,
                    this.props.octaves,
                    this.props.seed)
                .add(1.0)
                .multiply(0.5 * 256);
            break;
        case 'gaussian':
            signal = Signal2D
                .generateGaussian(this.props.width, this.props.height, this.props.xVariance, this.props.yVariance)
                .multiply(256);
            break;
    }

    renderSignalToCanvas(canvas, signal);
  }
});

var ProceduralControls = React.createClass({
    render: function() {
        var inputStyle = {margin: 10};
        var props = this.props;
        var simpleInput = function(name, value, show) {
            var fullWidth = {width: 300};
            if (!show) {
                fullWidth.display = 'none';
            }
            return (<div style={fullWidth}>
                <label>{name}</label>
                <input type='text' defaultValue={props[value]} style={inputStyle} ref={value}/>
            </div>);
        }
        var s = this.props.signal;
        var inputElements = [
            <div style={{width: 300}}>
                <label>Seed</label>
                <input type='text' defaultValue={this.props.seed} style={inputStyle} ref='seed'/>
                <input onClick={this.handleReroll} type='submit' value='reroll'/>
            </div>,
            simpleInput('Width', 'width', true),
            simpleInput('Height', 'height', true),
            simpleInput('X scale', 'xScale', s == 'perlin' || s == 'turbulence'),
            simpleInput('Y scale', 'yScale', s == 'perlin' || s == 'turbulence'),
            simpleInput('X variance', 'xVariance', s == 'gaussian'),
            simpleInput('Y variance', 'yVariance', s == 'gaussian'),
            simpleInput('Persistence', 'persistence', s == 'turbulence'),
            simpleInput('Octaves', 'octaves', s == 'turbulence')
        ];
        return (
            <div>
                <div style={{width: 300}}>
                    <label>Signal</label>
                    <select defaultValue={this.props.signal} style={inputStyle} onChange={this.handleSignalChange} ref='signal'>
                        <option value='perlin'>Perlin</option>
                        <option value='turbulence'>Turbulence</option>
                        <option value='gaussian'>Gaussian</option>
                    </select>
                </div>
                {inputElements}
                <input onClick={this.handleSubmit} type='submit' value='render'/>
            </div>
        );
    },
    handleSignalChange: function() {
        var signal = React.findDOMNode(this.refs.signal).value.trim();
        this.handleSubmit();
    },
    handleSubmit: function() {
        var signal = React.findDOMNode(this.refs.signal).value.trim();
        var seed = React.findDOMNode(this.refs.seed).value.trim();
        var width = React.findDOMNode(this.refs.width).value.trim();
        var height = React.findDOMNode(this.refs.height).value.trim();
        var xScale = React.findDOMNode(this.refs.xScale).value.trim();
        var yScale = React.findDOMNode(this.refs.yScale).value.trim();
        var xVariance = React.findDOMNode(this.refs.xVariance).value.trim();
        var yVariance = React.findDOMNode(this.refs.yVariance).value.trim();
        var persistence = React.findDOMNode(this.refs.persistence).value.trim();
        var octaves = React.findDOMNode(this.refs.octaves).value.trim();

        this.props.submitRender({
            signal: signal,
            seed: seed,
            width: width,
            height: height,
            xScale: xScale,
            yScale: yScale,
            xVariance: xVariance,
            yVariance: yVariance,
            persistence: persistence,
            octaves: octaves
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
                    <ProceduralControls {...this.state}
                        submitRender={this.submitRender} />
                </div>
                <div>
                    <ProceduralCanvas {...this.state} />
                </div>
            </div>
        );
    },
    getInitialState: function() {
        return {
            signal: 'perlin',
            width: 512,
            height: 512,
            xScale: 0.01,
            yScale: 0.01,
            xVariance: 1000,
            yVariance: 1000,
            persistence: 0.5,
            octaves: 8,
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
