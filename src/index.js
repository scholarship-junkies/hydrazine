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
  Fragment,
  RouterProvider,
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
    reducer = state => (state || {}),
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
    layout: Layout,
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
      layouts[Layout].routes.push(route);
    } else {
      layouts[Layout] = {
        routes: [route],
        component: Layout,
      };
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

    const routes = {};
    allRoutes.forEach(route => {
      routes[route] = {};
    });

    this.sagas = createSagaMiddleware();
    this.store = createStore(
      reducer,
      undefined,
      compose(
        createStoreWithRouter({
          routes,
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

    const AppUI = () => React.createElement(
      'div',
      {},
      Object.values(layouts).map(
        layout => React.createElement(
          Fragment,
          { forRoutes: layout.routes },
          React.createElement(layout.component)
        )
      )
    );

    const App = () => React.createElement(
      Provider,
      { store: this.store },
      React.createElement(
        RouterProvider,
        { store: this.store },
        React.createElement(AppUI)
      )
    );

    const listenerSaga = createListenerSaga(enterListeners, leaveListeners);
    this.sagas.run(listenerSaga);

    render(React.createElement(App), this.mountNode);

    delete this.builder;
  }
}

export default Hydrazine;
