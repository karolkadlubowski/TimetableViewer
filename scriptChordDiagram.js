window.addEventListener('message', (event) => {
    console.log("Received message:", event.data);
    if (event.origin !== window.location.origin) {
        return; // Zabezpieczenie przed niezaufanymi źródłami
    }
    const dataset = event.data.dataset;
    if (dataset) {
        createChordDiagram(document, dataset);
    }
});

function createChordDiagram(doc, dataset) {
    // Budowanie macierzy współwystępowania kryteriów
    let { matrix, criteria } = buildMatrix(dataset.data);

    console.log("Matrix:", matrix);
    console.log("Criteria:", criteria);

    // Reszta funkcji bez zmian
    renderChordDiagram(doc, matrix, criteria);

    const legendContainer = doc.createElement('div');
    legendContainer.className = 'legend';
    doc.body.appendChild(legendContainer);

    const color = d3.scaleOrdinal(d3.schemeCategory10); // Użyj tego samego schematu kolorów co dla wykresu

    criteria.forEach((criterion, index) => {
        const legendEntry = doc.createElement('div');
        legendEntry.textContent = criterion;
        legendEntry.style.color = color(index);
        legendContainer.appendChild(legendEntry);
    });
}

function buildMatrix(data) {
    // Pobierz nazwy kryteriów z nagłówków
    const criteria = Object.keys(data[0]).slice(13);
    console.log("Criteria:", criteria);
    const matrixSize = criteria.length;
    let matrix = Array.from({ length: matrixSize }, () => new Array(matrixSize).fill(0));

    // Wypełnij macierz współwystępowania
    data.forEach(row => {
        for (let i = 0; i < matrixSize; i++) {
            for (let j = i; j < matrixSize; j++) { // Zmieniono pętlę, aby nie porównywać dwa razy tego samego
                const valueI = row[criteria[i]];
                const valueJ = row[criteria[j]];
                if (valueI && valueJ && valueI !== "false" && valueJ !== "false") { // Sprawdzenie czy wartości nie są "false" lub fałszywe
                    matrix[i][j]++;
                    if (i !== j) {
                        matrix[j][i]++; // Ponieważ macierz jest symetryczna
                    }
                }
            }
        }
    });

    return { matrix, criteria };
}


function renderChordDiagram(doc, matrix, criteria) {
    const width = 800;
    const height = 800;
    const outerRadius = Math.min(width, height) * 0.5 - 40;
    const innerRadius = outerRadius - 30;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    console.log("Matrix:", matrix);

    // Create the SVG container
    const svg = d3.select(doc.body).append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create the chord layout
    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    // Compute the chord layout
    const chords = chord(matrix);

    // Create the groups (outer arcs)
    const group = svg.append('g')
        .selectAll('g')
        .data(chords.groups)
        .enter()
        .append('g');

    // Draw the outer arcs
    group.append('path')
        .style('fill', d => color(d.index))
        .style('stroke', d => d3.rgb(color(d.index)).darker())
        .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius));

    // Draw the ribbons (inner chords)
    svg.append('g')
        .attr('fill-opacity', 0.67)
        .selectAll('path')
        .data(chords)
        .enter()
        .append('path')
        .attr('d', d3.ribbon().radius(innerRadius))
        .style('fill', d => color(d.source.index))
        .style('stroke', d => d3.rgb(color(d.source.index)).darker());
}