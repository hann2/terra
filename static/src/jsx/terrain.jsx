
var supportedFields = {
    'perlin' : {
        'seed' : true
    },
    'turbulence' : {
        'seed' : true
    },
    'gaussian' : {
        'width' : true,
        'height' : true
    },
    'continent' : {
        'seed' : true,
        'width' : true,
        'height' : true,
        'display' : true
    },
    'multicontinent' : {
        'seed' : true,
        'width' : true,
        'height' : true,
        'display' : true
    }
};

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
    terrain.render(canvas, this.props);
  }
});

var ProceduralControls = React.createClass({
    render: function() {
        var inputStyle = {margin: 10};
        var props = this.props;
        var s = this.props.signal;
        var simpleInput = function(name, value) {
            var fullWidth = {width: 300};
            if (!supportedFields[s][value]) {
                fullWidth.display = 'none';
            }
            return (<div style={fullWidth}>
                <label>{name}</label>
                <input type='text' defaultValue={props[value]} style={inputStyle} ref={value}/>
            </div>);
        }
        var fullWidth = {width: 300};
        if (!supportedFields[s].seed) {
            fullWidth.display = 'none';
        }
        var simpleInputElements = [
            simpleInput('Width', 'width'),
            simpleInput('Height', 'height'),
            simpleInput('X scale', 'xScale'),
            simpleInput('Y scale', 'yScale'),
            simpleInput('X variance', 'xVariance'),
            simpleInput('Y variance', 'yVariance'),
            simpleInput('Persistence', 'persistence'),
            simpleInput('Octaves', 'octaves')
        ];
        var fullWidth2 = {width: 300};
        if (!supportedFields[s].display) {
            fullWidth2.display = 'none';
        }
        return (
            <div>
                <div style={{width: 300}}>
                    <label>Signal</label>
                    <select defaultValue={this.props.signal} style={inputStyle} onChange={this.handleSignalChange} ref='signal'>
                        <option value='perlin'>Perlin noise</option>
                        <option value='turbulence'>Turbulence</option>
                        <option value='gaussian'>Gaussian</option>
                        <option value='continent'>Continent</option>
                        <option value='multicontinent'>Multi-Continent</option>
                    </select>
                </div>
                <div style={fullWidth}>
                    <label>Random</label>
                    <input type='text' defaultValue={this.props.seed} style={inputStyle} ref='seed'/>
                    <input onClick={this.handleReroll} type='submit' value='reroll'/>
                </div>
                {simpleInputElements}
                <div style={fullWidth2}>
                    <label>Display</label>
                    <select defaultValue={this.props.display} style={inputStyle} onChange={this.handleSignalChange} ref='display'>
                        <option value='map'>Map</option>
                        <option value='topo'>Topographical</option>
                        <option value='parchment'>Parchment</option>
                        <option value='temperature'>Temperature</option>
                        <option value='moisture'>Moisture</option>
                        <option value='river'>River</option>
                    </select>
                </div>
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
        var seed = parseFloat(React.findDOMNode(this.refs.seed).value.trim());
        var width = React.findDOMNode(this.refs.width).value.trim();
        var height = React.findDOMNode(this.refs.height).value.trim();
        var xScale = React.findDOMNode(this.refs.xScale).value.trim();
        var yScale = React.findDOMNode(this.refs.yScale).value.trim();
        var xVariance = React.findDOMNode(this.refs.xVariance).value.trim();
        var yVariance = React.findDOMNode(this.refs.yVariance).value.trim();
        var persistence = React.findDOMNode(this.refs.persistence).value.trim();
        var octaves = React.findDOMNode(this.refs.octaves).value.trim();
        var display = React.findDOMNode(this.refs.display).value.trim();

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
            octaves: octaves,
            display: display
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
            signal: 'continent',
            width: 600,
            height: 600,
            xScale: 0.01,
            yScale: 0.01,
            xVariance: 15000,
            yVariance: 15000,
            persistence: 0.5,
            octaves: 8,
            seed: Math.random(),
            display: 'map'
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
