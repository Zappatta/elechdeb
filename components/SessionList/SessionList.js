/**
 * Created by Zappatta on 9/24/2016.
 */
// const angular = require('angular');

function SessionListController($scope, ProxyService){

    let ctrl = this;

    $scope.selectSession = function(sessionId){
        ctrl.activeSessionId = sessionId;
        let fullSession = ProxyService.getFullSession(sessionId);
        ctrl.onSessionSelect({session: fullSession});
    }

}

angular.module("elechdeb").component("sessionList", {
    templateUrl: "./components/SessionList/SessionList.html",
    controller: SessionListController,
    controllerAs: "ctrl",
    bindings: {
        sessions :"=",
        onSessionSelect: '&'
    }
});


