// { useState } from 'react'：reactの名前付きエクスポートのうちuseStateをインポート
import React, { useState } from 'react';

// 環境変数のAPIのURLをserverに代入。使えない場合は'http://127.0.0.1:9000'を代入。
const server = process.env.API_URL || 'http://127.0.0.1:9000';

// interface：(TS)中身の実装を持たず、メンバーや型の定義だけ持つ。
interface Prop {
  // 変数名?：必須のプロパティじゃない時は変数名の後ろに?を付ける。必須の場合は!を付ける。
  // プロパティ：オブジェクトの状態や属性。
  // onListingCompletedという変数が返り値のない関数であると定義している
  onListingCompleted?: () => void;
}

// type：(TS)型や型の組み合わせに別名を付ける
type formDataType = {
  name: string,
  category: string,
  image: string | File,
}

// export：(JS)import文を使用した他のプログラムが使用できるようにデータを書き出す
// React.FC：(R)constによる型定義でReact独自のタグであるコンポーネントを定義できる。
// 今回の場合は<Listing>タグを作っている。 
// returnで1つのタグを返す。(入れ子はいくつでも可。塊として一つなら問題ない。)
// <Listing name="なまえ">　って形でListingを呼び出したらprops.name="なまえ"になる
// props：プロパティのこと
export const Listing: React.FC<Prop> = (props) => {
  const { onListingCompleted } = props;
  // 初期値の連想配列
  const initialState = {
    name: "",
    category: "",
    image: "",
  };
  // useState<型宣言>(初期値);
  // 宣言した型の初期値をvaluesに代入。
  // valuesの変更にはsetValuesを使用。
  const [values, setValues] = useState<formDataType>(initialState);
  // const 変数名 = (引数: 引数の型): 返り値の型(voidの場合は省略OK) => {
  const isVaild = (values: formDataType): boolean => {
      // ()の前に!がついてるから()の中がtrueだったらfalseを返す。falseだったらtrueを返す。
      return !(values.name && values.category && values.image);
  };

  // 型の宣言はよくわからないけどフォームへの入力を受け取ってvaluesを変更する関数
  // 送信ボタンを押されていなくても入力された段階でこの関数が実行される
  // つまり逐次valuesが更新される。
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ...values：valuesを展開している
    // 「同じkeyが2回出てきたら2回目が優先されるからこの書き方」ってことか？
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  // これも型の宣言はわからんけどフォームの送信ボタンが押された時に実行される関数
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // フォームが持つデフォルトの動作(フォームの内容を指定したURLへ送信)をキャンセルする
    event.preventDefault()
    const data = new FormData() // FormDataオブジェクトの作成
    // data.append：既存のキーに新たな値を追加するか、キーが存在しない場合はキーを追加
    data.append('name', values.name)
    data.append('category', values.category)
    data.append('image', values.image)

    // fetch：リクエストやレスポンスを行う。基本形は以下
    // fetch(URL,{リクエストに適用したいカスタム設定を含むオブジェクト})
    // .then(response => response.json())
    // .then(data => console.log(data))

    // concat：配列や文字列を結合するメソッド
    // server.concat('/items')：serverに代入されているURLと'/items'を結合する
    fetch(server.concat('/input'), {
      method: 'POST', // デフォルトはGET
      mode: 'cors', // デフォルトもcors
      body: data,
    })
      .then(response => response.json()) // response：HTTPレスポンス全体
      .then(data => {
        console.log('POST success:', data);
        onListingCompleted && onListingCompleted();
      })
      .catch((error) => {
        console.error('POST error:', error);
      })
  };
  // Listingが呼び出されたタイミングでとりあえず以下が返される
  // その後各アクションに対して上の関数が実行される
  // nameのinputのタグにあるrequiredの意味：入力を必須にする
  // onClickは関数じゃないと入れられない
  // window.location.href='/page1'：ルーティングでpath="/page1"って指定したコンポーネントに飛ぶ
  return (
    <div className='Listing'>
      <form onSubmit={onSubmit}>
        <div>
          <input type='text' name='name' id='name' placeholder='name' onChange={onChange} required />
          <input type='text' name='category' id='category' placeholder='category' onChange={onChange} />
          <input type='file' name='image' id='image' placeholder='image' onChange={onChange} />
          <button type='submit' disabled={isVaild(values)} onClick={() => {window.location.href='/page1';}}>List this item</button>
        </div>
      </form>
    </div>
  );
}