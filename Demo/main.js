var display = {};
//templater for server interaction functions can be added later by request.

const MC = {}

async function getMostRecentURL() {

  let leafCheckArray = await callToQuery();

  let mostRecentLeaf = {}
  let leafURL = '';

  //First time you come upon an empty next is your leftmost leaf
  for (annot in leafCheckArray) {
    if (leafCheckArray[annot].__rerum.history.next.length == 0) {
    mostRecentLeaf = leafCheckArray[annot];
    break;
    }

  }

  MC.NewURL = mostRecentLeaf['@id'];
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
  if (temp) {
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

  else {
    await getList();
  }
}


display.showPeople = function(jsonObj) {

  var people = jsonObj.itemListElement;
  if (!people) {
    throw "No list object found"
  }
  var buffer=``;

    for(var i = 0; i < people.length; i++) {
      var item = people[i];
      console.log(item.name);
      if (!item.name) item.name = "NAME NOT GIVEN";
      var link = item.name.link(`annotationPage.html?personURL=${item['@id']}`);
      buffer+=`<li><a href=#${item['@id']}></a>${link}`<button delete></button>`</li>`;
    }

  nameList.innerHTML = buffer;
};

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

  response = await fetch('http://tinydev.rerum.io/app/create', {
    method: "POST",
    headers: {
      "Content_Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(newPerson),
  })

  let newJSON = await response.json();

  if (!newJSON['@id']) {
    newPerson['@id'] = newJSON.new_obj_state['@id'];
  }
  else {
    newPerson['@id'] = newJSON['@id'];
  }

  obj.itemListElement.push(newPerson);

  update = await fetch('http://tinydev.rerum.io/app/update', {
    method: "PUT",
    headers: {
      "Content_Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  })

  let updatedJSON = await update.json();
  var updatedListObj = updatedJSON.new_obj_state;

  localStorage.setItem('people',JSON.stringify(updatedListObj));
  console.log("New JSON:\n");
  console.log(updatedListObj);


  MC.NewURL = updatedListObj['@id'];

  renderList();

}

renderList()

