import { ipcRenderer } from "electron";
const { net } = require('electron').remote;

const list_area = document.querySelector('#list_area');
const loading_text = document.querySelector('#loading_text');

let global_listQuestion : object = {};

function createQuestionList () : void {
  loading_text.innerHTML = "";
  // listQuestion is a object not array. Could not use ForEach.
  for (let value in global_listQuestion) {
    let my_div = htmlToElements(`<div class='myList' data-key='${value}'>${global_listQuestion[value].question}</div>`);
    list_area.appendChild(my_div);
  }

  var myLists: NodeListOf<Element> = document.querySelectorAll('.myList');
  myLists.forEach((value:Element) => { 
      value.addEventListener('click', (e) => {
          e.preventDefault();
          ipcRenderer.send('open:addWindow', global_listQuestion[value.getAttribute('data-key')].answer);
      });
  })
}

ipcRenderer.on('test:answer', (event : any, arg : string) => {
  console.log('test');
})

//url http://localhost:3000/test/question or https://opentdb.com/api.php?amount=10 
const request = net.request('http://localhost:3000/test/question');
request.on('response', (response) => {
  response.on('error', (error) => {
    console.log(`ERROR: ${JSON.stringify(error)}`)
  })  
  console.log(`STATUS: ${response.statusCode}`)
  console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
  response.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`)  
    let str:string = new TextDecoder("utf-8").decode(chunk);
    let message:object = JSON.parse(str);
    let index:number = 0;
    // message['results'] is a object not array. cannot use es6 array function each map
    for (let value in message['results'])
    {
      let jsonData = {};
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