/**
 * Created by Zappatta on 10/2/2016.
 */
onmessage = function(event) {
    //for now this is how we load highlight.js. Wanted to use require, but you can't inside a WebWorker.
    console.time("highlighting code");
    importScripts('../libs/highlight.min.js');
    let result = self.hljs.highlight(event.data.detectedLanguage ,event.data.code).value;
    postMessage(result);
    console.timeEnd("highlighting code");

}