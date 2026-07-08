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

function initViewer() {
    const colCount = maxCycle - minCycle + 1;
    document.documentElement.style.setProperty("--cycle-width", cycleWidth + "px");

    container = document.getElementById("viewer");
    container.innerHTML = "";

    scrollContainer = document.createElement("div");
    scrollContainer.style.position = "relative";
    scrollContainer.style.height = (allData.length * ROW_HEIGHT + HEADER_HEIGHT) + "px";
    
    scrollContainer.style.minWidth = `calc(${LABEL_WIDTH}px + ${colCount} * var(--cycle-width))`;

    container.appendChild(scrollContainer);

    container.addEventListener("scroll", () => {
        requestAnimationFrame(render);
    });
}

function getVisibleRange(scrollTop, height) {
    const start = Math.max(0, Math.floor((scrollTop - HEADER_HEIGHT) / ROW_HEIGHT));
    const end = Math.min(allData.length, start + Math.ceil(height / ROW_HEIGHT) + 5);
    return { start, end };
}

function render() {
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const height = container.clientHeight;
    const width = container.clientWidth;

    const { start, end } = getVisibleRange(scrollTop, height);

    const colCount = maxCycle - minCycle + 1;
    const startCol = Math.max(0, Math.floor((scrollLeft - LABEL_WIDTH) / cycleWidth));
    const endCol = Math.min(colCount, startCol + Math.ceil(width / cycleWidth) + 5);

    scrollContainer.innerHTML = "";
    const totalWidth = `calc(${LABEL_WIDTH}px + ${colCount} * var(--cycle-width))`;

    const header = document.createElement("div");
    header.className = "headerRow";
    header.style.width = totalWidth;

    const empty = document.createElement("div");
    empty.className = "labelCell";
    header.appendChild(empty);

    for (let i = startCol; i < endCol; i++) {
        const c = minCycle + i;
        if (c > maxCycle) break;

        const cell = document.createElement("div");
        cell.className = "cycleCell";
        cell.textContent = c;
        cell.style.left = (LABEL_WIDTH + i * cycleWidth) + "px";
        header.appendChild(cell);
    }
    scrollContainer.appendChild(header);

    for (let i = start; i < end; i++) {
        const inst = allData[i];

        const row = document.createElement("div");
        row.className = "instRow";
        row.style.top = (HEADER_HEIGHT + i * ROW_HEIGHT) + "px";
        row.style.width = totalWidth;
        
        row.style.backgroundColor = (i % 2 === 0) ? "#262c39" : "#222733";

        const textForSearch = `${inst.id} ${inst.text}`.toLowerCase();
        row.dataset.text = textForSearch;

        if (searchQuery && textForSearch.includes(searchQuery)) {
            row.classList.add("highlight");
        }

        const label = document.createElement("div");
        label.className = "labelCell";
        label.textContent = `${i}: s${inst.id} (t${inst.tid}: r${inst.rid}): ${inst.text}`;
        row.appendChild(label);

        for (const s of inst.stageList) {
            const cell = document.createElement("div");
            cell.className = "cycleCell";
            cell.textContent = s.stage;
            
            cell.style.left = (LABEL_WIDTH + (s.cycle - minCycle) * cycleWidth) + "px";

            cell.dataset.stage = s.stage;
            cell.dataset.cycle = s.cycle;
            cell.dataset.instId = inst.id;

            if (s.stage === "F") cell.classList.add("fetch");
            if (s.stage === "X") cell.classList.add("execute");
            if (s.stage === "R") cell.classList.add("retire");

            row.appendChild(cell);
        }

        scrollContainer.appendChild(row);
    }
}