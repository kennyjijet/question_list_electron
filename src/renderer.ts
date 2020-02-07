const { BrowserWindow, net } = require('electron').remote;
const path = require('path');
const list_area = document.querySelector('#list_area');
const loading_text = document.querySelector('#loading_text');

let global_addWindow : Electron.BrowserWindow;
let global_answerTemp = "";
let global_listQuestion : object = {};

function createQuestionList() : void {
  loading_text.innerHTML = "";
  // listQuestion is a object not array. Could not use ForEach.
  for (var value in global_listQuestion) {
    let my_div = htmlToElements(`<div class='myList' data-key='${value}'>${global_listQuestion[value].question}</div>`);
    list_area.appendChild(my_div);
  }

  var myLists: NodeListOf<Element> = document.querySelectorAll('.myList');
  myLists.forEach((value:Element) => { 
      value.addEventListener('click', (e) => {
          e.preventDefault();
          global_answerTemp = global_listQuestion[value.getAttribute('data-key')].answer;
          if(!global_addWindow) {
            createAddWindow();
          } else {
            global_addWindow.webContents.send('test:answer', global_answerTemp);
          }
      });
  })
}

function createAddWindow() : void {
  global_addWindow = new BrowserWindow({
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

  global_addWindow.loadFile(path.join(__dirname, "./new_win.html"));

  global_addWindow.webContents.openDevTools();

  global_addWindow.on("ready-to-show", () => {
    global_addWindow.show();
    global_addWindow.webContents.send('test:answer', global_answerTemp);
  });

  global_addWindow.on("closed", () => {
    global_addWindow = null;
  });
}

//url http://localhost:3000/test/question or https://opentdb.com/api.php?amount=10 
const request = net.request('http://localhost:3000/test/question')
request.on('response', (response) => {
  response.on('error', (error) => {
    console.log(`ERROR: ${JSON.stringify(error)}`)
  })  
  console.log(`STATUS: ${response.statusCode}`)
  console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
  response.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`)  
    var str:string = new TextDecoder("utf-8").decode(chunk);
    var message:object = JSON.parse(str);
    var index:number = 0;
    // message['results'] is a object not array. cannot use es6 array function each map
    for (var value in message['results'])
    {
      var jsonData = {};
      index++;
      jsonData['question'] = message['results'][value].question;
      jsonData['answer'] = message['results'][value].correct_answer;
      global_listQuestion['question' + index] = jsonData;
    }
    createQuestionList();
  })
  response.on('end', () => {
    // Bug framework response.on is not emitted.
    //console.log('No more data in response.')
  })

})
request.end()



