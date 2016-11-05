// const angular = require('angular');
//
//angular init
angular.module("elechdeb", []).controller('MainController', function($scope, ProxyService){

    let ctrl = this;

    this.allSessions = [];
    this.selectedSession = null;
    this.setSelectedSession = function(session){
        console.log("session selected", session);
        ctrl.selectedSession = session;
    };

    ProxyService.on("requestStart", function(proxySession){
        ctrl.allSessions.push(proxySession);
        $scope.$applyAsync();
    });

    ProxyService.on("proxyRes", function(proxySession){
        for(var i=0;i<ctrl.allSessions.length;i++){
            if(ctrl.allSessions[i].id == proxySession.id){
                ctrl.allSessions[i] = proxySession;
            }
        }
        $scope.$apply();
    })


});


require("./modules/services/ProxyService.js");
require("./components/ControlBar/ControlBar");
require("./components/SessionList/SessionList");
require("./components/ExtendedSessionInfo/ExtendedSessionInfo");
require("./components/ResponseBodyViewer/ResponseBodyViewer");


