function drawGrid(spacing = 10) {
  var canvas = ctx.canvas;
  ctx.lineWidth = 0.25;
  ctx.strokeStyle = '#c0c0c0';

  // Establish canvas sides' positions
  var canvasLeft   = canvas.clientLeft;
  var canvasRight  = canvasLeft + canvas.clientWidth;
  var canvasTop    = canvas.clientTop;
  var canvasBottom = canvasTop + canvas.clientHeight;

  // Draw vertical lines in grid
  for (position = canvasLeft + spacing; position < canvasRight; position += spacing) {
    ctx.beginPath();
    ctx.moveTo(position, canvasTop);
    ctx.lineTo(position, canvasBottom);
    ctx.stroke();
  }

  // Draw horizontal lines in grid
  for (position = canvasTop + spacing; position < canvasBottom; position += spacing) {
    ctx.beginPath();
    ctx.moveTo(canvasLeft, position);
    ctx.lineTo(canvasRight, position);
    ctx.stroke();
  }

}
