// @flow

import { combineReducers } from 'redux';

import { reducer as navbarReducer } from '../navbar';
import { reducer as routerReducer } from '../router';
import { reducer as settingsReducer } from '../settings';
import { reducer as ProfileReducer } from '../auth';

export default combineReducers({
    navbar: navbarReducer,
    router: routerReducer,
    settings: settingsReducer,
    Profile: ProfileReducer
});
