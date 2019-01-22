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
    let JSON = await response.json();

    showPeople(JSON);

function showPeople(jsonObj) {

	var people = jsonObj['itemListElement'];
	var myList = document.createElement('ul');
  var buffer="";

    for(var i = 0; i < people.length; i++) {
      var item = people[i];
      console.log(item.name);
      var link = item.name.link(item['@id']);
      buffer+=`<li><a href=#${item['@id']}></a>${item.name}</li>`;
    }

  nameList.innerHTML = buffer;
}

}

async function renderList()
{
  let lastURL = MC.NewURL;
  var jsonObj = await getList();
}


async function addNew() {

  let listContainerURL = await fetch(MC.NewURL);
  let listContainer = await listContainerURL.json();
  var newName = txt.value;

  var newPerson = {};

  newPerson["name"] = newName;
  newPerson["@type"] = "Person";

  response = await fetch('http://tinydev.rerum.io/app/create', {
    method: "POST",
    headers: {
      "Content_Type": "application/kson; charset=utf-8",
    },
    body: JSON.stringify(newPerson),
  })

  let newJSON = await response.json();

  newPerson['@id'] = newJSON['@id'];

  listContainer.itemListElement.push(newPerson);

  update = await fetch('http://tinydev.rerum.io/app/update', {
    method: "PUT",
    headers: {
      "Content_Type": "application/kson; charset=utf-8",
    },
    body: JSON.stringify(listContainer),
  })

  let updatedJSON = await update.json();

  MC.NewURL = updatedJSON.new_obj_state['@id'];

  renderList();

}

renderList();
