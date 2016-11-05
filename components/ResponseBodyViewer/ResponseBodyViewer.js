const zlib = require("zlib");
const hexdump = require('hexdump-nodejs');

function ResponseBodyViewerController($scope, $sce){

    let ctrl = this;
    ctrl.selectedTab = 'headers';



    ctrl.$onChanges = function () {
        ctrl.contentType = ctrl.session.response._headers['content-type'];
        ctrl.contentCategory = determineContentCategory();
        ctrl.decodedResponse = getDecodedResponse();
        if(ctrl.contentCategory == 'code'){
            ctrl.getHighlightedCode();
        }
    };

    ctrl.getHighlightedCode = function(){

        ctrl.contentCategory = 'raw';
        ctrl.highlightInProgress = true;
        let detectedLanguage = ctrl.contentType.split(";")[0].split("/")[1];
        let worker = new Worker('modules/HighlightWorker.js');

        worker.onmessage = function(event) {
            ctrl.highlightedCode = $sce.trustAsHtml(event.data);
            ctrl.highlightInProgress = false;
            $scope.$apply();
            ctrl.contentCategory = 'code';
        };

        worker.postMessage({detectedLanguage: detectedLanguage, code: ctrl.decodedResponse});
    };


    ctrl.getBodyAsBase64 = function(){
        return ctrl.session.responseBuffer.toString('base64');
    };

    ctrl.getHexDump = function(){
        return hexdump(ctrl.session.responseBuffer);
    };

    function determineContentCategory(){
        let contentTypeToBodyTypeMap = {
            "code": ["text/html", 'text/javascript', 'application/javascript', 'text/json', 'text/css'],
            "image": ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg']
        };

        for(let key in contentTypeToBodyTypeMap){
            for(let i=0;i<contentTypeToBodyTypeMap[key].length;i++){
                if(contentTypeToBodyTypeMap[key][i] == ctrl.contentType.split(";")[0]){
                    return key;
                }
            }
        }
        //nothing found? show hex
        return 'hex';
    }

    function getDecodedResponse(){
        let decodedResponse;
        if(ctrl.session.response._headers['content-encoding'] && ctrl.session.response._headers['content-encoding'] == 'gzip'){

            decodedResponse = zlib.gunzipSync(ctrl.session.responseBuffer);
            decodedResponse = decodedResponse.toString('utf-8')

        }else {
            decodedResponse = ctrl.session.responseBuffer.toString('utf-8');
        }

        return decodedResponse;
    }

}

angular.module("elechdeb").component("responseBodyViewer", {
    templateUrl: "./components/ResponseBodyViewer/ResponseBodyViewer.html",
    controller: ResponseBodyViewerController,
    controllerAs: "ctrl",
    bindings: {
        session :"<"
    }
});

