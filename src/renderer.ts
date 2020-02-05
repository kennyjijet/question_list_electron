const { BrowserWindow, net  } = require('electron').remote
const path = require('path');

let addWindow: Electron.BrowserWindow;
const list_area = document.querySelector('#list_area');
const loading_text = document.querySelector('#loading_text');

let answerTemp = "";

let listQuestion:object = {};
function createQuestionList()
{
  loading_text.innerHTML = "";
  for (var value in listQuestion) {
    let my_div = htmlToElements("<div class='myList' data-key='" +value+ "'>" +listQuestion[value].question+"</div>");
    list_area.appendChild(my_div);
  }

  var myLists: NodeListOf<Element> = document.querySelectorAll('.myList');
  myLists.forEach(function(value:Element){
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

function createAddWindow() : void{
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
    console.log(`BODY: ${chunk}`)  
    var str:string = new TextDecoder("utf-8").decode(chunk);
    var message:object = JSON.parse(str);
    var index:number = 0;
    for (var value in message['results'])
    {
      var jsonData = {};
      index++;
      jsonData['question'] = message['results'][value].question
      jsonData['answer'] = message['results'][value].correct_answer
      listQuestion['question' + index] = jsonData;
    }
    createQuestionList();
  })
  response.on('end', () => {
    // Bug framework response.on is not emitted.
    //console.log('No more data in response.')
  })
})
request.end()



