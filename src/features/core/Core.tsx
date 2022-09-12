import React, { useEffect } from "react";
import Auth from "../auth/Auth";


// core.cssの内容をimport
import styles from "./Core.module.css";
// redux storeにアクセスするため、下記2行を追加
import { useSelector, useDispatch  } from "react-redux";
import { AppDispatch } from "../../app/store";

// materialUI関連で下記を追加
import { withStyles } from "@material-ui/core/styles";
import {
    Button,
    Grid,
    Avatar,
    Badge,
    CircularProgress,
}from "@material-ui/core";

import { MdAddAPhoto } from "react-icons/md";

// authSliceから必要な内容をimport

import {
    editNickname,
    selectProfile,
    selectIsLoadingAuth,
    setOpenSignIn,
    resetOpenSignIn,
    resetOpenSignUp,
    setOpenSignUp,
    setOpenProfile,
    resetOpenProfile,
    fetchAsyncGetMyProf,
    fetchAsyncGetProfs,
} from "../auth/authSlice";


// postSliceからも下記機能をimport
import {
    selectPosts,
    selectIsLoadingPost,
    setOpenNewPost,
    resetOpenNewPost,
    fetchAsyncGetPosts,
    fetchAsyncGetComments,
} from "../post/postSlice";

import Post from "../post/Post";
import { PostAdd } from "@material-ui/icons";
import EditProfile from "./EditProfile";
import NewPost from "./NewPost";


const StyledBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: "#44b700",
      color: "#44b700",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "$ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  }))(Badge);
  

// 下記内容は31の講義内容で確認
const Core: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    // 下記4つのステートをReduxのstoreから読んでくる
    const profile = useSelector(selectProfile);
    const posts = useSelector(selectPosts);
    const isLoadingPost = useSelector(selectIsLoadingPost);
    const isLoadingAuth = useSelector(selectIsLoadingAuth);

    // ブラウザが起動された時の処理として下記を記載
    // 91行で独自の関数を作って、105行でそれを実行する
    useEffect(() => {
        const fetchBootLoader = async () => {
            // JWTがあるかどうかを確認
            if (localStorage.localJWt) {
                // JWTgaある場合は、resetOpenSignIn()を起動して、Singinのモーダルをクローズ
                dispatch(resetOpenSignIn());
                // その後、fetchAsyncGetMyProfでログインしているUserのプロフィールを確認してくる
                const result = await dispatch(fetchAsyncGetMyProf());
                // JWTの有効期限が切れている場合は、Rejectになるから、そのときは(setOpenSignIn()でモーダルを開く
                if (fetchAsyncGetMyProf.rejected.match(result)) {
                    dispatch(setOpenSignIn());
                    return null;
                }
                // fetchAsyncGetMyProf()これが成功したときは、下記3つの処理を実行
                // プロフィール、投稿、コメントの一覧を全て取得する
                await dispatch(fetchAsyncGetPosts());
                await dispatch(fetchAsyncGetProfs());
                await dispatch(fetchAsyncGetComments());
            }
        };
        fetchBootLoader();
    },[dispatch]);
//  ここからはログイン画面のデザイン設計
    return (
        <div>
            <Auth />
            {/* 下記一行はedhitprofile作成ごに記載。上手くいくと52行目のように、自動でインポーっとされる */}
            <EditProfile />
            {/* 下記一行はNewpostの記載が終わってから入れる */}
            <NewPost />
            <div className={styles.core_header}>
            <h1 className={styles.core_title}>SNS clone</h1>
            {/* 以下、ログインしているとき＝nickNameの情報が取得できているときとそうじゃない時で表示を変える */}
            {/* 取得できているときは<></>までを実行 */}
            {/* 下記1行は、Profileが存在するときに、この式を評価するという意味の？記号 */}
            {profile?.nickName ? (
              <>
              {/* 以下画像投稿用のデザイン カメラのマーク */}
                <button
                  className={styles.core_btnModal}
                //   クリックされたら下記を実行する
                  onClick={()=> {
                    dispatch(setOpenNewPost());
                    dispatch(resetOpenProfile());
                  }}
                  >
                    <MdAddAPhoto />
                  </button>
                  {/* 下記からログアウト用のボタンを設置 */}
                  <div className={styles.core_logout}>
                    {/* CircularProglesの設定追加.IsLoadingAuth/IsLoadingAuthgafalse,fetchで情報をとっているときにクルクルを出す*/}
                    {(isLoadingPost || isLoadingAuth) && <CircularProgress /> }

                    <Button
                    onClick= {() =>  {
                        // ボタンが押されたとき、JWTの中に入っているItemを自動で削除してくれる
                        localStorage.removeItem("localJWT");
                        // Nicknameが入っているときはブランクで初期値に戻す
                        dispatch(editNickname(""));
                        // 下記二つでログイン用のもーだっるを閉じる
                        dispatch(resetOpenProfile());
                        dispatch(resetOpenNewPost());
                        // ログインを促すモーダルを開く
                        dispatch(setOpenSignIn());
                    }}
                    >
                        Logout
                  </Button>
                  <button
                  className={styles.core_btnModal}
                  onClick={() =>  {
                    dispatch(setOpenProfile());
                    dispatch(resetOpenNewPost());
                  }}
                  >
                  <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                >
                  <Avatar alt="who?" src={profile.img} />{" "}
                </StyledBadge>
                </button>
              </div>
            </>
            // 下記は条件式。下記Divタグの中にログアウトしている時のSignUp/LogInが表示されるように作っていく
          ) : (
            <div>
              <Button 
              onClick={() => {
                // ログインが押されたときはSignInを開いてSignUpを閉じる
                dispatch(setOpenSignIn());
                dispatch(resetOpenSignUp());
              }}
              >
                LogIn
              </Button>
              <Button
              onClick={() => {
                // サインアップは上記の逆
                dispatch(setOpenSignUp());
                dispatch(resetOpenSignIn());
              }}
            >
              SignUp
              </Button>
            </div>
// NickName情報取得できないときは、下記を実行
          )}
        </div>
{/* ログインしている時だけ投稿の一覧を３列でズラーっと表示させたい */}
{/* 下記でnicknameがある時だけフラグメント（<></>）の中身を表示させるように指示 */}
         {profile?.nickName && (
         <>
        <div className={styles.core_posts}>
         <Grid container spacing={4}>
            {/* PostをstoreからUseselectorで読んできていたため、PostにAPIから読み込んだ投稿一覧が入っている */}
          {posts
          .slice(0)
          // 一番最新の投稿を左上に持ってきたいため、reverseを使用
          .reverse()
          // Mapで一つ一つPostのオブジェクトを呼び出している
          .map((post) => (
            // 投稿は横にいくつ並ぶかを指定
            <Grid key={post.id} item xs={12} md={4}>
              {/* これから作るPostコンポーネントの中で、したの情報をPROPSを使って渡していく */}
              <Post
              postId={post.id}
              title={post.title}
              loginId={profile.userProfile}
              userPost={post.userPost}
              imageUrl={post.img}
              liked={post.liked}
              />
            </Grid>
          ))}
          </Grid>
         </div>
        </>
    )}
      </div>
    );
};

export default Core;