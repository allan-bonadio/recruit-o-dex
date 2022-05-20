/*
** index -- top level for the RecruitMan page
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import React from 'react';
import ReactDOM from 'react-dom';

import './index.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import {App} from './App';
import {globalListUpdateList} from './globalList/GlobalList';

ReactDOM.render(<App />, document.getElementById('root'));

globalListUpdateList();  // should have been GlobalList.me.updateList();


