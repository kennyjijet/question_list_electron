
var ipcRenderer = require('electron').ipcRenderer;
const ans = document.querySelector('#ans');
ipcRenderer.on('test:answer', function (event:Event,store:string) {
    ans.innerHTML = store
    //ans.appendChild(my_div);  
});
