window.addEventListener('message', (event) => {
    console.log("Received message:", event.data);
    if (event.origin !== window.location.origin) {
        return; // Safety against untrusted origins
    }
    const data = event.data;
    if (data.dataset) {
        console.log("Dataset:", data.dataset.name);
        createChordDiagram(document, data.dataset);
        createHeatmap(document, data.dataset); // Dodajemy wywołanie funkcji tworzącej mapę cieplną
        // Update the title with the dataset name
        if (data.name) {
            document.getElementById('chart-title').textContent = 'Relations between criterias and rush hour heatmap: ' + data.name;
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
    const width = 500;
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

// DO NOWEGO PLIKU

function prepareHeatmapData(data) {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]; // Dni tygodnia po portugalsku
    const hours = Array.from({ length: 24 }, (_, i) => i); // Godziny od 0 do 23

    let heatmapData = new Array(days.length);
    for (let i = 0; i < days.length; i++) {
        heatmapData[i] = new Array(hours.length).fill(0);
    }

    console.log(data)

    data.forEach(row => {
        const dayIndex = days.indexOf(row["Day of the week"]);
        let startHour = new Date('1970/01/01 ' + row.Start)?.getHours();
        let endHour = new Date('1970/01/01 ' + row.End)?.getHours();

        if (dayIndex >= 0 && startHour >= 0 && endHour >= 0) {
            for (let hour = startHour; hour <= endHour; hour++) {
                heatmapData[dayIndex][hour]++;
            }
        }
    });

    return heatmapData;
}

function drawHeatmap(data) {
    // Adjusted margins to accommodate axes labels
    const margin = { top: 50, right: 30, bottom: 50, left: 60 };
    const width = 900 - margin.left - margin.right; // Adjusted width
    const height = 500 - margin.top - margin.bottom; // Adjusted height

    // Append the SVG object to the body of the page
    const svg = d3.select('.chart-container').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    // Reverse the domain of the yScale to have hours in ascending order from top to bottom
    const yScale = d3.scaleBand()
        .domain(hours.reverse())
        .range([0, height])
        .padding(0.01);

    const xScale = d3.scaleBand()
        .domain(days)
        .range([0, width])
        .padding(0.01);

    const colorScale = d3.scaleSequential(d3.interpolateWarm)
        .domain([0, d3.max(data.flat())]);

    // Rotate the chart by swapping the axis and their position
    svg.append('g')
        .call(d3.axisTop(xScale).tickSize(0))
        .selectAll('text')
        .style('text-anchor', 'start');

    svg.append('g')
        .call(d3.axisLeft(yScale).tickSize(0))
        .selectAll('text')
        .attr('transform', 'translate(-10,0)')
        .style('text-anchor', 'end');

    svg.selectAll()
        .data(data.flat())
        .enter()
        .append('rect')
        .attr('x', (d, i) => xScale(days[i % days.length]))
        .attr('y', (d, i) => yScale(hours[Math.floor(i / days.length)]))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .style('fill', d => colorScale(d));

    // Color legend
    const legendWidth = 100;
    const legendHeight = 10;

    const legendSvg = d3.select('.chart-container').append('svg')
        .attr('width', legendWidth)
        .attr('height', height + margin.top + margin.bottom);

    const defs = legendSvg.append('defs');
    const linearGradient = defs.append('linearGradient')
        .attr('id', 'linear-gradient');

    linearGradient.selectAll('stop')
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

    legendSvg.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#linear-gradient)');

}



function createHeatmap(doc, dataset) {
    let heatmapData = prepareHeatmapData(dataset.data);
    console.log("Heatmap data:", heatmapData);
    drawHeatmap(heatmapData);
}