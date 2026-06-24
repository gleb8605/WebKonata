function parseKanata(text){

    const lines = text.split(/\r?\n/);

    const instructions = {};

    let currentCycle = 0;

    for(const line of lines){

        if(!line.trim())
            continue;

        const p = line.trim().split(/\s+/);

        if(p[0] === "C="){
            currentCycle = Number(p[1]);
            continue;
        }

        if(p[0] === "C"){
            currentCycle += Number(p[1] || 0);
            continue;
        }

        if(p[0] === "I"){

            instructions[p[1]] = {
                id: p[1],
                rid: p[2],
                tid: p[3],
                text: "",

                // быстрый доступ по циклу
                stages: {},

                // нужен для подсчета min/max циклов
                stageList: []
            };
        }

        if(p[0] === "L" && instructions[p[1]]){

            instructions[p[1]].text =
                p.slice(3).join(" ");
        }

        if(p[0] === "S" && instructions[p[1]]){

            instructions[p[1]].stages[currentCycle] =
                p[3];

            instructions[p[1]].stageList.push({
                cycle: currentCycle,
                stage: p[3]
            });
        }
    }

    return Object.values(instructions);
}