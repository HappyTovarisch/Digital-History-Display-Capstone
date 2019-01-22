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
	personName.textContent=fetched.name;
	header.appendChild(personName);

	let annotationArray = await getAnnotations();
	await getMostRecentAnnotations(annotationArray);

	await showAnnotations();

}

async function getAnnotations() {

	let data = JSON.stringify({
    		target: person.id,
    	});

	response = await fetch('http://tinydev.rerum.io/app/query', {
    	method: "POST",
    	headers: {
      		"Content_Type": "application/json; charset=utf-8",
    	},
    	body: data,
  	})
  	responseJSONArray =  await response.json();

  	return responseJSONArray;
}

async function getMostRecentAnnotations(jsonObjArray) {

	//This function accepts the annotations array as argument, then iterates through them using
	//the since API to see if there are more recent versions
  	for (let x=0; x<jsonObjArray.length; x++) {

  		let annotationObject = jsonObjArray[x];
  		let annotationObjectId = annotationObject['@id']; //We use the ID to make the call to since
  		let leafCheckURL = annotationObjectId.replace("/id/", "/since/"); //All we have to do is replace"id" with "since"
  		
  		let leafCheck = await fetch(leafCheckURL);
  		let leafCheckArray = await leafCheck.json(); //This gets the actual array
  		
  		if (leafCheckArray.length != 0) { //Checking for more recent annotation version //get the most recent leaf
  			annotationObject = await getLeftMostLeaf(leafCheckArray); //Overwrite the annotationObject with the most recent version
  		}

  		annotation = annotationObject.body;
      let annotationID = annotationObject['@id'];

  		for (let key in annotation) {
  			person[key] = annotation[key];
        	person[key]['@id'] = annotationID;
  		}
  	}
 }

//Go through the left-most leafs, check to see if there is anything in next, return the JSON object
//of the most recent annotation
async function getLeftMostLeaf(leafCheckArray) { //LeafCheckArray must be a since array - in this case it is

  let mostRecentLeaf = {}

  //First time you come upon an empty next is your leftmost leaf
  for (annot in leafCheckArray) {
  	if (leafCheckArray[annot].__rerum.history.next.length == 0) {
 		mostRecentLeaf = leafCheckArray[annot];
 		break;
  	}

  }

  return mostRecentLeaf;
}

async function showAnnotations() {

	for (let thing in person) {
		if (person[thing].value == undefined) {
      var x = 1; //does nothing, which is what we want
		}
		else if (person[thing].value.match(/\.(jpeg|jpg|gif|png)$/) != null) {
			var val = document.getElementById('imagename').value;
    		src = person[thing].value;
    		img = document.createElement('img');

    		img.src = src;
    		document.body.appendChild(img);
		}
		else {
      var entry = document.createElement('li');
      entry.appendChild(document.createTextNode(thing+': '));
      entry.appendChild(document.createTextNode(person[thing].value));
      entry.setAttribute('id','item'+person[thing].id);

      var input = document.createElement('input');
      input.type = 'text';
      input.name = 'forminput';
      entry.appendChild(input);

      var submitButton = document.createElement('button');
      submitButton.appendChild(document.createTextNode("Submit"));
      submitButton.setAttribute('onClick','updateAnnotation("'+'item'+person[thing].id+'")');
      entry.appendChild(submitButton);

      document.getElementById('annotations').appendChild(entry);
		}
	}

}

//This function allows us to update annotations and create new ones
/*
*It works by first reading in the annotation type and value from the html page, and assigns them to a new object, newAnnotation
*It then checks to see if the type of annotation is already in the person and, if so, updates it with the new value
*If there is no new annotation, the function creates a new one
*There are still some bugs to be worked out relating to the ids of newly created annotations
*/

async function callToUpdate(newAnnotation) {

      update = await fetch('http://tinydev.rerum.io/app/update', {
      method: "PUT",
      headers: {
        "Content_Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(newAnnotation),
    })

    let updatedJSON = await update.json();
    let updatedAnnotObj = updatedJSON.new_obj_state;

    return updatedAnnotObj;
}

async function callToCreate(newAnnotation) {

  createResponse = await fetch('http://tinydev.rerum.io/app/create', {
    method: "POST",
    headers: {
      "Content_Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(newAnnotation),
  })

  let newJSON = await createResponse.json();

  return newJSON;
}

async function populateAnnotation(newAnnotation) {

  // newAnnotation = {'body': {}} //the newAnnotation object, where we store the type and value of annotation
  newAnnotation.body[newannotationtype.value] = {}
  newAnnotation.body[newannotationtype.value].value = newannotationvalue.value;
  newAnnotation['@context'] = 'http://www.w3.org/ns/anno.jsonld';
  newAnnotation['@type'] = 'Annotation';
  newAnnotation.motivation = 'describing';
  newAnnotation.target = person.id;

  return newAnnotation;

}

async function addEvidence(newAnnotation, evidence) {

  newAnnotation.body[newannotationtype.value].evidence = evidence;

}

async function updateAnnotation() {

  newAnnotation = {'body': {}} //the newAnnotation object, where we store the type and value of annotation
  updatedAnnotObj = {}
  let selected = null;

  newAnnotation = await populateAnnotation(newAnnotation);

  //Querying to get the list of annotations

  if(person[newannotationtype.value]) {

  	if(person[newannotationtype.value]['@id']) {
    	newAnnotation['@id'] = person[newannotationtype.value]['@id'];
    }

    await addEvidence(newAnnotation, 'http://devstore.rerum.io/v1/id/5b76fc0de4b09992fca21e68');

    console.log(newAnnotation);

    updatedAnnotObj = await callToUpdate(newAnnotation);

    person[newannotationtype.value] = updatedAnnotObj.body[newannotationtype.value];
    person[newannotationtype.value]['@id'] = updatedAnnotObj['@id'];


  }

  else {

    await addEvidence(newAnnotation, 'http://devstore.rerum.io/v1/id/5b76fc0de4b09992fca21e68');

    let newJSON = await callToCreate(newAnnotation);

    if (!newJSON['@id']) {
      newAnnotation['@id'] = newJSON.new_obj_state['@id'];
    }
    else {
      newAnnotation['@id'] = newJSON['@id'];
    }

    let response = await callToUpdate(newAnnotation);

    let updatedAnnotObj = response;
    person[newannotationtype.value] = updatedAnnotObj.body[newannotationtype.value];
    person[newannotationtype.value]['@id'] = updatedAnnotObj['@id'];

  }

  showAnnotations();

}

populatePage();