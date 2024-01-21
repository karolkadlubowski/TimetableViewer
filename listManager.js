function updateCriteriaList(criteria) {
    const listContainer = document.getElementById('criteria-list');
    listContainer.innerHTML = '<h3>Added Criteria</h3>';
    criteria.forEach(criterion => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.textContent = criterion.name;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-button';
        removeBtn.textContent = 'X';
        removeBtn.onclick = () => {
            // Emit an event to remove the criterion
            document.dispatchEvent(new CustomEvent('removeCriterion', { detail: criterion.name }));
        };
        item.appendChild(removeBtn);
        listContainer.appendChild(item);
    });
}

function updateDatasetList(datasets) {
    const listContainer = document.getElementById('datasets-list');
    listContainer.innerHTML = '<h3>Added Datasets</h3>';
    datasets.forEach(dataset => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.textContent = dataset.fileName;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-button';
        removeBtn.textContent = 'X';
        removeBtn.onclick = () => {
            // Emit an event to remove the dataset
            document.dispatchEvent(new CustomEvent('removeDataset', { detail: dataset.fileName }));
        };
        item.appendChild(removeBtn);
        listContainer.appendChild(item);
    });
}

// Eksport funkcji, jeśli używasz modułów
export { updateCriteriaList, updateDatasetList };