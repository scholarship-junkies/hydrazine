import React from 'react';
import { Link } from 'redux-little-router';

import Hydrazine from '../';

const app = new Hydrazine({ mountNode: document.getElementById('mountNode') });

const Home = () => (
  <div>
    <h1>Test</h1>
    <Link href="/one">Next Page</Link>
  </div>
);

const One = () => (
  <div>
    <h1>One</h1>
    <Link href="/two">Next Page</Link>
  </div>
);

const Two = () => (
  <div>
    <h1>Two</h1>
    <Link href="/">First Page</Link>
  </div>
);

app.get('/', { layout: Home });
app.get('/one', { layout: One });
app.get('/two', { layout: Two });

app.start();
