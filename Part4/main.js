var display = {};
//templater for server interaction functions can be added later by request.

const MC = {} 
MC.OriginURL = 'http://devstore.rerum.io/v1/id/5bea50e8e4b02eca91a6b9d2';

async function getMostRecentURL() {

  let nextArray = ['thing1', 'thing2'];
  MC.NewURL = MC.OriginURL;

  while(nextArray.length > 0) {

    listContainerURL = await fetch(MC.NewURL);
    listContainer = await listContainerURL.json();
    nextArray = listContainer.__rerum.history.next;
    if ( nextArray.length > 0) {
      MC.NewURL = nextArray[0];
    } 
  }
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

    if (jsonObj.next == []){
      display.showPeople(temp2);
    }
    else if (jsonObj.next != []) {
      await getList();
    }
  } 

  else {
    await getList();
  }
}


display.showPeople = function(jsonObj) {

  var people = jsonObj.itemListElement;
  var buffer=``;

    for(var i = 0; i < people.length; i++) {
      var item = people[i];
      console.log(item.name);
      var link = item.name.link(`annotationPage.html?personURL=${item['@id']}`);
      buffer+=`<li><a href=#${item['@id']}></a>${link}</li>`;
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

  var newPerson = {};

  newPerson['name'] = newName;
  newPerson['@type'] = 'Person';

  response = await fetch('http://tinydev.rerum.io/app/create', {
    method: "POST",
    headers: {
      "Content_Type": "application/kson; charset=utf-8",
    },
    body: JSON.stringify(newPerson),
  })

  let newJSON = await response.json();

  if (newJSON['id'] == undefined) {
    newPerson['@id'] = newJSON.new_obj_state['@id'];
  }
  else {
    newPerson['@id'] = newPerson['@id'];
  }

  obj.itemListElement.push(newPerson);

  update = await fetch('http://tinydev.rerum.io/app/update', {
    method: "PUT",
    headers: {
      "Content_Type": "application/kson; charset=utf-8",
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

