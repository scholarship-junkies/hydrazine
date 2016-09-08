# Hydrazine

A minimal, flexible client-side router with features that scale as you need them. In the box: Redux, Redux Little Router, and Redux Saga.

Developed by Scholarship Junkies. Free to use and modify so long as proper attribution is made (see LICENSE).

## Usage

```
import React from 'react';
import Hydrazine from 'hydrazine';

const app = new Hydrazine({ mountNode: document.getElementById('mountNode') });

const Home = () => <h1>Home</h1>;
const One = () => <h1>One</h1>;
const Two = () => <h1>Two</h1>;

app.get('/', { layout: Home });
app.get('/one', { layout: One });
app.get('/two', {
  layout: Two,
  onEnter: () => { /* do something */ },
  onLeave: () => { /* do something */ },
});

app.start();
```

## Demo

From repo directory: `npm i && npm start`. Server will start on port `8080`.
