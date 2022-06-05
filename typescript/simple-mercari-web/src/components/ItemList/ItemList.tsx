import React, { useEffect, useState } from 'react';
// useEffect：関数の実行タイミングをReactのレンダリング後まで遅らせるhook

interface Greeting {
  greeting_word: string;
  name: string;
};

const server = process.env.API_URL || 'http://127.0.0.1:9000';
const placeholderImage = process.env.PUBLIC_URL + '/logo192.png';

interface Prop {
  reload?: boolean;
  onLoadCompleted?: () => void;
}

// <ItemList reload={reload} onLoadCompleted={() => setReload(false)} />
// 上記のように呼び出された場合propsの中身は以下のようになっている。
// {reload: reload変数の中身, onLoadCompleted: () => setReload(false)}
export const ItemList: React.FC<Prop> = (props) => {
  const { reload = true, onLoadCompleted } = props;
  // 連想配列をphraseに代入するから初期値も形を合わせる
  const [phrase, setPhrase] = useState<Greeting>({greeting_word: "", name:""});
  const fetchItems = () => {
    fetch(server.concat('/hello'),
      {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
      // response.json()：responseに入っているjsonを連想配列にして返す
      .then(response => response.json())
      .then(data => {
        console.log('GET success:', data);
        setPhrase(data);
        // onLoadCompletedが存在するときのみonLoadCompleted()を実行する
        onLoadCompleted && onLoadCompleted();
      })
      .catch(error => {
        console.error('GET error:', error)
      })
  }

  // useEffect(実行させたい副作用関数, 第2引数には副作用関数の実行タイミングを制御する依存データを記述)
  // reloadに変化があったときのみ第一引数の関数が作動する。
  // 今回は中にif文があるのでreloadがTrueになったときのみ動作する
  useEffect(() => {
    if (reload) {
      fetchItems();
    }
  }, [reload]);
  return <p>{phrase.greeting_word}{phrase.name}</p>
};
