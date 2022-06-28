// ここには各要素（認証・ファイル）に使うデータ型を敷いている（String?Numberなど）

// #Javascript側ですでに定義されているものをImoportする
// ファイルオブジェクトにもデータ型がすでに定義されている
export interface File extends Blob{
    readonly lastModeified: number;　
    readonly name: string;　
}

// 下記3つは認証（AUTH）のSliceで使用する。頻繁に使用するものであるため、ここで定義をしておくことで、後で参照するのが楽になる
// autheSlice.ts
// すでにPROPS_AUTHENは機能として存在している。それを呼び出しているだけ。
export interface PROPS_AUTHEN{　
    // #e-mail・passwordとも文字列でるため、strとして定義
    email: string;　
    password: string;　
}

// カスタムのデータタイプを作っている
export interface PROPS_PROFILE{ 
    id: number;
    nickName: string;
    // イメージ画像は無い場合もあるので、それを許容するためにNullも許可している
    img: File | null;
}

export interface PROPS_NICKNAME{
    nickName: string;
}