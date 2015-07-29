var terrain = (function() {
    var terrain = {};

    var renderPerlin = function(canvas, props) {
        var data = [];
        noise.seed(props.seed);
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var cell = (i + j * props.width);
                var turbulence = noise.perlin2(props.xScale * i, props.yScale * j);
                data[cell] = turbulence;
            }
        }
        processing.normalize(data);
        renderSignalToCanvas(canvas, data, props.width, props.height);
    };

    var renderTurbulence = function(canvas, props) {
        var data = [];
        noise.seed(props.seed);
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var cell = (i + j * props.width);
                var turbulence = processing.turbulence(props.xScale * i, props.yScale * j, props.persistence, props.octaves);
                data[cell] = turbulence;
            }
        }
        processing.normalize(data);
        renderSignalToCanvas(canvas, data, props.width, props.height);
    };

    var renderGaussian = function(canvas, props) {
        var data = [];
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var cell = (i + j * props.width);
                var x = i - props.width / 2;
                var y = j - props.height / 2;
                var gauss = processing.gaussian(x, y, props.xVariance, props.yVariance);
                data[cell] = gauss;
            }
        }
        processing.normalize(data);
        renderSignalToCanvas(canvas, data, props.width, props.height);
    };

    terrain.render = function(canvas, props) {
        switch (props.signal) {
            case 'perlin':
                renderPerlin(canvas, props);
                break;
            case 'turbulence':
                renderTurbulence(canvas, props);
                break;
            case 'gaussian':
                renderGaussian(canvas, props);
                break;
            case 'continent':
                var continent = new Continent(props.seed, props.width, props.height);
                continent.generate(canvas).render(canvas, props.display);
                break;
            case 'multicontinent':
                var continent = new Multicontinent(props.seed, props.width, props.height);
                continent.generate(canvas).render(canvas, props.display);
                break;
        }
    };

    return terrain;
})();
