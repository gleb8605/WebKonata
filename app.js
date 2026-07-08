let allData = [];
let searchQuery = ""; 

const ROW_HEIGHT = 28;
const HEADER_HEIGHT = 30;
const LABEL_WIDTH = 550; 
let cycleWidth = 50;

let minCycle = 0;
let maxCycle = 0;

let container;
let scrollContainer;

document.getElementById("fileInput").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    allData = parseKanata(text);
    console.log("Instructions:", allData.length);

    minCycle = Infinity;
    maxCycle = 0;

    for (const inst of allData) {
        for (const s of inst.stageList) {
            if (s.cycle < minCycle) minCycle = s.cycle;
            if (s.cycle > maxCycle) maxCycle = s.cycle;
        }
    }

    if (minCycle === Infinity) {
        minCycle = 0;
        maxCycle = 100;
    }

    maxCycle += 5; 

    initViewer();
    render();
});

document.getElementById("searchBox").addEventListener("input", e => {
    searchQuery = e.target.value.trim().toLowerCase();
    render(); 
});