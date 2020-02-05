function htmlToElements(htmlStr : String) {
    var div = document.createElement('div')
    div.innerHTML = htmlStr.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}
