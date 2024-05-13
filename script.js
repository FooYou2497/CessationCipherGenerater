const createCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

const glyphs_img = "iVBORw0KGgoAAAANSUhEUgAAABgAAAADCAYAAACJZs+gAAAAOklEQVQYlYWOQQoAMAjDrP//c3bqkDJcL8WgQQHUiKSaKOffjqTLgeoJDLdY5rvsdPTruy2W+y47HQfyGysCXbI7+wAAAABJRU5ErkJggg==";
const glyphs = new Image();
glyphs.src = 'data:image/png;base64,' + glyphs_img;

const glyphs_crop = { "1": [0, 0, 2, 3], "2": [4, 0, 6, 3], "3": [8, 0, 10, 3], "4": [12, 0, 16, 3], "5": [16, 0, 20, 3], "0": [20, 0, 24, 3] };

async function createGlyphsSecretImage(txt) {
    const text = txt.split("\n");
    const lineCount = text.length;
    let fwidth = 0, fheight = 3;
    for (const line of text) {
        const lineWidth = getLineWidth(line);
        if (lineWidth > fwidth) {
            fwidth = lineWidth;
        }
    }
    const margin = 1, space = 1;
    const picSize = [margin * 2 + fwidth - space, margin * 2 + (fheight + space) * lineCount - space];
    const canvas = createCanvas(picSize[0], picSize[1]);
    const ctx = canvas.getContext('2d');
    let posX = 0, posY = 0;
    for (let i = 0; i < lineCount; i++) {
        posY = i * (3 + space);
        posX = 0;
        for (let j = 0; j < text[i].length; j++) {
            const picLetter = glyphs_crop[text[i][j]];
            ctx.drawImage(glyphs, picLetter[0], picLetter[1], picLetter[2] - picLetter[0], picLetter[3] - picLetter[1], margin + posX, margin + posY, picLetter[2] - picLetter[0], picLetter[3] - picLetter[1]);
            posX += getGlyphWidth(text[i][j]);
        }
    }
    const image = new Image();
    image.src = canvas.toDataURL();
    const output = document.getElementById("output")
    output.removeChild(output.firstChild)
    output.appendChild(image);
}

function getGlyphWidth(n) {
    return glyphs_crop[n][2] - glyphs_crop[n][0];
}

function getLineWidth(line) {
    const lineList = [...line];
    let width = 0;
    for (const n of lineList) {
        width += getGlyphWidth(n);
    }
    return width;
}

function encodeMessage() {
    const message = document.getElementById("message").value;
    const useKey = document.getElementById("useKey").checked;
    const useMax = document.getElementById("useMax").checked;
    const mode = document.getElementById("hideElements").checked;
    if (mode) {
        createGlyphsSecretImage(message)
    }else{
    let key = "110011110100111100101001010110";
    let maxwidth = "42"
    if (useKey) {
        key = document.getElementById("key").value;
        if (key === "") {
            key = "110011110100111100101001010110"
        }
    }
    if (useMax) {
        maxwidth = document.getElementById("max").value;
        if (maxwidth === "") {
            maxwidth = "42"
        }
    }
    const encodedMessage = gencode(message, key);
    const relinedMessage = relineByMaxLength(encodedMessage,maxwidth);
    createGlyphsSecretImage(relinedMessage);
    }
}

function downloadImage() {
    const canvas = document.querySelector('canvas');
    const link = document.createElement('a');
    link.download = 'secret_image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

function gencode(message, key) {
    const PT = [...message].map(l => l.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    let CT = "";
    let pointer = 0;
    let count = 0;
    for (const bit of PT) {
        while (true) {
            if (pointer >= key.length) {
                CT += "0\n";
                count = 0;
                pointer = -1;
            } else if (pointer === -1) {
                count = 1;
                pointer += 1;
            } else if (key[pointer] === bit) {
                CT += count.toString();
                count = 1;
                pointer += 1;
                break;
            } else {
                count += 1;
                pointer += 1;
            }
        }
    }
    return CT + "0";
}

function relineByMaxLength(CT, maxLength) {
    const CTList = CT.split("\n").join('').split('');
    let length = 0;
    const gWidth = { "0": 4, "1": 2, "2": 2, "3": 2, "4": 4, "5": 4 };
    const newCT = [];
    let line = "";
    for (const char of CTList) {
        if (length + gWidth[char] > maxLength) {
            newCT.push(line);
            length = 0;
            line = "";
        }
        line += char;
        length += gWidth[char];
    }
    if (line.length !== 0) {
        newCT.push(line);
    }
    return newCT.join('\n');
}

function toggleKeyInput() {
    const keyInput = document.getElementById("keyInput");
    keyInput.style.display = document.getElementById("useKey").checked ? "block" : "none";
}

function toggleMaxInput() {
    const maxInput = document.getElementById("MaxInput");
    maxInput.style.display = document.getElementById("useMax").checked ? "block" : "none";
}

function toggleMode() {
    var checkbox = document.getElementById("hideElements");
    // var useKeyElement = document.getElementById("useKey");
    // var useMaxElement = document.getElementById("useMax");
    var usekeyElement = document.getElementById("usekey");
    var usemaxElement = document.getElementById("usemax");
    const keyInput = document.getElementById("keyInput");
    const maxInput = document.getElementById("MaxInput");
    if (checkbox.checked) {
        usekeyElement.style.display = "none";
        usemaxElement.style.display = "none";
        keyInput.style.display = "none";
        maxInput.style.display = "none";
        // useKeyElement.style.display = "none";
        // useMaxElement.style.display = "none";
    } else {
        usekeyElement.style.display = "block";
        usemaxElement.style.display = "block";
        keyInput.style.display = document.getElementById("useKey").checked ? "block" : "none";
        maxInput.style.display = document.getElementById("useMax").checked ? "block" : "none";
        // useKeyElement.style.display = "block";
        // useMaxElement.style.display = "block";
    }
}