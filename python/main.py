import os
import logging # あるソフトウェアが実行されているときに起こったイベントを追跡する
import pathlib # ファイルシステムのパスを表すクラスを提供
import json
import hashlib # ハッシュを求めるライブラリ
# FastAPI：APIのすべての機能を提供するPythonクラス
# Form：JSONの代わりにフィールドを受け取る
# HTTPException：
from fastapi import FastAPI, Form, HTTPException, File, UploadFile
from fastapi.responses import FileResponse # 
# CORSMiddleware：CORSに関する設定ができるミドルウェア
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

# FastAPIの「インスタンス」を生成
# uvicornコマンド内のappおよび以下の@appは全てこのインスタンスを指している
app = FastAPI()
logger = logging.getLogger("uvicorn")
# INFOレベル以上の情報をコンソールに表示する設定(デフォルトはWARNING)
logger.level = logging.INFO
"""
__file__：実行中のファイルの場所(パス)
parent：現在の階層の一つ上のパスを返す
resolve()：絶対パスに変換
/演算子：Pathオブジェクトに対して使うとパスが連結される
images = <<main.pyのパス>-"/main.py"の絶対パス>/images
       = .../python/images
"""
images = pathlib.Path(__file__).parent.resolve() / "images"
# os.environ.get：環境変数を取得。無い場合は第二引数の値になる。
origins = [ os.environ.get('FRONT_URL', 'http://localhost:3000') ]
"""
ミドルウェア：OSとAPの中間で様々なソフトウェアから共通して利用される機能を提供するもの。
オリジン：プロトコルとドメインとポートの組み合わせ。(例：http://localhost:3000)
add_middleware：ミドルウェアの設定をする。第一引数にミドルウェアクラスを受け取る
CORSMiddleware：CORSに関する設定ができるミドルウェア
allow_origins：オリジン間リクエストを許可するオリジンのリスト
allow_credentials：オリジン間リクエストでCookieをサポートする必要があることを示す。(今回はFalseだからサポートの必要がないことを示している)
allow_methods：オリジン間リクエストで許可するHTTPメソッドのリスト。デフォルトは ['GET']。
allow_headers：オリジン間リクエストでサポートするHTTPリクエストヘッダーのリスト。デフォルトは [] 。['*']を使用して、すべてのヘッダーを許可。
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET","POST","PUT","DELETE"],
    allow_headers=["*"],
)

def get_json(file_name):
    # JSONファイルの有無を確認
    if os.path.isfile(file_name) == True:
        # あったら読み込んでjson_dictに代入
        with open(file_name, 'r') as f:
            return json.loads(f.read())
    else:
        return {"items": []}

def add_json(content):
    json_dict = get_json("items.json")
    json_dict["items"].append(content)
    with open("items.json", 'w') as f:
        json.dump(json_dict, f, indent=2, ensure_ascii=False)

def get_data(command, value = ()):
    con = sqlite3.connect('../db/mercari.sqlite3') # DBに接続
    cur = con.cursor() # SQLiteを操作するカーソルオブジェクト
    cur.execute(command, value) # SQL文を実行
    table = [row for row in cur]
    con.close() # 接続を切る
    return table

def get_hash(s: str):
    file_name, extension = s.split(".")
    return hashlib.sha256(file_name.encode()).hexdigest()+"."+extension

"""
@app.get("/")：パスオペレーションデコレータ
@something：デコレータ。関数の上に書く。直下の関数を受け取ってそれを使って何かする。
.get：getオペレーション(getメソッド)
("/")：ホスト名直後の/以降(パス(エンドポイント、ルートともいう))を書く
"""
"""
パスオペレーション関数：パスオペレーションデコレータの直下にある関数
GETオペレーションを使ったURL「/」へのリクエストを受け取るたびにFastAPIによって呼び出される。
"""
@app.get("/")
def root():
    return {"message": "Hello, world!"} # レスポンス

@app.get("/items")
def get_items():
    table = get_data("SELECT i.id, i.name, c.name, i.image_filename FROM category c, items i WHERE c.id=i.category")
    items_list = {"items": [{"name": row[1], "category": row[2], "image_filename": row[3]} for row in table]}
    return items_list

@app.get("/search")
def search_items(keyword: str):
    # (q,)：タプルは要素が一つの場合末尾にカンマをつける必要がある
    table = get_data("SELECT * FROM items WHERE name=?", (keyword,))
    items_list = {"items": [{"name": row[1], "category": row[2]} for row in table]}
    return items_list

@app.get("/items/{item_id}")
def get_detail(item_id):
    table, = get_data("SELECT * FROM items WHERE id=?", (item_id,))
    item_detail = {"name": table[1], "category": table[2], "image_filename": table[3]}
    return item_detail

"""
@app.post("/items")：/itemsへのリクエストをポストメソッドで受け取る
Form()：フォームからの入力を受け取る
File()：ファイルを受け取る
UploadFile：Fileのラッパークラス。より大きなファイルでも操作可能。
"""
@app.post("/items") 
def add_item(name: str = Form(...), category: str = Form(...), image: UploadFile = File(...)):
    image_hash = get_hash(image.filename)
    con = sqlite3.connect('../db/mercari.sqlite3')
    cur = con.cursor()
    # SQL文の中の変数を入れたい場所に?を書き、第二引数でその値を指定
    cur.execute("INSERT INTO items(name, category, image_filename) VALUES(?, ?, ?)", (name, category, image_hash))
    con.commit() # データを保存
    con.close()
    # logger.info：このアプリを起動したウィンドウに表示されるイベントの報告
    logger.info(f"Receive item: {name} {category} {image.filename}")
    return {"message": f"item received: {name}"}

# format文字列と同様のシンタックスで「パスパラメータ」や「パス変数」を宣言できる
@app.get("/image/{image_filename}")
async def get_image(image_filename):
    # Create image path
    image = images / image_filename

    if not image_filename.endswith(".jpg"):
        raise HTTPException(status_code=400, detail="Image path does not end with .jpg")

    if not image.exists():
        logger.debug(f"Image not found: {image}")
        image = images / "default.jpg"

    return FileResponse(image)

def main():
    # add_item("itemB", "categoryB")
    # print(get_data("SELECT * FROM items WHERE name=?", ("itemA",)))
    print(get_hash("image.jpg"))

if __name__ == '__main__':
    main()
