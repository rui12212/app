import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
// 非同期関数しようのためにcrreate...thunkを追加
import { RootState } from '../../app/store';
// axiosの追加
import axios from "axios";
// types.tsでデータ方を定義したものをっ使えるようにimport
import {　PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from "../types";

// django API-ENdpointのURL（ここに接続すればっカスタムで作ったDjangoAPPにつなげる）を指定
// 指定の仕方は、「.env」の中にURLを指定することでできる
const apiURL = process.env.REACT_APP_DEV_API_URL;
// この後tesconffigのしたの空白で右クリックし、「.env」という環境変数（変数やデータ型など、あるルールが指定sれている部屋）を定義するファイルを作成

// 下記は非同期関数のアクション（JWTトークン取得のReact操作）
// createAsync機能を使用
export const fetchAsyncLogin = createAsyncThunk(
  // 下記のようなActionのタイプが作成される
  "auth/post",
  // 非同期形のAsyncにAwaitを組み合わせることで同期系に変換
  // Rreactから引数を読み込み、Authenに入れる。
  async (authen: PROPS_AUTHEN)=>{
    const res = await axios.post(`${apiURL}authen/jwt/create`, authen, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

// 新規ユーザー登録をおこなう関数
export const fetchAsyncRegister = createAsyncThunk( 
  "auth/register",
  async (auth: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiURL}api/register/`, auth,{
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

// 次はプロフィールを新規で作る関数
export const fetchAsyncCreateProf = createAsyncThunk(
  "profile/post",
  async (nickName: PROPS_NICKNAME) => {
    const res = await axios.post(`${apiURL}api/profile/` , nickName,{
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

export const fetchAsyncUpdateProf = createAsyncThunk(
  "profile/put",
  async (profile: PROPS_PROFILE) => {
    const uploadData = new FormData();
    uploadData.append("nickName", profile.nickName);
    profile.img && uploadData.append("img", profile.img, profile.img.name);
    const res = await axios.put(
      `${apiURL}api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

export const fetchAsyncGetMyProf = createAsyncThunk("profile/get", async () => {
  const res = await axios.get(`${apiURL}api/myprofile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  return res.data[0];
});

export const fetchAsyncGetProfs = createAsyncThunk("profiles/get", async () => {
  const res = await axios.get(`${apiURL}api/profile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

export const authSlice = createSlice({
  name: "auth",
  // initialstateとはReduxの、認証における一番最初の状態。OpenSignIn、サインインしていないUserがアクセスした時にModelがじどうで表示されるように設定
  initialState: {
    // Modal(ログインボタンを押した時などの小窓、Emailとかパスを打つやつ)が表示される、されないをTrue/False管理。
    // ReducerからStateに情報が渡されるとき、
    // 下記がログイン時、Modalを開くかどうかのTrue/False（OpenSignInではWebページが立ち上がったときに、Userログインを促すためにTrue）
    openSignIn: true,
    // 下記が登録用のModalを開くかどうかのTrue/False
    openSignUp: false,
    // ページ上で表示されるユーザーアイコンを押したときにUserProfileのModelが出るかどうか
    openProfile: false,
    // APIにアクセスし、ローディングしているときの処理
    isLoadingAuth: false,
    // Models.pyのPROFILE合うようにStateを定義。ログインUSerの情報をREduxで管理できるよう、下記の処理を行っている
    myprofile: {
      id: 0,
      nickName: "",
      userProfile: 0,
      created_on: "",
      img: "",
    },
    // 下記は、Profile情報を管理・格納・データを保持するためのStateを記載
    // 配列（今回はDictタイプでの記載）で、ReduxのStateで何のデータを保持しなければいけないかをリストで示している
    profiles: [
      {
        id: 0,
        nickName: "",
        userProfile: 0,
        created_on: "",
        img: "",
      },
    ],
  },
  // 外部のAPIにアクセスを開始→処理が終了する、という流れがある。その中で、Fetch（情報をとること）の開始と終わりのアクションとそれに紐づくStaTeの変更を定義
  reducers: {
    // fetchをスタートした時のアクションを呼ぶ。ローディングを始めたときはTrueにする
    fetchCredStart(state) {
      state.isLoadingAuth = true;
    },
    // 「Fetchが終わった時のアクションは、isLoadingをFalseにする！」ということを指示
    fetchCredEnd(state) {
      state.isLoadingAuth = false;
    },
  // 下記はModalの表示・非表示を制御するためのアクション（いつ小窓が出てくるか）
  // setopensigninがDispatchで呼ばれたときに、opensigninstateをTrueにしてくれる
  // これによりREduxのコンポーネントからDispatch経由で下記を呼ぶときに、Modalの表示機能を自由に制御できる
    setOpenSignIn(state) {
      state.openSignIn = true;
    },
    // reetopensigninがDispatchで呼ばれたときに、opensigninstateをfalseにしてくれる。
    // ★つまり、OpenSignInが実行されたときに、モーダルのStateをTrueにして、小窓を表示する。Resetはその逆
    resetOpenSignIn(state) {
      state.openSignIn = false;
    },
    // 上記と同じように、サインアップ用のModalとプロフィール編集用のModalの表示・非表示を定義
    // 下記がレジスター用のModalを指定する関数
    setOpenSignUp(state) {
      state.openSignUp = true;
    },
    resetOpenSignUp(state) {
      state.openSignUp = false;
    },
    // プロフィール編集用Modalの表示・非表示できる制御
    setOpenProfile(state) {
      state.openProfile = true;
    },
    resetOpenProfile(state) {
      state.openProfile = false;
    },
    // 下記はプロフィールのNickNameを編集するアクションを定義したもの
    // REactのコンポーネントから、Userが登録したNickNameを引数としてActionで取り出して（場所はPayloadから）、それを49行のMyprofileのNickNameに上書きするアクション
    editNickname(state, action) {
      state.myprofile.nickName = action.payload;
    },
  },
  // 後処理の追記
  extraReducers: (builder) => {
    // fetchAsyncLoginが正常に作動しとき（fulffilled)の時に、175行のアクションを設定
    builder.addCase(fetchAsyncLogin.fulfilled, (state,action) => {
      localStorage.setItem("localJWT", action.payload.access);
    });
    builder.addCase(fetchAsyncCreateProf.fulfilled, (state,action) =>{
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetMyProf.fulfilled, (state,action) => {
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetProfs.fulfilled, (state,action) => {
      state.profiles = action.payload;
    });
    builder.addCase(fetchAsyncUpdateProf.fulfilled, (state,action) => {
      state.myprofile = action.payload;
      state.profiles = state.profiles.map((prof) =>
      prof.id === action.payload.id ? action.payload: prof
      );
    });
  },
});

// 上記の内容（REducer側の内容を）を実際に使用できるように、Exportしていく（下記を書き換えていく）
// AuthSliceに変更。そして、（）の中身を上記InsittialStateで定義した関数に書き換え
export const { 
  fetchCredStart, 
  fetchCredEnd, 
  setOpenSignIn, 
  resetOpenSignIn, 
  setOpenSignUp, 
  resetOpenSignUp, 
  setOpenProfile, 
  resetOpenProfile, 
  editNickname,
} = authSlice.actions;
// 下記はstoreの中のisLoadingAuthという関数を返してくれ流関数。authの部分はstore.tsのauthと名前が一緒である必要あり
export const selectIsLoadingAuth = (state: RootState) =>
  state.auth.isLoadingAuth;

// 下記はStateの状態を確認するためのもの、RootStateでまとめて状態を確認できる
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

// 下記もSlice情報もAuthに変更
export default authSlice.reducer;

// 次は、非同期関数のアクションはAuthSliceの外に書いていく必要があるため、上から10行目のApiURLのしたから記載する
// JWTトークンの取得をReacT側で設定するしょり


