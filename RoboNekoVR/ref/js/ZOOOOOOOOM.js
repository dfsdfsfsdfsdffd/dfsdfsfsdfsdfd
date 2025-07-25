function lockZoom() {
    const viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", "width=device-width, initial-scale=1.0, user-scalable=no");
}

function disableZoom(event) {
    if (event.ctrlKey && (event.key === '+' || event.key === '-' || event.key === '0')) {
        event.preventDefault();
    }
    if (event.ctrlKey && event.key.length === 1) {
        event.preventDefault();
    }
}

function preventScrollZoom(event) {
    if (event.ctrlKey) {
        event.preventDefault();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    lockZoom();
    document.addEventListener("wheel", preventScrollZoom, { passive: false });
    document.addEventListener("keydown", disableZoom);
    document.addEventListener("keypress", disableZoom);
});