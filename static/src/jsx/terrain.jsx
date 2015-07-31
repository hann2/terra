
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
                <input onClick={this.fooBar} type='submit' value='render'/>
            </div>
        );
    },
    handleSignalChange: function() {
        var signal = React.findDOMNode(this.refs.signal).value.trim();
        this.handleSubmit();
    },
    fooBar: function() {
        this.props.windowX = 0;
        this.props.windowY = 0;
        this.props.windowWidth = 512;
        this.props.windowHeight = 512;
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
            yVariance: yVariance,
            windowX: this.props.windowX,
            windowY: this.props.windowY,
            windowWidth: this.props.windowWidth,
            windowHeight: this.props.windowHeight,
            persistence: persistence,
            octaves: octaves,
            display: display
        });
    },
    handleReroll: function() {
        var seed = Math.random();
        React.findDOMNode(this.refs.seed).value = seed;
        this.fooBar();
    }
});

var Procedural = React.createClass({
    render: function() {
        console.log(this.state);
        return (
            <div style={{'WebkitTouchCallout': 'none',
                    'WebkitUserSelect': 'none',
                    'KhtmlUserSelect': 'none',
                    'MozUserSelect': 'none',
                    'msUserSelect': 'none',
                    'OUserSelect': 'none',
                    'userSelect': 'none'
                }}>
                <div style={{border: '1px dotted #000', position: 'absolute'}} ref='selectArea' hidden></div>
                <div style={{'width': 300, 'float': 'left'}}>
                    <ProceduralControls {...this.state}
                        submitRender={this.submitRender} />
                </div>
                <div>
                    <ProceduralCanvas {...this.state} ref='canvas' />
                </div>
            </div>
        );
    },
    componentDidMount: function() {
        var div = React.findDOMNode(this.refs.selectArea), x1 = 0, y1 = 0, x2 = 0, y2 = 0;
        var canvas = $(React.findDOMNode(this.refs.canvas));
        var offset = canvas.offset();
        offset.right = offset.left + canvas.width();
        offset.bottom = offset.top + canvas.height();
        function reCalc() {
            var x3 = Math.min(x1,x2);
            var x4 = Math.max(x1,x2);
            var y3 = Math.min(y1,y2);
            var y4 = Math.max(y1,y2);
            div.style.left = x3 + 'px';
            div.style.top = y3 + 'px';
            div.style.width = x4 - x3 + 'px';
            div.style.height = y4 - y3 + 'px';
        }
        var clamp = function(v, min, max) {
            return Math.min(max, Math.max(min, v));
        };
        onmousedown = function(e) {
            if (e.clientX < offset.left || e.clientX > offset.right ||
                e.clientY < offset.top || e.clientY > offset.bottom) {
                div.hidden = 1;
                return;
            }
            div.hidden = 0;
            x1 = e.clientX;
            y1 = e.clientY;
            reCalc();
        };
        onmousemove = function(e) {
            if (e.clientX < offset.left || e.clientX > offset.right ||
                e.clientY < offset.top || e.clientY > offset.bottom) {
                div.hidden = 1;
                return;
            }
            x2 = clamp(e.clientX, offset.left, offset.right);
            y2 = clamp(e.clientY, offset.top, offset.bottom);
            reCalc();
        };
        var self = this;
        onmouseup = function(e) {
            if (div.hidden) {
                return;
            }
            div.hidden = 1;
            self.setState({
                windowX: self.state.windowX + Math.floor(((offset.left + self.state.width / 2) - (Math.min(x1, x2) + Math.abs(x1 - x2) / 2)) * self.state.windowWidth / self.state.width),
                windowY: self.state.windowY + Math.floor(((offset.top + self.state.height / 2) - (Math.min(y1, y2) + Math.abs(y1 - y2) / 2)) * self.state.windowHeight / self.state.height),
                windowWidth: Math.floor(self.state.windowWidth * Math.abs(x1 - x2) / self.state.width),
                windowHeight: Math.floor(self.state.windowHeight * Math.abs(y1 - y2) / self.state.height)
            });
        };
    },
    getInitialState: function() {
        return {
            signal: 'continent',
            width: 512,
            height: 512,
            xScale: 0.01,
            yScale: 0.01,
            windowX: 0,
            windowY: 0,
            windowWidth: 512,
            windowHeight: 512,
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
