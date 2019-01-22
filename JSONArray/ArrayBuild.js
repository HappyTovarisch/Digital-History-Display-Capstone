var templater = {} //Still can't figure out what to do with this

//This program retrieves the names of the people stored in the JSON object we were
//give by the devs at the CRC

const MC = {} 
MC.OriginURL = 'http://devstore.rerum.io/v1/id/5bc8089ce4b09992fca2222c';

async function getList() {

  let response = await fetch(MC.OriginURL);
  let jlist = await response.json();
  return jlist;

}

async function getListItems() {

  //This first bit is the simple call to fetch, which gets us our object to work with
  
  //Here we retrieve itemListElement, which is the JSON object we are working with

  let list = (await getList(MC.OriginURL)).itemListElement;
  var buffer="";

  console.log("Finally got it");

  document.getElementById("title").innerHTML = `
  <h1 class="name-title">People (${list.length}) results  </h1>
  `

  //This is the logic that iterates through itemListElement (here called list)
  //It gets the names out and adds them to a list

  for(var i=0; i < list.length; i++){ 
    var item = list[i];
    console.log(item.name);
    buffer+=`<li><a href="#${item['@id']}"></a>${item.name}</li>`;
  } 

  itemListElement.innerHTML = buffer;
 
 };

async function addNew(inputJSON) {

  let listContainter = (await getList());
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

  listContainter.itemListElement.push(newPerson);

  update = await fetch('http://tinydev.rerum.io/app/update', {
  	method: "PUT",
  	headers: {
  		"Content_Type": "application/kson; charset=utf-8",
  	},
  	body: JSON.stringify(listContainter),
  })

  let updatedJSON = await update.json();

  MC.OriginURL = updatedJSON.new_obj_state['@id'];

  getListItems();



  //inputJSON = JSON.stringify(obj);

  //console.log(inputJSON);
}

 getListItems();

