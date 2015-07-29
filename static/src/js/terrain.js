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

    var getContinentColor = function(height, waterLevel) {
        if (height > 0.9) {
            return [255, 250, 250]; //white
        } else if (height > 0.8) {
            return [139, 137, 137]; //grey
        } else if (height > 0.7) {
            return [139, 119, 101]; //brown
        } else if (height > 0.4) {
            return [0, 100, 0];     //dark green
        } else if (height > 0.25) {
            return [50, 205, 50];   //light green
        } else if (height > waterLevel) {
            return [238, 232, 170]; //tan
        } else {
            return [65, 105, 225];  //blue
        }
    };

    var renderMap = function(canvas, props, heightMap, waterLevel) {
        var imageData = [];
        for (var i = 0; i < heightMap.length; i++) {
            var dataCell = i;
            var imageCell = i * 4;
            var height = heightMap[dataCell];
            var color = getContinentColor(height, waterLevel);
            imageData[imageCell] = color[0];
            imageData[imageCell + 1] = color[1];
            imageData[imageCell + 2] = color[2];
            imageData[imageCell + 3] = 256;
        }
        renderImageToCanvas(canvas, imageData, props.width, props.height);
    };

    var getHeatColor = function(temperature) {
        if (temperature > 0.5) {
            scale = (temperature - 0.5) * 2;
            return [256 * scale, 256 * (1 - scale), 0];
        } else {
            scale = temperature * 2;
            return [0, 256 * scale, 256 * (1 - scale)];
        }
    };

    var renderHeatMap = function(canvas, props, map) {
        var imageData = [];
        for (var i = 0; i < map.length; i++) {
            var dataCell = i;
            var imageCell = i * 4;
            var temperature = map[dataCell];
            var color = getHeatColor(temperature);
            imageData[imageCell] = color[0];
            imageData[imageCell + 1] = color[1];
            imageData[imageCell + 2] = color[2];
            imageData[imageCell + 3] = 256;
        }
        renderImageToCanvas(canvas, imageData, props.width, props.height);
    };

    var renderTopographical = function(canvas, props, heightMap, waterLevel) {
        var imageData = [];
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var imageCell = (i + j * props.width) * 4;
                var levels = 5;
                var height = Math.floor(heightMap[i + j * props.width] * levels);
                var height2 = Math.floor(heightMap[i + 1 + j * props.width] * levels);
                var height3 = Math.floor(heightMap[i + (j + 1) * props.width] * levels);
                var height4 = Math.floor(heightMap[i + 1 + (j + 1) * props.width] * levels);

                var heightDiffers = height !== height2 || height !== height3 || height !== height4;

                if (i !== (props.width - 1) && j !== (props.height - 1) && heightDiffers) {
                    color = [0, 0, 0];
                } else if (height > waterLevel) {
                    color = [238, 232, 170];
                } else {
                    color = [65, 105, 225];
                }

                imageData[imageCell] = color[0];
                imageData[imageCell + 1] = color[1];
                imageData[imageCell + 2] = color[2];
                imageData[imageCell + 3] = 256;
            }
        }
        renderImageToCanvas(canvas, imageData, props.width, props.height);
    };

    var renderParchment = function(canvas, props, heightMap, waterLevel) {
        var imageData = [];
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var imageCell = (i + j * props.width) * 4;
                var height = heightMap[i + j * props.width];
                var height2 = heightMap[i + 1 + j * props.width];
                var height3 = heightMap[i + (j + 1) * props.width];
                var height4 = heightMap[i + 1 + (j + 1) * props.width];

                var heightDiffers = (height <= waterLevel && (height2 > waterLevel || height3 > waterLevel || height4 > waterLevel))
                                 || (height >= waterLevel && (height2 < waterLevel || height3 < waterLevel || height4 < waterLevel));

                if (i !== (props.width - 1) && j !== (props.height - 1) && heightDiffers) {
                    color = [0, 0, 0];
                } else if (height > waterLevel) {
                    color = [238, 232, 170];
                } else {
                    // color = [65, 105, 225];
                    var scale = 0.8;
                    color = [238 * scale, 232 * scale, 170 * scale];
                }

                imageData[imageCell] = color[0];
                imageData[imageCell + 1] = color[1];
                imageData[imageCell + 2] = color[2];
                imageData[imageCell + 3] = 256;
            }
        }
        renderImageToCanvas(canvas, imageData, props.width, props.height);
    };

    var renderContinent = function(canvas, props) {
        var heightMap = [];
        noise.seed(props.seed);
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var cell = (i + j * props.width);
                var turbulence = processing.turbulence(0.01 * i, 0.01 * j, 0.5, 8);
                turbulence = processing.gain(0.4, turbulence);
                heightMap[cell] = turbulence;
            }
        }
        processing.normalize(heightMap);
        // renderSignalToCanvas(canvas, heightMap, props.width, props.height);
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var cell = (i + j * props.width);
                var x = i - props.width / 2;
                var y = j - props.height / 2;
                var gauss = processing.gaussian(x, y, 15000, 15000) * 0.80 + 0.15;
                heightMap[cell] *= gauss;
            }
        }
        processing.normalize(heightMap);
        // renderSignalToCanvas(canvas, heightMap, props.width, props.height);

        var temperatureMap = [];
        noise.seed((props.seed + 0.1) % 1);
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var cell = (i + j * props.width);
                var turbulence = processing.turbulence(0.01 * i, 0.01 * j, 0.5, 8);
                // turbulence = processing.bias(0.7, turbulence);
                temperatureMap[cell] = turbulence;
            }
        }
        processing.normalize(temperatureMap);
        for (var i = 0; i < props.width; i++) {
            for (var j = 0; j < props.height; j++) {
                var cell = (i + j * props.width);
                var y = j - props.height / 2;
                var gauss = processing.gaussian(0, y, 1, 15000);
                temperatureMap[cell] = processing.bias(0.65, temperatureMap[cell]) * gauss;
            }
        }
        processing.normalize(temperatureMap);
        // renderHeatMap(canvas, props, temperatureMap);

        var rainBudget = 100;
        var highestReached = [];
        for (var j = 0; j < props.height; j++) {
            highestReached[j] = 0;
        }
        var moistureMap = [];
        for (var i = 0; i < heightMap.length; i++) {
            moistureMap[i] = 0;
        }
        for (var j = 0; j < props.height; j++) {
            for (var i = 0; i < props.width; i++) {
                var height = Math.floor(heightMap[i + j * props.width] * rainBudget);

                if (height > highestReached[j]) {
                    var rainUnits = height - highestReached[j];
                    highestReached[j] = height;
                    if (rainUnits > 0) {
                        for (var k = 0; k < 100; k++) {
                            if ((i - k) >= 0) {
                                moistureMap[(i - k) + j * props.width] += processing.gaussian(0, k, 1, 1000);
                            }
                        }
                    }
                }
            }
        }
        // processing.normalize(moistureMap);
        // noise.seed((props.seed + 0.2) % 1);
        // for (var i = 0; i < props.width; i++) {
        //     for (var j = 0; j < props.height; j++) {
        //         var cell = (i + j * props.width);
        //         var turbulence = processing.turbulence(0.01 * i, 0.01 * j, 0.5, 8);
        //         // turbulence = processing.bias(0.7, turbulence);
        //         moistureMap[cell] += turbulence;
        //     }
        // }
        processing.normalize(moistureMap);

        var waterLevel = 0.2;
        switch (props.display) {
            case 'map':
                renderMap(canvas, props, heightMap, waterLevel);
                break;
            case 'topo':
                renderTopographical(canvas, props, heightMap, waterLevel);
                break;
            case 'parchment':
                renderParchment(canvas, props, heightMap, waterLevel);
                break;
            case 'temperature':
                renderHeatMap(canvas, props, temperatureMap);
                break;
            case 'moisture':
                renderHeatMap(canvas, props, moistureMap);
                break;
        }
    };

    terrain.render = function(canvas, props) {
        var signal = props.signal;
        switch (signal) {
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
                renderContinent(canvas, props);
                break;
        }
    };

    return terrain;
})();
