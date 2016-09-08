'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _reduxLittleRouter = require('redux-little-router');

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _effects = require('redux-saga/effects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createListenerSaga = function createListenerSaga(enterListeners, leaveListeners) {
  var _marked = [handleChange].map(regeneratorRuntime.mark);

  var prevRoute = null;

  function handleChange(_ref) {
    var route = _ref.payload.route;
    return regeneratorRuntime.wrap(function handleChange$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(prevRoute && prevRoute in leaveListeners)) {
              _context.next = 3;
              break;
            }

            _context.next = 3;
            return (0, _effects.call)(leaveListeners[prevRoute]);

          case 3:
            prevRoute = route;

            if (!(route in enterListeners)) {
              _context.next = 7;
              break;
            }

            _context.next = 7;
            return (0, _effects.call)(enterListeners[route]);

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _marked[0], this);
  }

  return regeneratorRuntime.mark(function listenerSaga() {
    return regeneratorRuntime.wrap(function listenerSaga$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _reduxSaga.takeLatest)('ROUTER_LOCATION_CHANGED', handleChange);

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, listenerSaga, this);
  });
};

var Hydrazine = function () {
  function Hydrazine(_ref2) {
    var mountNode = _ref2.mountNode;
    var reducer = _ref2.reducer;

    _classCallCheck(this, Hydrazine);

    this.builder = {
      allRoutes: [],
      enterListeners: {},
      layouts: {},
      leaveListeners: {},
      reducer: reducer
    };
    this.mountNode = mountNode;
  }

  _createClass(Hydrazine, [{
    key: 'get',
    value: function get(route, _ref3) {
      var Layout = _ref3.Layout;
      var onEnter = _ref3.onEnter;
      var onLeave = _ref3.onLeave;
      var _builder = this.builder;
      var allRoutes = _builder.allRoutes;
      var enterListeners = _builder.enterListeners;
      var layouts = _builder.layouts;
      var leaveListeners = _builder.leaveListeners;

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
  }, {
    key: 'start',
    value: function start() {
      var _this = this;

      var _builder2 = this.builder;
      var allRoutes = _builder2.allRoutes;
      var enterListeners = _builder2.enterListeners;
      var layouts = _builder2.layouts;
      var leaveListeners = _builder2.leaveListeners;
      var reducer = _builder2.reducer;


      this.sagas = (0, _reduxSaga2.default)();
      this.store = (0, _redux.createStore)(reducer, undefined, (0, _redux.compose)((0, _reduxLittleRouter.createStoreWithRouter)({
        routes: Object.keys(allRoutes).map(function () {
          return {};
        }),
        pathname: location.pathname
      }), (0, _redux.applyMiddleware)(this.sagas, (0, _reduxLogger2.default)())));

      var initialLocation = this.store.getState().router;
      if (initialLocation) {
        this.store.dispatch((0, _reduxLittleRouter.initializeCurrentLocation)(initialLocation));
      }

      var AppUI = _react2.default.createElement('div', Object.keys(layouts).map(function (Layout) {
        return _react2.default.createElement(_reduxLittleRouter.Fragment, { forRoutes: layouts[Layout] }, _react2.default.createElement(Layout));
      }));

      var App = function App() {
        return _react2.default.createElement(_reactRedux.Provider, { store: _this.store }, (0, _reduxLittleRouter.provideRouter)({ store: _this.store })(AppUI));
      };

      var listenerSaga = createListenerSaga(enterListeners, leaveListeners);
      this.sagas.run(listenerSaga);

      (0, _reactDom.render)(_react2.default.createElement(App), this.mountNode);

      delete this.builder;
    }
  }]);

  return Hydrazine;
}();

exports.default = Hydrazine;