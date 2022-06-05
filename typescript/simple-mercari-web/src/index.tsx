import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals'; // 計測ライブラリ

// ReactDOM.render(arg1, arg2)：第二引数で取得したDOMに第一引数で指定したHTMLを書き込む
// arg1：取得したDOM内にレンダーしたい(書き込みたい)React要素
// arg2：rootIDのDOMを取得して渡す
// ReactDOM.renderは現在ReactDOM.createRootに置き換わっている
// <React.StrictMode>：開発モードでテストするときのみ動く。本番ビルドには影響が無い
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); // 計測の関数
