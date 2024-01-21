export { updateCriteriaList, updateDatasetList };

function updateCriteriaList(criteria) {
    const listContainer = document.getElementById('criteria-list');
    const template = document.getElementById('criterion-item-template').content;
    listContainer.innerHTML = '<h3>Added Criteria</h3>';

    criteria.forEach(criterion => {
        const clone = document.importNode(template, true);
        clone.querySelector('.criterion-name').textContent = criterion.name;
        clone.querySelector('.remove-button').onclick = () => {
            document.dispatchEvent(new CustomEvent('removeCriterion', { detail: criterion.name }));
        };
        listContainer.appendChild(clone);
    });
}

function updateDatasetList(datasets) {
    const listContainer = document.getElementById('datasets-list');
    const template = document.getElementById('dataset-item-template').content;
    listContainer.innerHTML = '<h3>Added Datasets</h3>';

    datasets.forEach(dataset => {
        const clone = document.importNode(template, true);
        clone.querySelector('.dataset-name').textContent = dataset.fileName;
        clone.querySelector('.show-chord-button').onclick = () => openChordDiagramWindow(dataset);
        clone.querySelector('.remove-button').onclick = () => {
            document.dispatchEvent(new CustomEvent('removeDataset', { detail: dataset.fileName }));
        };
        listContainer.appendChild(clone);
    });
}

function openChordDiagramWindow(dataset) {
    // Use dataset's fileName or a unique identifier as part of the window name
    const windowName = 'Chord Diagram - ' + dataset.fileName;

    const newWindow = window.open('chordDiagram.html', windowName, 'width=1100,height=900');
    if (newWindow) {
        newWindow.onload = function() {
            // Include the dataset's fileName in the message
            newWindow.postMessage({ dataset: dataset, name: dataset.fileName }, '*');
        };
    } else {
        alert("Pop-up blocked. Please allow pop-ups for this site.");
    }
}