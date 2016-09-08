import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import {
  applyMiddleware,
  compose,
  createStore,
} from 'redux';
import {
  createStoreWithRouter,
  initializeCurrentLocation,
  provideRouter,
  Fragment,
} from 'redux-little-router';
import createLogger from 'redux-logger';
import createSagaMiddleware, {
  takeLatest,
} from 'redux-saga';
import { call } from 'redux-saga/effects';

const createListenerSaga = (enterListeners, leaveListeners) => {
  let prevRoute = null;

  function* handleChange({
    payload: {
      route,
    },
  }) {
    if (prevRoute && prevRoute in leaveListeners) {
      yield call(leaveListeners[prevRoute]);
    }
    prevRoute = route;
    if (route in enterListeners) {
      yield call(enterListeners[route]);
    }
  }

  return function* listenerSaga() {
    yield takeLatest('ROUTER_LOCATION_CHANGED', handleChange);
  };
};

class Hydrazine {
  constructor({
    mountNode,
    reducer,
  }) {
    this.builder = {
      allRoutes: [],
      enterListeners: {},
      layouts: {},
      leaveListeners: {},
      reducer,
    };
    this.mountNode = mountNode;
  }

  get(route, {
    Layout,
    onEnter,
    onLeave,
  }) {
    const {
      allRoutes,
      enterListeners,
      layouts,
      leaveListeners,
    } = this.builder;
    if (Layout in layouts) {
      layouts[Layout].push(route);
    } else {
      layouts[Layout] = [route];
    }
    if (onEnter) {
      enterListeners[route] = onEnter;
    }
    if (onLeave) {
      leaveListeners[route] = onLeave;
    }
    allRoutes.push(route);
  }

  start() {
    const {
      allRoutes,
      enterListeners,
      layouts,
      leaveListeners,
      reducer,
    } = this.builder;

    this.sagas = createSagaMiddleware();
    this.store = createStore(
      reducer,
      undefined,
      compose(
        createStoreWithRouter({
          routes: Object.keys(allRoutes).map(
            () => ({})
          ),
          pathname: location.pathname,
        }),
        applyMiddleware(this.sagas, createLogger())
      )
    );

    const initialLocation = this.store.getState().router;
    if (initialLocation) {
      this.store.dispatch(
        initializeCurrentLocation(initialLocation)
      );
    }

    const AppUI = React.createElement(
      'div',
      Object.keys(layouts).map(
        Layout => React.createElement(
          Fragment,
          { forRoutes: layouts[Layout] },
          React.createElement(Layout)
        )
      )
    );

    const App = () => React.createElement(
      Provider, { store: this.store }, (
        provideRouter({ store: this.store })(AppUI)
      )
    );

    const listenerSaga = createListenerSaga(enterListeners, leaveListeners);
    this.sagas.run(listenerSaga);

    render(React.createElement(App), this.mountNode);

    delete this.builder;
  }
}

export default Hydrazine;
