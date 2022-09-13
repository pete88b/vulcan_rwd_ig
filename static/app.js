const data = {
	"source_language": "de",
	"target_language": "en",
	"model_checkpoint": "Helsinki-NLP/opus-mt-de-en",
	"translation_history": [
	],
	"translations": [
	]
};

function displayData(data) {
	const dataContainer = document.getElementById('data-container');
    const searchPubMedTitle = 'Search PubMed for this term (select some text to search for part of the term)';
	var innerHTML = '';
	data.translations.forEach((element, index) => {
		const translation = element[element.length - 1];
		// TODO: trim header text to max length - see: patient has really bad headaches with visual disturbance (wild hallucinations sometimes) and at least 2 extra toes
		innerHTML += `
			<hr>
			<div>
				<span class="header" onclick="translationHeaderClick(${index})" id="translation-header-${index}">
					${translation.source_text}
					<br>
					${translation.target_text}&nbsp;
				</span>
				<a onclick="toggleTranslationStatus(${index})"
					class="toggleTranslationStatusLink"
					title="${getToggleTranslationStatusTitle(translation.translation_status)}"
					id="translation-status-link-${index}">${translation.translation_status}</a>
			</div>
			<div class="translation-content" id="translation-content-${index}" style="display: none;"> 
				<div>
					<textarea id="source-textarea-${index}" 
						onchange="sourceTextChanged(${index})">${translation.source_text}</textarea>
					<a onclick="searchPubMed('source', ${index})" title="${searchPubMedTitle}">PubMed</a>
					<a onclick="searchWikipedia('source', ${index})" title="Search Wikipedia for this term">Wikipedia</a>
				</div>
				<div>
					<textarea id="target-textarea-${index}"
						onchange="targetTextChanged(${index})">${translation.target_text}</textarea>
					<a onclick="searchPubMed('target', ${index})" title="${searchPubMedTitle}">PubMed</a>
					<a onclick="searchWikipedia('target', ${index})" title="Search Wikipedia for this term">Wikipedia</a>
				</div>
			</div>`;
	});
	dataContainer.innerHTML = innerHTML;
}

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}
  
function highlight(e) {
    dropArea.classList.add('highlight');
}
  
function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

function addTermsFromFile(text) {
    text.split("\n").forEach(t => {
        data.translations.push([{
                    "source_text": t.trim(),
                    "target_text": '', // we can set value here too
                    "translation_status": 'Not Confirmed',
                    "action_type": "source upload by user",
                    "action_date": new Date().toISOString(),
                    "action_user": "???"
                }]);
    });
    displayData(data);
}

function handleDrop(e) {
    const files = e.dataTransfer.files
    // TODO: if not 1 file -> reject
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        addTermsFromFile(event.target.result);
    };
    reader.readAsText(file);
}

const dropArea = document.getElementsByTagName('body')[0];
function addListener(eventNames, fn) {
    eventNames.forEach(name => dropArea.addEventListener(name, fn, false))
}
addListener(['dragenter', 'dragover', 'dragleave', 'drop'], preventDefaults);
addListener(['dragenter', 'dragover'], highlight);
addListener(['dragleave', 'drop'], unhighlight);
addListener(['drop'], handleDrop);

function translate() {
	$("#loading-overlay").show();
	xhr = new XMLHttpRequest();
    xhr.open('POST', '/translate/', true);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            // TODO: check HTTP status
            response = JSON.parse(xhr.responseText);
            data.translations.forEach((element, index) => {
				var translationHistory = element; // DRY - this is target text changed
				var translation = JSON.parse(JSON.stringify(translationHistory[translationHistory.length - 1]));
				new_target_text = response[translation.source_text];
				if (new_target_text !== undefined && new_target_text != translation.target_text) {
					translation.translation_status = 'Not Confirmed';
					translation.target_text = new_target_text;
					translation.action_type = 'target text updated by auto-translation';
					translation.action_date = new Date().toISOString();
					translationHistory.push(translation);
				}
			});
			displayData(data);
			$("#loading-overlay").hide();
        }
    };
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader('x-api-key', 'test');
    xhr.send(JSON.stringify({
        source_language: document.getElementById('source_language').value,
        target_language: document.getElementById('target_language').value,
		source_texts: data.translations.map(e => e[e.length - 1].source_text)
    }));
}
document.getElementById('translate').onclick = translate;

