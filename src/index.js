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
  PUSH,
  RouterProvider,
} from 'redux-little-router';
import createSagaMiddleware, {
  takeEvery,
  takeLatest,
} from 'redux-saga';
import { call } from 'redux-saga/effects';

// Credit to https://github.com/FormidableLabs/redux-little-router/blob/master/src/link.js
const normalizeLocation = href => {
  if (typeof href === 'string') {
    const pathnameAndQuery = href.split('?');
    const pathname = pathnameAndQuery[0];
    const query = pathnameAndQuery[1];
    return query ? { pathname, search: `?${query}` } : { pathname };
  }
  return href;
};
const resolveQueryForLocation = ({
  linkLocation,
  persistQuery,
  currentLocation,
}) => {
  const currentQuery = currentLocation &&
    currentLocation.query;

  // Only use the query from state if it exists
  // and the href doesn't provide its own query
  if (
    persistQuery &&
    currentQuery &&
    !linkLocation.search &&
    !linkLocation.query
  ) {
    return {
      pathname: linkLocation.pathname,
      query: currentQuery,
    };
  }

  return linkLocation;
};

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
    middlewares = [],
    mountNode,
    reducer = state => (state || {}),
  }) {
    this.builder = {
      allRoutes: [],
      enterListeners: {},
      layouts: {},
      leaveListeners: {},
      middlewares,
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
      middlewares,
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
        applyMiddleware(this.sagas, ...middlewares)
      )
    );

    const AppUI = () => React.createElement(
      'div',
      {},
      Object.values(layouts).map(
        (layout, i) => React.createElement(
          Fragment,
          {
            forRoutes: layout.routes,
            key: i,
          },
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

    const initialLocation = this.store.getState().router;
    if (initialLocation) {
      this.store.dispatch(
        initializeCurrentLocation(initialLocation)
      );
    }

    render(React.createElement(App), this.mountNode);

    delete this.builder;
  }

  go(path) {
    const newLoc = this.store.history.createLocation(resolveQueryForLocation({
      linkLocation: normalizeLocation(path),
      currentLocation: this.store.history,
    }));
    this.store.dispatch({
      type: PUSH,
      payload: newLoc,
    });
  }
}

function* takeEveryAndCatch(type, handler, onError) {
  yield* takeEvery(type, function* takeWrapper(action) {
    try {
      yield call(handler, action);
    } catch (err) {
      yield call(onError, err);
    }
  });
}

function* takeLatestAndCatch(type, handler, onError) {
  yield* takeLatest(type, function* takeWrapper(action) {
    try {
      yield call(handler, action);
    } catch (err) {
      yield call(onError, err);
    }
  });
}

export default Hydrazine;
export {
  takeEveryAndCatch,
  takeLatestAndCatch,
};
