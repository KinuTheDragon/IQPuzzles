const UPSCALE = 1;

const canvas = document.getElementById("canvas");
canvas.style.width = canvas.getAttribute("width") / UPSCALE + "px";
canvas.style.height = canvas.getAttribute("height") / UPSCALE + "px";
const ctx = canvas.getContext("2d");

function rgbToHsv(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [ h, s, v ];
}

function hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [ r * 255, g * 255, b * 255 ];
}

function hsvFunc(rgb, func) {
    let hsv = rgbToHsv(...parseColor(rgb));
    let newHsv = func(...hsv);
    let newRgb = hsvToRgb(...newHsv);
    return "rgb(" + newRgb + ")";
}

function parseColor(color) {
    if (color.startsWith("#")) {
        color = color.slice(1);
        if (color.length === 3)
            color = [...color].map(x => x + x).join("");
        return [0, 2, 4].map(x => parseInt(color.slice(x, x + 2), 16));
    }
    if (color.startsWith("rgb(")) {
        return color.slice(4, -1).split(",").map(x => parseInt(x));
    }
}

let touched = false;
function addMouseDown(element, listener) {
    function wrappedListener(event, isMobile) {
        if (isMobile) touched = true;
        if (touched && !isMobile) return;
        if (isMobile && element.getBoundingClientRect) {
            let rect = element.getBoundingClientRect();
            event.offsetX = event.touches[0].clientX - rect.left;
            event.offsetY = event.touches[0].clientY - rect.top;
        }
        return listener(event);
    }
    element.addEventListener("mousedown", e => wrappedListener(e, false));
    element.addEventListener("touchstart", e => wrappedListener(e, true));
}

function addMouseUp(element, listener) {
    function wrappedListener(event, isMobile) {
        if (isMobile) touched = true;
        if (touched && !isMobile) return;
        if (isMobile && element.getBoundingClientRect) {
            let rect = element.getBoundingClientRect();
            event.offsetX = event.touches[0].clientX - rect.left;
            event.offsetY = event.touches[0].clientY - rect.top;
        }
        return listener(event);
    }
    element.addEventListener("mouseup", e => wrappedListener(e, false));
    element.addEventListener("touchend", e => wrappedListener(e, true));
}

function addMouseMove(element, listener) {
    function wrappedListener(event, isMobile) {
        if (isMobile) touched = true;
        if (touched && !isMobile) {touched = false; return;};
        if (isMobile && element.getBoundingClientRect) {
            let rect = element.getBoundingClientRect();
            event.offsetX = event.touches[0].clientX - rect.left;
            event.offsetY = event.touches[0].clientY - rect.top;
        }
        return listener(event);
    }
    element.addEventListener("mousemove", e => wrappedListener(e, false));
    element.addEventListener("touchmove", e => wrappedListener(e, true));
}