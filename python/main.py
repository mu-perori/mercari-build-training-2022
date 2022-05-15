import os
import logging # あるソフトウェアが実行されているときに起こったイベントを追跡する
import pathlib # ファイルシステムのパスを表すクラスを提供
import json
# FastAPI：APIのすべての機能を提供するPythonクラス
# Form：JSONの代わりにフィールドを受け取る
# HTTPException：
from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import FileResponse # 
# CORSMiddleware：CORSに関する設定ができるミドルウェア
from fastapi.middleware.cors import CORSMiddleware

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
images = <<main.pyのパス>-"/main.py"したものの絶対パス>/image
       = .../python/image
"""
images = pathlib.Path(__file__).parent.resolve() / "image"
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
    return get_json("items.json")

"""
@app.post("/items")：/itemsへのリクエストをポストメソッドで受け取る
Form()：フォームからの入力を受け取る
"""
@app.post("/items") 
def add_item(name: str = Form(...), category: str = Form(...)):
    # logger.info：このアプリを起動したウィンドウに表示されるイベントの報告
    add_json({"name": name, "category": category})
    logger.info(f"Receive item: {name} {category}")
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
    print(get_json("items.json"))

if __name__ == '__main__':
    main()
