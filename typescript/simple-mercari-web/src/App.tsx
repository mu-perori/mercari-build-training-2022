// import：(JS)他の場所で宣言されているコードの使用を許可
// { useState } from 'react'：reactの名前付きエクスポートのうちuseStateをインポート
// useState：stateの保持と更新をするためのReactフック
// import順は上からビルトイン、外部、内部(自前)
import { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import './App.css';
import { ItemList } from './components/ItemList';
import { Listing } from './components/Listing';
// import { exportされているもの1, exportされているもの2 } from './components/フォルダ名'
// この書き方ができるのは同じ階層にindex.tsxがあるから。その中にexport * from './Listing';って書いておくことでフォルダ名から直接exportされているものをimportできる

function App() {
  // const [var1, var2] = useState(初期値);
  // useStateが値を二つ返しているのをreloadとsetReloadに分割代入している
  // var1：stateの現在の状態(初期値)が代入される。今回はtrue。
  // var2：stateを更新する関数が代入される。var2が関数名になる。
  // 今回の場合ならsetReload(false)と書いたらreloadのstateをtrueからfalseに変更できる
  const [reload, setReload] = useState(true);
  // ListingやItemListはCSSでクラス扱いされている
  // 普通のHTMLでclassって書くところはclassNameと書く
  // 変数や関数は{}で括る
  // ルーティング(表示の切り替えができる)の書き方
  // <Router>
  // <Routes>
  //   <Route path="/" element={<コンポーネント名A />} /> 
  //   <Route path="/pageB" element={<コンポーネント名B />} /> 
  // <Routes>
  // <Router>
  return (
    <div>
      <header className='Title'>
        <p>
          <b>Simple Mercari</b>
        </p>
      </header>
      <noscript>このタグ内に書いたことは表示されない</noscript>
      <Router>
      <Routes>
        <Route path="/" element={<Listing onListingCompleted={() => setReload(true)} />} /> 
        <Route path="/page1" element={<ItemList reload={reload} onLoadCompleted={() => setReload(false)} />} />
      </Routes>
      </Router>
    </div>
  )
}

export default App;