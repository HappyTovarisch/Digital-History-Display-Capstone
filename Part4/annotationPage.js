//Javascript for the annotationPage html doc

/*
*This is the javascript code for annotationPage.html. It has various responsibilities, all of which
*concern populating the annotation page for each person
*It acquires the annotation information that points to each person, and checks to make sure that those annotations are
*the most recent ones. It then displays that information to the screen. Recent changes include a non-functioning add
*annotation button and picture functionality.
*/

const person = {}
person.myURL = window.location.search;
person.params = new URLSearchParams(person.myURL);
person.id = person.params.get('personURL');


async function populatePage()
{

	let fetchedURL = await fetch(person.id);
    let fetched = await fetchedURL.json();
	var header = document.querySelector('header');

	var personName = document.createElement('div');
	console.log(fetched.name);
	personName.textContent=fetched.name;
	header.appendChild(personName);

	let annotationArray = await getAnnotations();
	await getMostRecentAnnotations(annotationArray);

	await showAnnotations();

}

async function getAnnotations() {

	let thisPersonURL = await fetch(person.id);
	let thisPerson = await thisPersonURL.json();

	let data = JSON.stringify({
    		target: person.id,
    	});

	response = await fetch('http://tinydev.rerum.io/app/query', {
    	method: "POST",
    	headers: {
      		"Content_Type": "application/kson; charset=utf-8",
    	},
    	body: data,
  	})
  	responseJSONArray =  await response.json();
  	console.log(response);
  	console.log(responseJSONArray);

  	return responseJSONArray;
}

async function getMostRecentAnnotations(jsonObjArray) {

	//This function accepts the annotations array as argument, then iterates through them using
	//the since API to see if there are more recent versions
  	for (let x=0; x<jsonObjArray.length; x++) {

  		console.log(jsonObjArray[x]);
  		let annotationObject = jsonObjArray[x];
  		let annotationObjectId = annotationObject['@id']; //We use the ID to make the call to since
  		let leafCheckURL = annotationObjectId.replace("/id/", "/since/"); //All we have to do is replace"id" with "since"
  		
  		let leafCheck = await fetch(leafCheckURL);
  		let leafCheckArray = await leafCheck.json(); //This gets the actual array
  		
  		/*
  		if (leafCheckArray.length != 0) { //Checking for more recent annotation version
  			let mostRecentLeaf = leafCheckArray[0]; //get the most recent leaf
  			annotationObject = mostRecentLeaf.json(); //Overwrite the annotationObject with the most recent version
  		}
		*/
  		annotation = annotationObject.body;
  		for (let key in annotation) {
  			person[key] = annotation[key];
  		}
  	}
 }

async function showAnnotations() {

	let buffer = ``;

	for (let thing in person) {
		if (person[thing].value == undefined) {
			buffer+=`<li><a href=#${thing}></a>${thing}: ${person[thing]}</li>`;
		}
		else if (person[thing].value.match(/\.(jpeg|jpg|gif|png)$/) != null) {
			var val = document.getElementById('imagename').value;
    		src = person[thing].value;
    		img = document.createElement('img');

    		img.src = src;
    		document.body.appendChild(img);
		}
		else {
			console.log(thing);
			console.log(person[thing]);
			buffer+=`<li><a href=#${thing}></a>${thing}: ${person[thing].value}</li>`;
		}
	}
	document.getElementById('annotations').innerHTML = buffer;

}

//This function allows us to update annotations and create new ones
async function updateAnnotation() {

  let type = newannotationtype.value;
  let value = newannotationvalue.value;

  if (person[type]) {

    person[type].value = value;

    update = await fetch('http://tinydev.rerum.io/app/update', {
      method: "PUT",
      headers: {
        "Content_Type": "application/kson; charset=utf-8",
      },
      body: JSON.stringify(person),
    })

    let updatedPerson = update.json();

  }

  else {

    person[type].value = value;

    response = await fetch('http://tinydev.rerum.io/app/create', {
      method: "POST",
      headers: {
        "Content_Type": "application/kson; charset=utf-8",
      },
      body: JSON.stringify(person[type]),
    })

  let newJSON = await response.json();



  }

}

populatePage();