function translationHeaderClick(index) {
	$(`#translation-header-${index}`).toggleClass("open");
	var content = $(`#translation-content-${index}`);
	content.toggle(200)
}

function searchPubMed(what, index) {
	var e = document.getElementById(`${what}-textarea-${index}`);
	searchText = e.value.substring(e.selectionStart, e.selectionEnd);
	if (!!!searchText) {
		searchText = e.value;
	}
	// window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${searchText}&ac=no`, '_blank');
	window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${searchText}`, '_blank');
	// TODO: do better (o:
}

function searchWikipedia(what, index) { // TODO: DRY
	var e = document.getElementById(`${what}-textarea-${index}`);
	searchText = e.value.substring(e.selectionStart, e.selectionEnd);
	if (!!!searchText) {
		searchText = e.value;
	}
	language = document.getElementById(`${what}_language`).value;
	window.open(`https://${language}.wikipedia.org/w/index.php?search=${searchText}`, '_blank');
	// TODO: do better (o:
}

function getToggleTranslationStatusTitle(status) {
	if ('Confirmed' == status) {
		return 'Click to set the status of this translation back to "Not Confirmed"'; 
	} else {
		return 'Click to confirm this translation is good';
	}
}

function toggleTranslationStatus(index) {
	link = document.getElementById(`translation-status-link-${index}`);
	link.innerHTML = 'Confirmed' == link.innerHTML ? 'Not Confirmed' : 'Confirmed';
	link.title = getToggleTranslationStatusTitle(link.innerHTML);
	var translationHistory = data.translations[index];
	var translation = JSON.parse(JSON.stringify(translationHistory[translationHistory.length - 1]));
	translation.translation_status = link.innerHTML;
	translation.action_type = 'status updated by user';
	translation.action_date = new Date().toISOString();
	translationHistory.push(translation);
}

function sourceTextChanged(index) {
	document.getElementById(`target-textarea-${index}`).value = '';
	link = document.getElementById(`translation-status-link-${index}`);
	link.innerHTML = 'Not Confirmed';
	link.title = getToggleTranslationStatusTitle(link.innerHTML);
	var translationHistory = data.translations[index];
	var translation = JSON.parse(JSON.stringify(translationHistory[translationHistory.length - 1]));
	translation.translation_status = link.innerHTML;
	translation.source_text = document.getElementById(`source-textarea-${index}`).value;
	translation.target_text = '';
	translation.action_type = 'source text updated by user';
	translation.action_date = new Date().toISOString();
	translationHistory.push(translation);
	document.getElementById(`translation-header-${index}`).innerHTML = `${translation.source_text}<br>${translation.target_text}&nbsp;`;
}

function targetTextChanged(index) {
	link = document.getElementById(`translation-status-link-${index}`);
	link.innerHTML = 'Not Confirmed';
	link.title = getToggleTranslationStatusTitle(link.innerHTML);
	var translationHistory = data.translations[index];
	var translation = JSON.parse(JSON.stringify(translationHistory[translationHistory.length - 1]));
	translation.translation_status = link.innerHTML;
	translation.target_text = document.getElementById(`target-textarea-${index}`).value;
	translation.action_type = 'target text updated by user';
	translation.action_date = new Date().toISOString();
	translationHistory.push(translation);
	document.getElementById(`translation-header-${index}`).innerHTML = `${translation.source_text}<br>${translation.target_text}&nbsp;`;
}