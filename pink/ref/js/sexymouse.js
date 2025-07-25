let lastTime = 0;
const throttleTime = 75;

document.addEventListener('mousemove', function(e) {
    const currentTime = Date.now();
    if (currentTime - lastTime > throttleTime) {
        createPlusSign(e.clientX, e.clientY);
        lastTime = currentTime;
    }
});

function createPlusSign(x, y) {
    const plusSign = document.createElement('div');
    plusSign.innerText = '+';
    plusSign.style.position = 'absolute';
    plusSign.style.left = `${x}px`;
    plusSign.style.top = `${y}px`;
    plusSign.style.fontSize = '18px';
    plusSign.style.fontWeight = 'bold';
    plusSign.style.color = 'rgba(255, 255, 255, 0.801)';
    plusSign.style.pointerEvents = 'none';
    plusSign.style.zIndex = '1';
    document.body.appendChild(plusSign);

    let gravity = 1.5;
    let jitter = Math.random() * 2 - 1;
    let scale = 1;
    let shrinkRate = 0.01;

    const interval = setInterval(function() {
        y += gravity;
        plusSign.style.top = `${y}px`;

        x += jitter;
        plusSign.style.left = `${x}px`;

        scale -= shrinkRate;
        if (scale > 0) {
            plusSign.style.transform = `scale(${scale})`;
        }

        if (y >= window.innerHeight || scale <= 0) {
            clearInterval(interval);
            plusSign.remove();
        }
    }, 50);
}
