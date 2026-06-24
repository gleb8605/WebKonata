let allData = [];
let cycleWidth = 50;

document
.getElementById("fileInput")
.addEventListener("change", async e => {

    const file = e.target.files[0];

    if(!file)
        return;

    const text = await file.text();

    allData = parseKanata(text);

    console.log(
        "Instructions:",
        allData.length
    );

    draw(allData);

    e.target.value = "";
});

document
.getElementById("searchBox")
.addEventListener("input", e => {

    const query =
        e.target.value
            .trim()
            .toLowerCase();

    document
        .querySelectorAll(".instRow")
        .forEach(row => {

            row.classList.remove(
                "highlight"
            );

            if(query === "")
                return;

            if(
                row.textContent
                    .toLowerCase()
                    .includes(query)
            ){
                row.classList.add(
                    "highlight"
                );
            }
        });
});

function draw(data){

    const viewer =
        document.getElementById("viewer");

    viewer.innerHTML = "";

    const MAX_INSTRUCTIONS = 2000;

    if(data.length > MAX_INSTRUCTIONS){

        console.warn(
            `Showing first ${MAX_INSTRUCTIONS} instructions`
        );

        data =
            data.slice(0, MAX_INSTRUCTIONS);
    }

    let minCycle = Infinity;
    let maxCycle = -Infinity;

    data.forEach(inst => {

        inst.stageList.forEach(s => {

            minCycle =
                Math.min(minCycle, s.cycle);

            maxCycle =
                Math.max(maxCycle, s.cycle);

        });
    });

    document.documentElement.style.setProperty(
        "--cycle-width",
        cycleWidth + "px"
    );

    const MAX_VISIBLE_CYCLES = 300;

    if(maxCycle - minCycle > MAX_VISIBLE_CYCLES){

        maxCycle =
            minCycle + MAX_VISIBLE_CYCLES;
    }

    const header =
        document.createElement("div");

    header.className =
        "headerRow";

    const empty =
        document.createElement("div");

    empty.className =
        "labelCell";

    header.appendChild(empty);

    for(let c=minCycle; c<=maxCycle; c++){

        const cell =
            document.createElement("div");

        cell.className =
            "cycleCell";

        cell.textContent =
            c;

        header.appendChild(cell);
    }

    viewer.appendChild(header);

    data.forEach((inst, index) => {

        const row =
            document.createElement("div");

        row.className =
            "instRow";

        const label =
            document.createElement("div");

        label.className =
            "labelCell";

        label.textContent =
            `${index}: s${inst.id} (t${inst.tid}: r${inst.rid}): ${inst.text}`;

        row.appendChild(label);

        for(let c=minCycle; c<=maxCycle; c++){

            const cell =
                document.createElement("div");

            cell.className =
                "cycleCell";

            const stage =
                inst.stages[c];

            if(stage){

                cell.textContent =
                    stage;

                cell.title =
`Stage: ${stage}
Cycle: ${c}
Instruction: s${inst.id}`;

                if(stage === "F")
                    cell.classList.add("fetch");

                if(stage === "X")
                    cell.classList.add("execute");

                if(stage === "R")
                    cell.classList.add("retire");
            }

            row.appendChild(cell);
        }

        viewer.appendChild(row);
    });
}

document.addEventListener("keydown", e => {

    if(!allData.length)
        return;

    const viewer =
        document.getElementById("viewer");

    if(
        e.key === "+" ||
        e.key === "=" ||
        e.code === "NumpadAdd"
    ){
        cycleWidth += 10;
        draw(allData);
    }

    if(
        e.key === "-" ||
        e.key === "_" ||
        e.code === "NumpadSubtract"
    ){
        cycleWidth =
            Math.max(
                30,
                cycleWidth - 10
            );

        draw(allData);
    }

    if(e.key === "ArrowRight"){
        viewer.scrollLeft += 100;
    }

    if(e.key === "ArrowLeft"){
        viewer.scrollLeft -= 100;
    }
});