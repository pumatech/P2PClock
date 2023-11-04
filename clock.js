window.addEventListener("load", init);

var canvas, ctx, radius, startAngle, endAngle;
var mouseDown = false;
var isInWedge = false;
var useAlerts = getCookie("useAlerts", false) == "true";
var useColors = getCookie("useColors", true) == "true";
var timesUp = false;
var logo = new Image();
logo.src = "P2PLogo.png";

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius = radius * 0.95;
  setInterval(drawClock, 1000);

  canvas.onpointerdown = startRange;
  canvas.onpointerup = endRange;
  canvas.onpointermove = dragRange;

  drawClock();

  if (useAlerts) document.getElementById("alerts").checked = "checked";
  if (useColors) document.getElementById("colors").checked = "checked";

  document.getElementById("colors").addEventListener("click", function (e) {
    useColors = e.target.checked;
    setCookie("useColors", useColors, 365);
    if (startAngle) drawClock();
  });
  document.getElementById("alerts").addEventListener("click", function (e) {
  useAlerts = e.target.checked;
  if (useAlerts && Notification && Notification.permission !== "granted") Notification.requestPermission();
  setCookie("useAlerts", useAlerts, 365);
  });
}

function drawClock() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
  drawRange();
}

function drawFace(ctx, radius) {
  const grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
  grad.addColorStop(0, '#333');
  grad.addColorStop(0.5, 'white');
  grad.addColorStop(1, '#333');
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  if (timesUp)
    ctx.fillStyle = '#ef998f';
  else
    ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius * 0.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();
  ctx.drawImage(logo, -55, 55);
}

function drawNumbers(ctx, radius) {
  ctx.font = radius * 0.15 + "px arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let num = 1; num < 13; num++) {
    let ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius) {
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();
  // let second = now.getSeconds() + now.getMilliseconds() / 1000;
  //hour
  hour = hour % 12;
  hour = (hour * Math.PI / 6) +
    (minute * Math.PI / (6 * 60)) +
    (second * Math.PI / (360 * 60));
  minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
  second = (second * Math.PI / 30);

  if (!mouseDown) {
    if (isInWedge && !inWedge(minute)) {
      isInWedge = false;
      startAngle = null;
      if (useAlerts) {
        timesUp = true;
        new Notification("time's up!");
        drawClock()
      }
    }
    else {
      isInWedge = inWedge(minute);
    }
  }
  drawHand(ctx, hour, radius * 0.5, radius * 0.07);
  drawHand(ctx, second, radius * 0.9, radius * 0.02);
  drawHand(ctx, minute, radius * 0.8, radius * 0.07);
}

function inWedge(pos) {
  if (pos > startAngle && pos < endAngle) {
    return true;
  }
  else if (endAngle > 2 * Math.PI) {
    if (pos > startAngle && pos < 2 * Math.PI) {
      return true;
    }
    if (pos + 2 * Math.PI < endAngle) {
      return true;
    }
  }
  return false;
}


function drawHand(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}

function drawRange() {
  if (startAngle) {
    if (startAngle < 0) startAngle += (Math.PI * 2)
    if (endAngle < 0) endAngle += (Math.PI * 2)
    if (endAngle < startAngle) endAngle += (Math.PI * 2)
    midAngle = (endAngle + startAngle) / 2;
    fiveMin = 30 * Math.PI / 180;
    almostDone = endAngle - fiveMin;
    if (endAngle - midAngle < fiveMin) almostDone = midAngle;
    if (useColors) {
      drawWedge(startAngle, midAngle, '#40B0A677');
      drawWedge(midAngle, almostDone, '#E1BE6A77');
      drawWedge(almostDone, endAngle, '#DC322077');
    }
    else {
      drawWedge(startAngle, endAngle, '#40B0A677');
    }
  }
}

function drawWedge(start, end, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.rotate(start);
  ctx.lineTo(0, -radius * .95);
  ctx.rotate(-start);
  ctx.arc(0, 0, radius * .95, start - Math.PI / 2, end - Math.PI / 2)
  ctx.moveTo(0, 0);
  ctx.rotate(end);
  ctx.lineTo(0, -radius * .95);
  ctx.rotate(-end);
  ctx.fill();
}

function startRange(e) {
  startAngle = Math.atan2((200 - (e.pageY - canvas.offsetTop)), (200 - (e.pageX - canvas.offsetLeft))) - Math.PI / 2;
  endAngle = startAngle + .02;
  mouseDown = true
  isInWedge = false;
  timesUp = false;
  drawClock();
}

function endRange(e) {
  dragRange(e);
  mouseDown = false;
}

function dragRange(e) {
  if (mouseDown) {
    endAngle = Math.atan2((200 - (e.pageY - canvas.offsetTop)), (200 - (e.pageX - canvas.offsetLeft))) - Math.PI / 2;
    isInWedge = false;
    drawClock();
  }
}

function toggleColors(e) {
  useColors = e.checked;
  setCookie("useColors", useColors, 365);
  if (startAngle) drawClock();
}

function toggleAlerts(e) {
  useAlerts = e.checked;
  if (useAlerts && Notification && Notification.permission !== "granted") Notification.requestPermission();
  setCookie("useAlerts", useAlerts, 365);
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname, defVal) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return defVal;
}
