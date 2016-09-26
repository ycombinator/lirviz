function drawEdge(fromX, fromY, toX, toY) {

  // Make space for arrowhead
  toX = toX - 20;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#555';
  ctx.fillStyle = ctx.strokeStyle;

  // Determine control points
  control1X = (fromX + toX) * 0.6;
  control1Y = fromY; // (fromY + toY) / 2;

  control2X = (fromX + toX) * 0.4;
  control2Y = toY; // (fromY + toY) / 2;

  // Arrow curve
  ctx.bezierCurveTo(control1X, control1Y, control2X, control2Y, toX, toY);
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX, toY - 10); // Up
  ctx.lineTo(toX + 20, toY); // Right + down
  ctx.lineTo(toX, toY + 10); // Left + down
  ctx.lineTo(toX, toY); // Up
  ctx.fill();
  // ctx.stroke();
}
