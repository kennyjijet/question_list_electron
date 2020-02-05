const { BrowserWindow, net } = require('electron').remote
const path = require('path');

let addWindow: Electron.BrowserWindow;
const list_area = document.querySelector('#list_area');
let answerTemp = "";

/* Sample
let listQuestion = {
  question1: {answer:"answer1", question:"question1"},
  question2: {answer:"answer2", question:"question2"},
  question3: {answer:"answer3", question:"question3"},
};
*/

let listQuestion = {};
function createQuestionList()
{
  for (var value in listQuestion) {
    let my_div = htmlToElements("<div class='myList' data-key='" +value+ "'>" +listQuestion[value].question+"</div>");
    list_area.appendChild(my_div);
  }

  var myLists: NodeListOf<Element> = document.querySelectorAll('.myList');
  myLists.forEach(function(value){
      value.addEventListener('click', (e) => {
          e.preventDefault()
          if(!addWindow){
            createAddWindow()
            answerTemp = listQuestion[value.getAttribute('data-key')].answer
          }else{
            addWindow.webContents.send('test:answer', listQuestion[value.getAttribute('data-key')].answer);
          }
      });
  })
}

function createAddWindow(){
  //let display = electron.screen.getPrimaryDisplay();
  //let width = display.bounds.width;
  addWindow = new BrowserWindow({
    x:0,
    y:0,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    },
    width: 400,
    title: "Answer",
    show: false
  });

  addWindow.loadFile(path.join(__dirname, "./new_win.html"));

  addWindow.webContents.openDevTools();

  addWindow.on("ready-to-show", () => {
    addWindow.show();
    addWindow.webContents.send('test:answer', answerTemp);
  });

  addWindow.on("closed", () => {
    addWindow = null;
  });
}


const request = net.request('https://opentdb.com/api.php?amount=10')
request.on('response', (response) => {
  console.log(`STATUS: ${response.statusCode}`)
  console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
  response.on('data', (chunk) => {
    //console.log(`BODY: ${chunk}`)  
    var str = new TextDecoder("utf-8").decode(chunk);
    var message = JSON.parse(str);
    //console.log(message);
    var index = 0;
    for (var value in message['results'])
    {
      //console.log(message['results'][value].question);
      //console.log(message['results'][value].correct_answer);
      var jsonData = {};
      index++;
      jsonData['question'] = message['results'][value].question
      jsonData['answer'] = message['results'][value].correct_answer
      listQuestion['question' + index] = jsonData;
    }
    console.log(listQuestion);
    createQuestionList();
  })
  response.on('end', () => {
    //console.log('No more data in response.')
  })
})
request.end()



