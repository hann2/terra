
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
