import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'redux-little-router';

import Hydrazine from '../';

const app = new Hydrazine({ mountNode: document.getElementById('mountNode') });

document.title = 'Unknown Page';

const Home = () => (
  <div>
    <h1>Home</h1>
    <Link href="/one">Next Page</Link>
  </div>
);

const One = () => (
  <div>
    <h1>One</h1>
    <Link href="/two/Hydrazine">Next Page</Link>
  </div>
);

const Two = props => (
  <div>
    <h1>Two</h1>
    Powered by {props.fuel}.
    <br />
    <Link href="/">First Page</Link>
  </div>
);
Two.propTypes = {
  fuel: PropTypes.string,
};
const TwoContainer = connect(
  state => ({ fuel: state.router.params.fuel })
)(Two);

app.get('/', { layout: Home });
app.get('/one', { layout: One });
app.get('/two/:fuel', {
  layout: TwoContainer,
  onEnter: () => { document.title = 'Page Two'; },
  onLeave: () => { document.title = 'Unknown Page'; },
});

app.start();
