
function renderSignalToCanvas(canvas, signal, width, height) {
    var ctx = canvas.getContext('2d');

    var image = ctx.createImageData(width, height);
    var data = image.data;

    for (var i = 0; i < signal.length; i++) {
        var cell = i * 4;
        data[cell] = data[cell + 1] = data[cell + 2] = signal[i] * 256;
        data[cell + 3] = 255;
    }

    ctx.fillColor = 'black';
    ctx.fillRect(0, 0, 100, 100);
    ctx.putImageData(image, 0, 0);
}

function renderImageToCanvas(canvas, signal, width, height) {
    var ctx = canvas.getContext('2d');

    var image = ctx.createImageData(width, height);
    var data = image.data;

    for (var i = 0; i < signal.length; i++) {
        data[i] = signal[i];
    }

    ctx.fillColor = 'black';
    ctx.fillRect(0, 0, 100, 100);
    ctx.putImageData(image, 0, 0);
}

function renderSignalToCanvasDeprecated(canvas, signal) {
    var ctx = canvas.getContext('2d');

    var image = ctx.createImageData(signal.width, signal.height);
    var data = image.data;

    signal.perPixel(
        function(pix, coord) {
            var cell = (coord[0] + coord[1] * signal.width) * 4;
            // rgb
            if (pix.length == 1) {
                data[cell] = data[cell + 1] = data[cell + 2] = pix[0];
            } else {
                for (var k = 0; k < 3; k++) {
                    data[cell + k] = pix[k];
                }
            }
            //alpha
            if (pix.length == 4) {
                data[cell + 3] = pix[3];
            } else {
                data[cell + 3] = 255;
            }
        }
    );

    ctx.fillColor = 'black';
    ctx.fillRect(0, 0, 100, 100);
    ctx.putImageData(image, 0, 0);
}
