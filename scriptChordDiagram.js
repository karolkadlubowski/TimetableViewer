window.addEventListener('message', (event) => {
    console.log("Received message:", event.data);
    if (event.origin !== window.location.origin) {
        return; // Safety against untrusted origins
    }
    const data = event.data;
    if (data.dataset) {
        console.log("Dataset:", data.dataset.name);
        createChordDiagram(document, data.dataset);
        // Update the title with the dataset name
        if (data.name) {
            document.getElementById('chart-title').textContent = 'Relations between criterias: ' + data.name;
        }
    }
});

function createChordDiagram(doc, dataset) {
    let { matrix, criteria } = buildMatrix(dataset.data);

    renderChordDiagram(doc.getElementById('chart'), matrix, criteria);

    const legendContainer = doc.getElementById('legend');
    legendContainer.className = 'legend';
    
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    criteria.forEach((criterion, index) => {
        const legendEntry = doc.createElement('div');
        legendEntry.textContent = criterion;
        legendEntry.style.color = color(index);
        legendContainer.appendChild(legendEntry);
    });
}


function buildMatrix(data) {
    const criteria = Object.keys(data[0]).slice(13);
    console.log("Criteria:", criteria);
    const matrixSize = criteria.length;
    let matrix = Array.from({ length: matrixSize }, () => new Array(matrixSize).fill(0));

    data.forEach(row => {
        for (let i = 0; i < matrixSize; i++) {
            for (let j = i; j < matrixSize; j++) {
                const valueI = row[criteria[i]];
                const valueJ = row[criteria[j]];
                if (valueI && valueJ && valueI !== "false" && valueJ !== "false") {
                    matrix[i][j]++;
                    if (i !== j) {
                        matrix[j][i]++;
                    }
                }
            }
        }
    });

    return { matrix, criteria };
}


function renderChordDiagram(targetElement, matrix) {
    const width = 800;
    const height = 800;
    const outerRadius = Math.min(width, height) * 0.5 - 40;
    const innerRadius = outerRadius - 30;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Append the SVG to the target element instead of the document body
    const svg = d3.select(targetElement).append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    const chords = chord(matrix);

    const group = svg.append('g')
        .selectAll('g')
        .data(chords.groups)
        .enter()
        .append('g');

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