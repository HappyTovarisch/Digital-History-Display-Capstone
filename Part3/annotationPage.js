//Javascript for the annotationPage html doc

const person = {}
person.myURL = window.location.search;
person.params = new URLSearchParams(person.myURL);
person.id = person.params.get('a');

async function getName() {

	let fetchedURL = await fetch(person.id);
    let fetched = await fetchedURL.json();
    let myName = fetched.name;

    document.getElementById('name').innerHTML = myName;
}

getName();