import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
// 非同期関数しようのためにcrreate...thunkを追加
import { RootState } from '../../app/store';
// axiosの追加
import axios from "axios";
// types.tsでデータ方を定義したものをっ使えるようにimport
import {　PROPS_NEWPOST, PROPS_LIKED, PROPS_COMMENT } from "../types";
import { SatelliteSharp } from '@material-ui/icons';

const apiURLPost = `${process.env.REACT_APP_DEV_API_URL}appi/post/`;
const apiURLComment = `${process.env.REACT_APP_DEV_API_URL}api/comment/`;

// 以下非同期関数
// 一つ目は投稿の一覧を取得する関数
export const fetchAsyncGetPosts = createAsyncThunk("post/get", async () => {
  // アクセスするURLは、十行目のapiURLPost
  // Axiosの処理が完了（成功すると）resの部分に投稿の一覧データが入ってくる
    const res = await axios.get(apiURLPost, {
      // Post一覧にアクセスするためには、JWTのトークンを付与する必要があるため、下記構文を記載
        headers: {
            Authrization: `JWT ${localStorage.localJWT}`,
        },
    });
    // Resに入ってきた値をそのまま返り値として渡してあげる
    return  res.data;
});

// 二つ目の非同期関数
// 新規で投稿を作成するもの
export const fetchAsyncNewPost = createAsyncThunk(
  "post/post",
  // Types.tsファイルのPROPS_NEWPOSTにアクセスし、その機能を使用している
  // FormDataというものを新規で作って、uploadDataに格納している。
// uploaddataにはappendを使用して、引数として設定している、投稿のタイトルをついかするように設定
  async (newPost: PROPS_NEWPOST) => {
    const uploadData = new FormData();
    uploadData.append("title", newPost.title);
// 引数の中に画像の情報がある場合のみ、appendでuploadデータに情報を追加
    newPost.img && uploadData.append("img", newPost.img, newPost.img.name);
    // resには新規d作った投稿のオブジェクトデータが入ってくる
        const res = await axios.post(apiURLPost, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authrization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// 次の非同期関数は少し複雑
// fetchAsyncPatchLikedこれはPOSTno中のLikedの属性を変更するもの
export const fetchAsyncPatchLiked = createAsyncThunk(
  "post/patch",
  // 引数としてPROPS_LIKEDのデータを受け取る（Ttpes.TSの中にはいっているPROPS_LIKEDのデータを受け取る
  async (liked: PROPS_LIKED) => {
    // ローカルのCURRENTLIKEDという変数に、現在のLIKED（liked.current）を格納する
    const currentLiked = liked.current;
    // 新たにNEWFORMDATAでuploadDataという箱を作っておく
    const uploadData = new FormData();

    // すでにイイネボタンが押されているときに、もう一度いいねを押すと、いいねが解除される仕組み
    // まずはOverlapしているときはFalseにすることを明確に
    let isOverlapped = false;
    // 下記一文はわからぬ
    currentLiked.forEach((current) => {
      // もし現在のLikeと新しいLikeが一緒だったら、OverlapをTRueにして、いいねを消す
      if (current === liked.new) {
        isOverlapped = true;
        // それ以外のときは、uploadDataに被っているやつ以外がはいる
      } else {
        uploadData.append("liked", String(current));
      }
      });

      // ★この非同期処理は何度も復習すべきかも
      // もし63行目のisOverlappedがFALSEのとき、！のついている76行目がTrueになって77行目以降が実行される
      // isOverlappedがfalseのときは、現在と新しいやつに被りがない新しい数字をタス
      if (!isOverlapped) {
        uploadData.append("liked", String(liked.new));
        // 現在の長さが1の時はいいねを格納する箱を空にしたい。それを行う特殊な処理
      }else if  (currentLiked.length  === 1) {
        uploadData.append("title", liked.title);
        const res = await axios.put(`${apiURLPost}${liked.id}/`, uploadData, {
          headers: {
            "Content-Type": "application/json",
            Autthrization: `JWT ${localStorage.localJWT}`,
          },
        });
        return res.data;
      }
      const res = await axios.patch(`${apiURLPost}${liked.id}/` , uploadData,{
        headers: {
          "Content-Type": "application/json",
          Authrization: `JWT ${localStorage.localJWT}`,
        },
      });
      return res.data;
  }
);

// 下記の非同期関数hコメントの一覧を取得する処理
export const fetchAsyncGetComments = createAsyncThunk(
  "comment/get",
  async () => {
    const res = await axios.get(apiURLComment, {
      headers: {
        Authrization: `JWT ${localStorage.localJWt}`,
      },
    });
    return res.data;
  }
);

// コメントを新規で作る非同期関数
export const fetchAsyncPostComment = createAsyncThunk(
  "commnet/post",
  async (comment: PROPS_COMMENT) => {
    const res = await axios.post(apiURLComment, comment, {
      headers: {
        Authrization : `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);



// 下記はExtrareduecer。ReduxのStateの設定。14行目で取得した投稿の一覧データを格納する
export const postSlice = createSlice({
  name: "post",
  initialState: {
    // fetchで情報をとっているときはFalse
    isLoadingPost: false,
    // Post用のモーダルの開閉設定
    openNewPost: false,
    // 配列構造で記載。Models.pyの内容を合うように記載
    posts: [
        {
            id:  0,
            title: "",
            userPost: 0,
            created_on: "",
            img: "",
            liked: [0],
        },
    ],
     // 配列構造で記載。Models.pyの内容を合うように記載。コメントも全ての情報を読み飛んで、ここにデーったを流し込む仕組みになっている
    comments:  [
        {
            id: 0,
            text: "",
            userComment: 0,
            post: 0,
        },
    ],
},
  // isLoadingPostをTureに変えてくれる処理など、状態を変化させる設定を記載
  reducers: {
    fetchPostStart(state) {
        state.isLoadingPost = true;
    },
    fetchPostEnd(state){
        state.isLoadingPost = false;
    },
    // 新規投稿用のモーダルの表示、新規の時はTureにしてくれ、ReserのときはFalseにしてくれる
    setOpenNewPost(state){
        state.openNewPost = true;
    },
    resetOpenNewPost(state){
        state.openNewPost = false;
    },

  },
  // 後処理の追記
  extraReducers: (builder) => {
    // fetchAsyncLoginが正常に作動しとき（fulffilled)の時に、175行のアクションを設定
   builder.addCase(fetchAsyncGetPosts.fulfilled, (state,action) => {
    return {
    ...state,
    // fetchAsyncGetPostsで投稿の一覧データを取得する処理が正常終了したら、storeのPostsにステートの状態を保存
    posts: action.payload,
   }
  });
  builder.addCase(fetchAsyncNewPost.fulfilled, (state, action) =>{
    return {
      ...state,
      // 新規の投稿が正常終了したときに、state.postsの最後に、182行の状態を追加する処理
      posts: [...state.posts, action.payload],
    };
  });
  builder.addCase(fetchAsyncGetComments.fulfilled, (state, action) => {
    return {
      ...state,
      // コメントの一覧の情報を取得した後に、そのステートをstoreのcommentsに入れる処理
      comments: action.payload,
    };
  });
  builder.addCase(fetchAsyncPostComment.fulfilled, (state,action) => {
    return {
      ...state,
         // 新規のcommenの取得が正常終了したときに、state.commentsの最後に、182行の状態を追加する処理
      comments: [...state.comments, action.payload],
    };
  });
  builder.addCase(fetchAsyncPatchLiked.fulfilled, (state,action) => {
    return {
      ...state,
      // 既存の投稿データをmapでひとつひとつ展開して、更新部分のIDと比較し、更新されている部分のみ追加で格納
      posts: state.posts.map((post) =>
      post.id === action.payload.id ? action.payload : post
      ),
    };
  });
},
});


// 上記の内容（REducer側の内容を）を実際に使用できるように、Exportしていく（下記を書き換えていく）
// postsliceの中身似合うように書き換え
export const { 
  fetchPostStart,
  fetchPostEnd,
  setOpenNewPost,
  resetOpenNewPost,
} = postSlice.actions;
// 下記はstoreの中のisLoadingAuthという関数を返してくれ流関数。authの部分はstore.tsのauthと名前が一緒である必要あり
export const selectIsLoadingAuth = (state: RootState) =>
  state.auth.isLoadingAuth;

// 下記はStateの状態を確認するためのもの、RootStateでまとめて状態を確認できる
// ここでStoreの中のStateを確認できるようにexportしておく。
export const selectIsLoadingPost = (state: RootState) =>
state.post.isLoadingPost;
export const selectOpenNewPost = (state: RootState) => state.post.openNewPost;
export const selectPosts = (state: RootState) => state.post.posts;
export const selectComments = (state: RootState) => state.post.comments;

// 下記もSlice情報postに変更
export default postSlice.reducer;

// 次は、非同期関数のアクションはAuthSliceの外に書いていく必要があるため、上から10行目のApiURLのしたから記載する
// JWTトークンの取得をReacT側で設定するしょり