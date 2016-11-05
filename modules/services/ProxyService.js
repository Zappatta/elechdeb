/**
 * Created by Zappatta on 9/24/2016.
 */
// const angular = require('angular');

angular.module("elechdeb").service("ProxyService", function($timeout){

    const http = require('http');
    const httpProxy = require('http-proxy');

    let httpServer;
    let proxy;
    let eventListners = {};
    let sessionsIdIncrementer = 0;
    let fullSessions = {};
    let state = "off";
    let workingStateTimeout;

    function fireEvent(evtName, evtData){
        let allListners = eventListners[evtName];
        if(Array.isArray(allListners)){
            for(let i=0;i<allListners.length;i++){
                allListners[i](evtData);
            }
        }
    }


    function on(evtName, listener){
        eventListners[evtName] = eventListners[evtName] || [];
        eventListners[evtName].push(listener)
    }

    function off(evtName, listener){
        if(!Array.isArray(eventListners[evtName])){
            return false;
        }
        let indexOfListener = eventListners[evtName].indexOf(listener)
        if(indexOfListener != -1){
            eventListners[evtName] = eventListners[evtName].splice(indexOfListener,1);
            return true;
        }

        return false;

    }


    function start(port = 8008) {

        state = "turning-on";
        fireEvent('stateChange', state);

        proxy = httpProxy.createProxyServer({});
        httpServer = http.createServer((req, res) =>{
            state = "working";
            fireEvent('stateChange', state);

            sessionsIdIncrementer++;
            fullSessions[sessionsIdIncrementer] = {id: sessionsIdIncrementer, request: {url: req.url}};
            fullSessions[sessionsIdIncrementer].startTime = new Date().getTime();
            fullSessions[sessionsIdIncrementer].loadState = "loading";
            fireEvent('requestStart', fullSessions[sessionsIdIncrementer]);

            req.elechdebSessionId = sessionsIdIncrementer;

            proxy.web(req, res, {
                target: "http://" + req.headers.host,
                port: port
            });

        }).listen(port, () =>{
            state = "on";
            fireEvent('stateChange', state);
        });

        proxy.on("proxyRes", (proxyRes, req, res) =>{
            let dataBuffers = [];

            proxyRes.on('data', function(chunk){
                dataBuffers.push(chunk);

            });

            proxyRes.on('end', function(){
                let responseBuffer = Buffer.concat(dataBuffers);

                fullSessions[req.elechdebSessionId] = angular.merge(getLiteSessionObj(req, res, proxyRes), fullSessions[req.elechdebSessionId]);
                fullSessions[req.elechdebSessionId].responseBuffer = responseBuffer;
                fullSessions[req.elechdebSessionId].endTime = new Date().getTime();
                fullSessions[req.elechdebSessionId].totalTime = fullSessions[req.elechdebSessionId].endTime - fullSessions[req.elechdebSessionId].startTime;
                fullSessions[req.elechdebSessionId].loadState = "done";

                fireEvent('proxyRes', fullSessions[req.elechdebSessionId]);

                $timeout.cancel(workingStateTimeout);
                workingStateTimeout = $timeout(function(){
                    state = "on";
                    fireEvent('stateChange', state);
                },500);
            });


        });
    }

    function stop(){
        $timeout.cancel(workingStateTimeout);
        httpServer.close(function(){
            state = "off";
            fireEvent('stateChange', state);
        });
        proxy.close();
    }

    function getLiteSessionObj(request, response, proxyRes){
        return  {
            request : {
                headers: request.headers,
                url: request.url
            },
            response: {
                _headers: response._headers,
                statusCode: response.statusCode
            }

        }
    }

    function getDispalyableSession(proxySession){
        return {id:proxySession.id, url: proxySession.request.url, statusCode : proxySession.response.statusCode};
    }
    function getFullSession(sessionId){
        if(!fullSessions[sessionId]){
            console.error("session with requested id doesn't exist", sessionId);
        }
        return fullSessions[sessionId];
    }

    return {
        start: start,
        stop: stop,
        on: on,
        off: off,
        fullSessions: fullSessions,
        getDispalyableSession: getDispalyableSession,
        getFullSession: getFullSession,
        state: state
    }

});

