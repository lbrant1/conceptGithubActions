const api = 'https://raw.githubusercontent.com/episphere/conceptGithubActions/master/jsons/';

window.onload = async () => {
    const response = await fetch(`${api}varToConcept.json`)
    const concepts = await response.json();
    const sortedConcepts = sortKeys(concepts);
    renderConcepts(sortedConcepts);
    addEventSearchConcepts(sortedConcepts);
    manageScroll();
}

window.onhashchange = () => {
    manageScroll();
}

const sortKeys = (obj) => {
    return Object.assign(...Object.entries(obj).sort().map(([key, value]) => {
        return {
            [key]: value
        }
    }));
};

const manageScroll = () => {	
    const hash = location.hash;	
    if(!hash) return;	
    const element = document.getElementById(hash.replace('#', 'heading'));	
    element.scrollIntoView();	
}

const renderConcepts = (concepts) => {
    let template = ``

    template += '<div class="accordion" id="accordionExample">';
    for(let key in concepts) {
        const conceptId = concepts[key].replace('<b>', '').replace('</b>', '');
        template += `
        <div class="card">
            <div class="card-header" id="heading${conceptId}">
                <a class="btn btn-link collapsable-btn" href="#${conceptId}" role="button" data-toggle="collapse" data-target="#${conceptId}" aria-expanded="true" aria-controls="${conceptId}">
                    <div class="row">
                        <div class="col">${concepts[key]}</div>
                        <div class="ml-auto">${key}</div>
                    </div>
                </a>
            </div>
            <div id="${conceptId}" class="collapse" aria-labelledby="heading${conceptId}" data-parent="#accordionExample">
                <div class="card-body"></div>
            </div>
        </div>
        `
    }
    template += '</div>'
    document.getElementById('conceptsDiv').innerHTML = template;
    addEventTriggerCollapse();
}

const addEventTriggerCollapse = () => {
    const btns = document.getElementsByClassName('collapsable-btn');
    Array.from(btns).forEach(btn => {
        btn.addEventListener('click', async () => {
            const element = btn.parentNode.nextElementSibling;
            if(element.classList.contains('show')) element.classList.remove('show');
            else {
                let template = '';
                const cardBody = element.querySelectorAll('[class="card-body"]')[0];
                const response = await fetch(`${api}${element.id}.json`)
                const data = await response.json();
                for(let key in data) {
                    template += `<div><strong>${key}: </strong>&nbsp;`
                    if(typeof data[key] === 'object') {
                        template += `<p>`
                        if(Array.isArray(data[key])){
                            for(let obj of data[key]){
                                template += /.json/.test(obj) ? `<a href="#${obj.replace('.json', '')}">${obj}<a></br>`:`${obj}`
                            }
                        }
                        else {
                            for(let obj in data[key]){
                                template += /.json/.test(obj) ? `<a href="#${obj.replace('.json', '')}">${obj}<a>: ${data[key][obj]}</br>`:`${obj}: ${data[key][obj]}`
                            }
                        }
                        template += `</p>`
                    }
                    else {
                        const url = /https:/i.test(data[key]);
                        template += `${url ? `<a href="${data[key]}" target="_blank">${data[key]}<a>` : key === 'Primary Source' || key === 'Secondary Source'?`<a href="#${data[key].replace('.json', '')}">${data[key]}<a>`:`${data[key]}`}</div>`;
                    }
                }
                cardBody.innerHTML = template;
                element.classList.add('show');
            }
        })
    })
}

const addEventSearchConcepts = (data) => {
    const input = document.getElementById('searchConcepts');
    input.addEventListener('keyup', () => {
        handleEvent(data);
    });
};

const handleEvent = data => {
    const input = document.getElementById('searchConcepts');
    const value = input.value.trim();
    if(!value || value.length < 2) {
        renderConcepts(data);
    }
    else {
        let obj = {};
        const localData = data;
        const values = Object.values(localData).filter(dt => new RegExp(value, 'i').test(dt) === true);
        const keys = Object.keys(localData).filter(dt => new RegExp(value, 'i').test(dt) === true);
        
        values.forEach(v => {
            const index = Object.values(localData).indexOf(v);
            const key = Object.keys(localData)[index];
            if(obj[key] === undefined) obj[key] = v.replace(new RegExp(value, 'ig'), '<b>$&</b>');
        });

        keys.forEach(k => {
            const index = Object.keys(localData).indexOf(k);
            const value = Object.values(localData)[index];
            if(obj[k] === undefined) obj[k] = value;
        });

        renderConcepts(obj);
    }
}