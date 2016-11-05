/**
 * Created by Zappatta on 10/7/2016.
 */
function ControlBarController($scope, ProxyService){

    let ctrl = this;
    ctrl.proxyState = ProxyService.state;
    ctrl.port = localStorage.proxyPort || 8008;

    ProxyService.on("stateChange", function(newState){
        ctrl.proxyState = newState;
        let phase = $scope.$root.$$phase;


        //this is bad angular practice. But turning off sometimes happen fast enough to be consumed by the click apply, and sometimes not.
        if (phase != '$apply' && phase != '$digest') {
            $scope.$apply();
        }
    });



    ctrl.startProxy = function(){
        ProxyService.start(ctrl.port);

        let http = require("http");

        let options = {
            host: "localhost",
            port: ctrl.port,
            path: "http://example.com/",
            headers: {
                Host: "example.com"
            }
        };
        http.get(options, (res) => {
            res.pipe(process.stdout);
        });
    };

    ctrl.stopProxy = function(){
        ProxyService.stop();
    }

}


angular.module("elechdeb").component("controlBar", {
    templateUrl: "./components/ControlBar/ControlBar.html",
    controller: ControlBarController,
    controllerAs: "ctrl",
    bindings: {

    }

});

