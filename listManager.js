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
        clone.querySelector('.show-chord-button').onclick = () => openDatasetDetailsWindow(dataset);
        clone.querySelector('.remove-button').onclick = () => {
            document.dispatchEvent(new CustomEvent('removeDataset', { detail: dataset.fileName }));
        };
        listContainer.appendChild(clone);
    });
}

function openDatasetDetailsWindow(dataset) {
    const windowName = 'Chord Diagram - ' + dataset.fileName;

    const newWindow = window.open('datasetDetails.html', windowName);
    if (newWindow) {
        newWindow.onload = function() {
            newWindow.postMessage({ dataset: dataset, name: dataset.fileName }, '*');
        };
    } else {
        alert("Pop-up blocked. Please allow pop-ups for this site.");
    }
}