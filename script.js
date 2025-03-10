import { updateCriteriaList, updateDatasetList } from './listManager.js';

let datasets = [];
let conditions = [];

document.getElementById('load-dataset').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        let newDataset = {
            data: parseCSV(text),
            fileName: file.name.split('.')[0],
            color: generateColor(datasets.length)
        };

        // Apply all conditions to the new dataset
        conditions.forEach(condition => {
            newDataset.data.forEach(row => {
                try {
                    row[condition.name] = eval(condition.formula);
                } catch (error) {
                    console.error('Error evaluating formula for', condition.name, error);
                    row[condition.name] = false;
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
        return;
    }

    // Check if a condition with the same name already exists
    let conditionExists = conditions.some(condition => condition.name === conditionName);
    if (conditionExists) {
        alert("A condition with this name already exists. Please use a different name.");
        return;
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
        bargap: 0.05, // Reduce the gap between bars of different groups
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
                showlegend: conditionIndex === 0
            };
        });

        plotData.push(...barsForCondition);
    });

    Plotly.newPlot('plot', plotData, layout)
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

    updateCriteriaList(conditions);
    updateDatasetList(datasets);
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
            }
        });

        yAxisPosition += 1; // Increment Y-axis position for the next dimension
    });

    let layout = {
        title: 'Parallel Coordinates Analysis',
        xaxis: {
            tickvals: conditions.map((_, index) => index + 1),
            ticktext: conditions.map(condition => condition.name),
            tickangle: -45
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

document.addEventListener('removeCriterion', (event) => {
    removeCriterion(event.detail);
});

document.addEventListener('removeDataset', (event) => {
    removeDataset(event.detail);
});

function removeCriterion(name) {
    conditions = conditions.filter(condition => condition.name !== name);
    updatePlot();
}

function removeDataset(name) {
    datasets = datasets.filter(dataset => dataset.fileName !== name);
    updatePlot();
}