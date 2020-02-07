import { ipcRenderer } from "electron";
const ans = document.querySelector('#ans');
ipcRenderer.on('test:answer', (event : any, arg : string) => {
    //console.log(answer);
    ans.innerHTML = arg;
});
