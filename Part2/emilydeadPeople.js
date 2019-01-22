var display = {};
//templater for server interaction functions can be added later by request.

const MC = {} 
MC.OriginURL = 'http://devstore.rerum.io/v1/id/5bdb1292e4b0842a2b4e4435';

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

  let response;

  if (localStorage.hasOwnProperty('people') == true){
    var temp = localStorage.getItem('people');
    console.log(temp);
    var temp2 = JSON.parse(temp);
    if (temp2.new_obj_state == undefined) {
      response = await fetch(temp2['id']);
    }
    else {response = await fetch(temp2.new_obj_state['@id'])};

    let jsonObj = await response.json();

    if (jsonObj.next == []){
      display.showPeople(JSON.parse(temp));
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

	var people = jsonObj['itemListElement'];
	var myList = document.createElement('ul');
  var buffer="";

    for(var i = 0; i < people.length; i++) {
      var item = people[i];
      console.log(item.name);
      buffer+=`<li><a href="#${item['@id']}"></a>${item.name}</li>`;
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
  console.log("List container: " + listContainer);
  //let listContainer = await listContainerURL.json();
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

  newPerson['@id'] = newJSON.new_obj_state['@id'];

  if(obj.itemListElement == undefined){
    obj.new_obj_state.itemListElement.push(newPerson);
  }
  else {obj.itemListElement.push(newPerson);}
  

  update = await fetch('http://tinydev.rerum.io/app/update', {
    method: "PUT",
    headers: {
      "Content_Type": "application/kson; charset=utf-8",
    },
    body: JSON.stringify(obj),
  })

  let updatedJSON = await update.json();

  localStorage.setItem('people',JSON.stringify(updatedJSON));
  console.log("New JSON:\n");
  console.log(updatedJSON);


  MC.NewURL = updatedJSON.new_obj_state['@id'];

  renderList();

}

renderList();
