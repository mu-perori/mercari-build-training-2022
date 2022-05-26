import { useState } from 'react';
// import：(JS)他の場所で宣言されているコードの使用を許可
// { useState } from 'react'：reactの名前付きエクスポートのうちuseStateをインポート
// useState：stateの保持と更新をするためのReactフック
import './App.css';
import { ItemList } from './components/ItemList';
import { Listing } from './components/Listing';

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
  return (
    <div>
      <header className='Title'>
        <p>
          <b>Simple Mercari</b>
        </p>
      </header>
      <div>
        <Listing onListingCompleted={() => setReload(true)} />
      </div>
      <div>
        <ItemList reload={reload} onLoadCompleted={() => setReload(false)} />
      </div>
    </div>
  )
}

export default App;