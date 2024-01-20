let datasets = [];
let conditions = []; // List to store all conditions

document.getElementById('load-dataset').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        let newDataset = {
            data: parseCSV(text),
            fileName: file.name.split('.')[0], // Store the file name without extension
            color: generateColor(datasets.length) // Assign generated color to dataset
        };

        // Apply all conditions to the new dataset
        conditions.forEach(condition => {
            newDataset.data.forEach(row => { // Corrected to newDataset.data
                try {
                    row[condition.name] = eval(condition.formula);
                } catch (error) {
                    console.error('Error evaluating formula for', condition.name, error);
                }
            });
        });

        datasets.push(newDataset);
        updatePlot();
    };
    reader.readAsText(file);
});

document.getElementById('add-condition').addEventListener('click', addNewCondition);

function addNewCondition() {
    let conditionName = document.getElementById('criterion-name').value.trim();
    let formula = document.getElementById('criterion-condition').value.trim();

    if (!conditionName) {
        alert("The criterion name cannot be empty. Please enter a name.");
        return; // Exit the function without adding the new condition
    }

    // Check if a condition with the same name already exists
    let conditionExists = conditions.some(condition => condition.name === conditionName);
    if (conditionExists) {
        alert("A condition with this name already exists. Please use a different name.");
        return; // Exit the function without adding the new condition
    }

    // Add the new condition to the conditions list
    conditions.push({ name: conditionName, formula: formula });

    // Apply the newly added condition to each dataset
    datasets.forEach(datasetObject => {
        datasetObject.data.forEach(row => {
            try {
                // Only apply the new condition's formula
                row[conditionName] = eval(formula.replace(/row/g, 'row'));
            } catch (error) {
                console.error('Error evaluating formula for', conditionName, error);
            }
        });
    });

    updatePlot();
}




function updateBarPlot() {
    let plotData = [];
    let layout = {
        title: 'Conditions Analysis',
        barmode: 'group',
        xaxis: {
            tickangle: -45
        },
        yaxis: {
            range: [0, 100] // Setting y-axis range from 0 to 100
        },
        margin: {
            b: 100 // Gives more space for x-axis labels
        },
        bargap: 0.05, // Further reduce the gap between bars of different groups
        bargroupgap: 0.02 // Reduce the gap between bars within a group
    };

    conditions.forEach((condition, conditionIndex) => {
        let barsForCondition = datasets.map((datasetObject, datasetIndex) => {
            let totalClasses = datasetObject.data.length;
            let conditionCount = datasetObject.data.filter(row => row[condition.name]).length;
            let percentage = (conditionCount / totalClasses) * 100;

            return {
                x: [condition.name], // Use condition names as x-axis values
                y: [percentage],
                type: 'bar',
                name: datasetObject.fileName,
                marker: {
                    color: datasetObject.color // Use assigned color
                },
                text: [`${percentage.toFixed(2)}%`],
                textposition: 'auto',
                showlegend: conditionIndex === 0 // Show legend only for the first condition
            };
        });

        plotData.push(...barsForCondition);
    });

    Plotly.newPlot('plot', plotData, layout).then(() => {
        document.getElementById('plot').on('plotly_click', function(data) {
            if (data.points && data.points[0]) {
                const clickedCriterionName = data.points[0].x;
                const clickedDataset = datasets.find(d => d.fileName === data.points[0].data.name);
                if (clickedDataset) {
                    handleDatasetSelection(clickedDataset, clickedCriterionName);
                }
            }
        });
    });
}

function handleDatasetSelection(dataset, criterionName) {
    console.log("Selected dataset set to:", dataset);
    openChordDiagramWindow(dataset, criterionName);
}



function parseCSV(csvText) {
    let lines = csvText.split('\n');
    let headers = lines[0].split(';'); // Split headers using semicolons
    let data = [];

    for (let i = 1; i < lines.length; i++) {
        let row = {};
        let currentLine = lines[i].split(';'); // Split each line using semicolons

        headers.forEach((header, j) => {
            row[header] = currentLine[j];
        });

        data.push(row);
    }

    return data;
}


document.getElementById('plot-type').addEventListener('change', function() {
    updatePlot();
});

// Modify the updatePlot function
function updatePlot() {
    const plotType = document.getElementById('plot-type').value;
    if (plotType === 'bar') {
        updateBarPlot();
    } else if (plotType === 'parallel') {
        updateParallelCoordinatesPlot();
    }
}

function updateParallelCoordinatesPlot() {
    let plotData = []; // Array to hold scatter plot data
    let yAxisPosition = 1; // Initial Y-axis position for each dimension

    datasets.forEach((dataset, datasetIndex) => {
        let xValues = []; // X values for scatter plot
        let yValues = []; // Y values for scatter plot

        conditions.forEach((condition, conditionIndex) => {
            // Calculate the value for this condition for each dataset
            let conditionValue = dataset.data.map(row => row[condition.name] ? 100 : 0).reduce((a, b) => a + b, 0) / dataset.data.length;
            xValues.push(conditionIndex + 1); // X-value is the position of the condition
            yValues.push(conditionValue); // Y-value is the calculated condition value
        });

        plotData.push({
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines',
            name: dataset.fileName,
            line: {
                color: dataset.color,
                width: 2
            },
            // Here we add the click event
            onclick: function() {
                handleDatasetSelection(dataset);
            }
        });

        yAxisPosition += 1; // Increment Y-axis position for the next dimension
    });

    let layout = {
        title: 'Parallel Coordinates Analysis (Workaround)',
        xaxis: {
            tickvals: conditions.map((_, index) => index + 1),
            ticktext: conditions.map(condition => condition.name),
        },
        yaxis: {
            range: [0, 100]
        }
    };

    Plotly.newPlot('plot', plotData, layout);
}

function generateColor(index) {
    // Simple approach to generate a color
    let hue = index * 137.508; // Use golden angle approximation for even distribution
    return `hsl(${hue % 360}, 50%, 60%)`; // HSL: Hue, Saturation, Lightness
}

function openChordDiagramWindow(dataset, criterionName) {
    const newWindow = window.open('chordDiagram.html', 'Chord Diagram', 'width=800,height=1300');    if (newWindow) {
        newWindow.document.write(`
        <html>
        <head>
            <title>Chord Diagram - ${criterionName}</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .legend { margin-top: 20px; }
                .legend-color-box { display: inline-block; width: 12px; height: 12px; margin-right: 5px; }
            </style>
        </head>
        <body>
            <h1>Relations between criterias</h1>
            <div id="chart"></div>
        </body>
        </html>
    `);
    newWindow.document.close(); // Zakończ pisanie do dokumentu
    createChordDiagram(newWindow.document, dataset);
    } else {
        alert("Pop-up blocked. Please allow pop-ups for this site.");
        console.log("Pop-up blocked. Please allow pop-ups for this site.");
    }
}




function createChordDiagram(doc, dataset) {
    // Budowanie macierzy współwystępowania kryteriów
    let { matrix, criteria } = buildMatrix(dataset.data);

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