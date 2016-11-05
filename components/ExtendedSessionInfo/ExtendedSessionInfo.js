/**
 * Created by Zappatta on 9/24/2016.
 */

function ExtendedSessionInfoController(){

    let ctrl = this;
    ctrl.selectedTab = 'headers'

}

angular.module("elechdeb").component("extendedSessionInfo", {
    templateUrl: "./components/ExtendedSessionInfo/ExtendedSessionInfo.html",
    controller: ExtendedSessionInfoController,
    controllerAs: "ctrl",
    bindings: {
        session :"<"
    }

});


