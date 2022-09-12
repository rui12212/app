// ここには各要素（認証・ファイル）に使うデータ型を敷いている（String?Numberなど）

// #Javascript側ですでに定義されているものをImoportする
// ファイルオブジェクトにもデータ型がすでに定義されている
export interface File extends Blob{
    readonly lastModified: number;　
    readonly name: string;　
}

// 下記3つは認証（AUTH）のSliceで使用する。頻繁に使用するものであるため、ここで定義をしておくことで、後で参照するのが楽になる
// autheSlice.ts
// すでにPROPS_AUTHENは機能として存在している。それを呼び出しているだけ。
export interface PROPS_AUTHEN {　
    // #e-mail・passwordとも文字列でるため、strとして定義
    email: string;　
    password: string;　
}

// カスタムのデータタイプを作っている
export interface PROPS_PROFILE { 
    id: number;
    nickName: string;
    // イメージ画像は無い場合もあるので、それを許容するためにNullも許可している
    img: File | null;
}

export interface PROPS_NICKNAME{
    nickName: string;
}

// 投稿のタイトルと画像を受け取る仕様
// 新規でPOstする時の設定
export interface PROPS_NEWPOST {
    title: string;
    img: File | null;
}

// いいねが押された時の設定
export interface PROPS_LIKED {
    id: number;
    title: string;
    // 現在のいいね数を格納（いいねをくれたUserIDの配列）
    current: number[];
    // 新しいいいね数を格納（いいねをくれたUserIDの配列）
    new: number;
}

// コメントを受ける設定。文字列で受けて、PostのIDをNumberで受ける
export interface PROPS_COMMENT {
    text: string;
    // 投稿のIDを取得。
    post: number;
}

// post.tsxのPost関数に引き渡される内容。PROPSの型定義
// ここでのパラメーター（型指定）はCore.tsx218行のもの
export interface PROPS_POST {
    postId: number;
    loginId: number;
    userPost: number;
    title: string;
    imageUrl: string;
    liked: number[];
}