import React, { useEffect } from 'react';
import { View } from '@bit/redsky.framework.rs.996';
import './App.scss';
import './icons/style.css';

// The following components need to be added to the top level dom since they are full screen overlays
import popupController from '@bit/redsky.framework.rs.996/dist/popupController';
import rsToasts from '@bit/redsky.framework.toast';
import useLoginState, { LoginStatus } from './customHooks/useLoginState';
import CustomToast from './components/customToast/CustomToast';
import Box from './components/box/Box';
import AppBar from './components/appBar/AppBar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import useWindowResizeChange from './customHooks/useWindowResizeChange';
import router from './utils/router';
import ComparisonDrawer from './popups/comparisonDrawer/ComparisonDrawer';

function App() {
	const loginStatus = useLoginState();
	const size = useWindowResizeChange();
	// Code to setup our toast delegates (Will render CustomToast when called)
	useEffect(() => {
		router.tryToLoadInitialPath();
		rsToasts.setRenderDelegate(CustomToast);
		AOS.init({
			duration: 1000
		});
		//remove nav-parent element from the dom
		document.querySelector('.nav-parent')!.remove();
	}, []);

	function renderViewsBasedOnLoginStatus() {
		switch (loginStatus) {
			case LoginStatus.UNKNOWN:
				return null;
			case LoginStatus.LOGGED_OUT:
				return (
					<>
						<AppBar />
						<View key="signIn" id="signIn" default initialPath="/" />
					</>
				);
			case LoginStatus.LOGGED_IN:
				return (
					<div className="loggedInView">
						<Box>
							<AppBar />
							<View key="landingPage" id="landingPage" default initialPath="/" />
						</Box>
					</div>
				);
		}
	}

	return (
		<div className={`App ${size}`}>
			<AppBar />
			<View key="landingPage" id="landingPage" default initialPath="/" />
			{/*{renderViewsBasedOnLoginStatus()}*/}
			<ComparisonDrawer />
			{popupController.instance}
			{rsToasts.instance}
		</div>
	);
}

export default App;
