var display = {};
//templater for server interaction functions can be added later by request.

const MC = {}

async function getMostRecentURL() {

  let leafCheckArray = await callToQuery();

  let mostRecentLeaf = {}

  //First time you come upon an empty next is your leftmost leaf
  for (leaf in leafCheckArray) {
    if (leafCheckArray[leaf].__rerum.history.next.length == 0) {
    mostRecentLeaf = leafCheckArray[leaf];
    break;
    }

  }

  MC.NewURL = mostRecentLeaf['@id'];
}

async function markForDelete(id) {

  response = await fetch('http://tinydev.rerum.io/app/delete', {
    method: "DELETE",
    headers: {
      "Content_Type": "application/json; charset=utf-8",
    },
    body: id
  })

  let update = await callToUpdate(MC.json);

}

async function callToQuery() {

  let data = JSON.stringify({
      name: "Cemetery Population",
  });

  response = await fetch('http://tinydev.rerum.io/app/query', {
      method: "POST",
      headers: {
          "Content_Type": "application/json; charset=utf-8",
      },
      body: data
    })
    responseJSONArray =  await response.json();

  return responseJSONArray;
}

async function callToCreate(newPerson) {

  createResponse = await fetch('http://tinydev.rerum.io/app/create', {
    method: "POST",
    headers: {
      "Content_Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(newPerson),
  })

  let newJSON = await createResponse.json();

  return newJSON;
}

async function callToUpdate(obj) {

  update = await fetch('http://tinydev.rerum.io/app/update', {
    method: "PUT",
    headers: {
      "Content_Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  })

  let updatedJSON = await update.json();
  let updatedObj = updatedJSON.new_obj_state;

  return updatedObj;
}

async function getList() {

    await getMostRecentURL();

    let response = await fetch(MC.NewURL);
    let jsonObj = await response.json();

    localStorage.setItem('people', JSON.stringify(jsonObj));
    console.log(localStorage.getItem('people'));

    display.showPeople(jsonObj);
}

async function checkValidity() {

  var temp = localStorage.getItem('people');
  if (temp != 'undefined' && temp != null) {
    console.log(temp);
    var temp2 = JSON.parse(temp);
    let response = await fetch(temp2['@id']);
    let jsonObj = await response.json();

    if (jsonObj.__rerum.history.next.length == 0){
      display.showPeople(temp2);
    }
    else if (jsonObj.__rerum.history.next.length != 0) {
      await getList();
    }
  }

  else if (temp == 'undefined' || temp == null) {
    await getList();
  }
}


display.showPeople = function(jsonObj) {

  var people = jsonObj.itemListElement;
  MC.json = jsonObj;
  if (!people) {
    throw "No list object found"
  }

    for(var i in people) {
      var item = people[i];
      console.log(item.name);

      //Creating the link for the list
      var link = `annotationPage.html?personURL=${item['@id']}`;
      var a = document.createElement('a');
      var linkText = document.createTextNode(item.name);
      a.appendChild(linkText);
      a.href = link;
      var entry = document.createElement('li');
      entry.appendChild(a);
      entry.setAttribute('id','item'+item['@id']);

      //Adding the new remove button
      var removeButton = document.createElement('button');
      removeButton.appendChild(document.createTextNode("remove"));
      removeButton.setAttribute('onClick','removeName("'+'item'+item['@id']+'")');
      entry.appendChild(removeButton);
      document.getElementById('nameList').appendChild(entry);
    }

};

async function removeName(itemid) {
  var item = document.getElementById(itemid);
  nameList.removeChild(item);
  await markForDelete(itemid);
}


async function renderList()
{
  await checkValidity();
}

async function addNew() {

  var listContainer = localStorage.getItem('people');
  var obj = JSON.parse(listContainer);
  console.log(obj);
  var newName = txt.value;
  if (newName == "") newName = "NAME NOT GIVEN";

  var newPerson = {};

  newPerson['name'] = newName;
  newPerson['@type'] = 'Person';

  let newJSON = await callToCreate(newPerson);

  if (!newJSON['@id']) {
    newPerson['@id'] = newJSON.new_obj_state['@id'];
  }
  else {
    newPerson['@id'] = newJSON['@id'];
  }

  obj.itemListElement.push(newPerson);

  let updatedJSON = await callToUpdate(obj);

  localStorage.setItem('people',JSON.stringify(updatedJSON));
  console.log("New JSON:\n");
  console.log(updatedJSON);


  MC.NewURL = updatedJSON['@id'];

  renderList();

}

renderList()

