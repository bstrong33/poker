import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import HomePage from './components/HomePage/HomePage';
import GamePlay from './components/GamePlay/GamePlay';

export default 
<Switch>
    <Route exact path='/' component={Login} />
    <Route path='/homepage' component={HomePage} />
    <Route path='/gameplay' component={GamePlay} />
</Switch>