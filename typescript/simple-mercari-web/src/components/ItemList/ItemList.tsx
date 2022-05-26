import React, { useEffect, useState } from 'react';
// useEffect：関数の実行タイミングをReactのレンダリング後まで遅らせるhook

interface Item {
  id: number;
  name: string;
  category: string;
  image_filename: string;
};

const server = process.env.API_URL || 'http://127.0.0.1:9000';
const placeholderImage = process.env.PUBLIC_URL + '/logo192.png';

interface Prop {
  reload?: boolean;
  onLoadCompleted?: () => void;
}

export const ItemList: React.FC<Prop> = (props) => {
  const { reload = true, onLoadCompleted } = props;
  const [items, setItems] = useState<Item[]>([])
  const fetchItems = () => {
    fetch(server.concat('/items'),
      {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
      .then(response => response.json())
      .then(data => {
        console.log('GET success:', data);
        setItems(data);
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

  return (
    <div>
      {items.map((item) => {
        return (
          <div key={item.id} className='ItemList'>
            {/* TODO: Task 1: Replace the placeholder image with the item image */}
            <img src={placeholderImage} />
            <p>
              <span>Name: {item.name}</span>
              <br />
              <span>Category: {item.category}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
};
