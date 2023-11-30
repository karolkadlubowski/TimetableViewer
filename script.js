let datasets = [];
let conditions = []; // List to store all conditions

document.getElementById('load-dataset').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        let newDataset = parseCSV(text);

        // Apply all conditions to the new dataset
        conditions.forEach(condition => {
            newDataset.forEach(row => {
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
    let conditionName = document.getElementById('criterion-name').value;
    let formula = document.getElementById('criterion-condition').value;

    // Add the new condition to the conditions list
    conditions.push({ name: conditionName, formula: formula });

    // Apply all conditions to each dataset
    datasets.forEach(dataset => {
        dataset.forEach(row => {
            conditions.forEach(condition => {
                try {
                    row[condition.name] = eval(condition.formula);
                } catch (error) {
                    console.error('Error evaluating formula for', condition.name, error);
                }
            });
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

    let datasetColors = ['blue', 'red', 'green', 'orange', 'purple']; // Assign colors for each dataset

    conditions.forEach((condition, conditionIndex) => {
        let barsForCondition = datasets.map((dataset, datasetIndex) => {
            let totalClasses = dataset.length;
            let conditionCount = dataset.filter(row => row[condition.name]).length;
            let percentage = (conditionCount / totalClasses) * 100;

            return {
                x: [condition.name], // Use condition names as x-axis values
                y: [percentage],
                type: 'bar',
                name: `Dataset ${datasetIndex + 1}`,
                marker: {
                    color: datasetColors[datasetIndex % datasetColors.length]
                },
                text: [`${percentage.toFixed(2)}%`],
                textposition: 'auto',
                showlegend: conditionIndex === 0 // Show legend only for the first condition
            };
        });

        plotData.push(...barsForCondition);
    });

    // Plot the data using Plotly
    Plotly.newPlot('plot', plotData, layout);
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

// After adding the event listener for 'load-dataset' and 'add-condition'

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
    let dimensions = conditions.map(condition => {
        return {
            label: condition.name,
            values: datasets.map(dataset => {
                return dataset.filter(row => row[condition.name]).length / dataset.length * 100;
            })
        };
    });

    let parallelData = [{
        type: 'parcoords',
        pad: [80,80,80,80],
        line: {
            color: 'blue'
        },
        dimensions: dimensions
    }];

    let layout = {
        title: 'Parallel Coordinates Analysis'
    };

    Plotly.newPlot('plot', parallelData, layout);
}

// new// ... Your existing code ...

function addNewCondition() {
    let conditionName = document.getElementById('criterion-name').value;
    let formula = document.getElementById('criterion-condition').value;

    // Add the new condition to the conditions list
    conditions.push({ name: conditionName, formula: formula });

    // Apply all conditions to each dataset
    datasets.forEach(dataset => {
        dataset.forEach(row => {
            conditions.forEach(condition => {
                try {
                    row[condition.name] = eval(condition.formula);
                } catch (error) {
                    console.error('Error evaluating formula for', condition.name, error);
                }
            });
        });
    });

    updatePlot();
}

function deleteLastDataset() {
    // Remove the last dataset from the datasets array
    if (datasets.length > 0) {
        datasets.pop();
        displayDatasetList();
        updatePlot();
    }
}

function displayDatasetList() {
    const datasetListContainer = document.getElementById('dataset-list');
    datasetListContainer.innerHTML = '';

    datasets.forEach((dataset, index) => {
        const datasetItem = document.createElement('div');
        datasetItem.className = 'dataset-item';

        const datasetName = document.createElement('span');
        datasetName.textContent = `File: ${dataset.fileName}`; // Display the file name

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            deleteDataset(index);
        });

        datasetItem.appendChild(datasetName);
        datasetItem.appendChild(deleteButton);

        datasetListContainer.appendChild(datasetItem);
    });
}

function deleteDataset(index) {
    datasets.splice(index, 1);
    displayDatasetList();
    updatePlot();
}
