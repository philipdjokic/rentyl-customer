import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './routes';
import { Capacitor } from '@capacitor/core';
import { RecoilRoot } from 'recoil';
import { GlobalStateObserver, GlobalStateInfluencer } from './state/globalState';
import router from './utils/router';
import routes from './routes';
import serviceFactory from './services/serviceFactory';

if (Capacitor.isNative) {
	window.screen.orientation.lock('portrait');
}

// Load our static routes in during startup
router.loadStaticRoutes(routes);

// Run our factory creation at the start
serviceFactory.create();

ReactDOM.render(
	<RecoilRoot>
		<App />
		<GlobalStateObserver />
		<GlobalStateInfluencer />
	</RecoilRoot>,
	document.getElementById('root')
);

serviceWorker.unregister();
