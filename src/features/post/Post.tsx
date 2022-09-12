import React, { useState } from 'react'
import styles from "./Post.module.css";
// materialUI関係下記二つをインポート
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Divider, Checkbox } from "@material-ui/core";
// いいねボタンのハートマークをインポート
import { Favorite, FavoriteBorder } from "@material-ui/icons";
// avatarがグループ表記になったときに使える表現
import AvatarGroup from "@material-ui/lab/AvatarGroup";
// redux-toolkit関連で下記二つをインポート
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store"; 
// authsliceから下記をインポート。authSLiceがStoreの中のステートを参照することが可能
import { selectProfiles } from "../auth/authSlice";
// postSliceからも必要な機能をインポート
import {
    // コメントの一覧の情報取得
    selectComments,
    // 投稿形のfetchの状態を管理するもの
    fetchPostStart,
    fetchPostEnd,
    fetchAsyncPostComment,
    fetchAsyncPatchLiked,
} from "./postSlice";

// 下記はCore.tsx218行で指定した内容をPROPS引き受ける。そのときにPROPSのデータ型を指定する必要がある。
// 型の指定はTypes.tsにて行う
// 型指定したものをここでも使えるように呼び出す
import { PROPS_POST } from "../types";
// Userの小窓表示のサイズを指定
 const useStyles  = makeStyles((theme) => ({
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginRight: theme.spacing(1),
    },
 }));

//  PROPSのデータ型を＜＞（ジェネリックす）を使って指定
const Post: React.FC<PROPS_POST> = ({
    postId,
    loginId,
    userPost,
    title,
    imageUrl,
    liked,
}) => {
    // returnの上に定数を定義している
    // usestylesを使えるように、classesという関数を作ってuseStylesの結果を入れ込む
    const classes = useStyles();
    // dispatchの実態をuseDispatchで作っておく
    const dispatch: AppDispatch = useDispatch();
    // Profile/Commmentsの一覧をUseSelectorを使ってローカル変数であるprofiles/commentに入れる
    const profiles = useSelector(selectProfiles);
    const comments = useSelector(selectComments);
    // 投稿へのコメント内容をテキストとして保持するために下記を追加.usestateでてxt属性を作っておく
    const [text, setText] = useState("");
    // commentsの一覧情報から、PostIdにあう内容を抜き出してcommnetsonPostに格納する処理
    const commentsOnPost = comments.filter((com) => {
        return com.post === postId;
    });
    // profの中にuseProfileの情報を抜き出して入れる処理
    const prof = profiles.filter((prof) => {
        return prof.userProfile === userPost;
    });
    // commentsを記入してPostボタンが押された時の処理
    // asyncの後の（）はイベントオブジェクとを引数として代入している
    const postComment = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        // packetの中に、userが投稿したテクストの内容と投稿のIDを格納
        const packet = {text: text, post: postId};
        await dispatch(fetchPostStart());
        // 下記をFetchすることで、新しくコメントを作っている
        await dispatch(fetchAsyncPostComment(packet));
        await dispatch(fetchPostEnd());
        setText("");
    };

    // いいねボタンが押されたときに、Likedの属性変更する処理
    const handlerLiked = async () => {
        // この関数でもpacketとというオブジェクトを作って、89行目にオブジェクトとして渡す
        // 下記はPROPSで受け取ったものをそのまま受け取っている
        const packet = {
            id: postId,
            title: title,
            current: liked,
            // Newは新しくいいねを押してくれた人。ログインしている人のIDといっちするため、それを割り当て
            new: loginId,
        };
        await dispatch(fetchPostStart());
        await dispatch(fetchAsyncPatchLiked(packet));
        await dispatch(fetchPostEnd());
    };


// returnで投稿がある時だけ画面を表示するようにしたい。条件文を作成
// Titleがある＝投稿ができている
if (title) {
    // postmodulecssで設定した色味や行間などを追加
    // 102行目からはAvatar画像とNickamを追記
    return (
    <div className={styles.post}>
        <div className={styles.post_header}>
            {/* profには画像データが格納されているため、SRCとして設定 */}
            <Avatar className={styles.post_avatar} src={prof[0]?.img} />
            {/* Userの画像とニックネームが表示されるようになる */}
            <h3>{prof[0]?.nickName}</h3>
        </div>
        {/* 実際に投稿されたイメージを表示している PROPSで受け取った内容をSRCにあてている*/}
        <img className={styles.post_image} src={imageUrl} alt=""/>
        {/* いいねの表示、いいねをしたUserと投稿のタイトル表示 */}
        <h4 className={styles.post_text}>
            {/* 下記はいいねのチェックボックス */}
            <Checkbox
            className={styles.post_checkBox}
            // favoriteは既存の関数的なやつ、ほかにもカスタマイズしてみたい
            icon={<FavoriteBorder/>}
            checkedIcon={<Favorite />}
            // likedのなかにはいいねをつけたUSerのリストが入っている。
            // ここではログインしているUserIDといいねの中にある、いいねをつけたUserIDを比較
            // 一致した場合はいいねマークにチェックがつくようになっている
            checked={liked.some((like) => like === loginId)}
            onChange={handlerLiked}
            />
            <strong> {prof[0]?.nickName}</strong> {title}
            {/* 下記はいいねをつけたアバター画像を全て取得している。7つまでその画面で見れる */}
            <AvatarGroup max={7}>
                {/* MapでいいねをつけたUserIDを取得。 */}
                {liked.map((like) => (
                    <Avatar
                    className={styles.post_avatarGroup}
                    // いいねをつけたUserIDをKeyにして、プロフィールにつなぎ、そこから画像を探して読み込んで、Avatarに貼りつけている
                    key={like}
                    src={profiles.find((prof) => prof.userProfile === like)?.img}
                    />
                ))}
            </AvatarGroup>
        </h4>

        {/* 下記はコメントしたUserとコメントの表示の処理 */}
       <Divider />
       <div className={styles.post_comments}>
        {/* CommentsOnPostの中にある投稿に対するコメントが全て入っている */}
        {/* Mapでそれをひとつひとつ見ていく */}
        {commentsOnPost.map((comment) => (
            <div key= {comment.id} className={styles.post_comment}>
                <Avatar
                src ={
                    // UserCommentの中にUserIDが入っているため、それと一致するPofileを取得
                    // 一致したProfileの中にある画像情報を取得。Avatarに貼り付け
                    profiles.find(
                        (prof) => prof.userProfile === comment.userComment
                    )?.img
                }
                    className={classes.small}
                    />
                    <p>
                        <strong className={styles.post_strong}>
                            {
                                // Nicknameの取り出し方法も同様
                                profiles.find(
                                    (prof) => prof.userProfile === comment.userComment
                                )?.nickName
                            }
                        </strong>
                        {/* コメントのテキスト表示 */}
                    {comment.text}
                    </p>
                    </div>
                ))}
             </div>
{/* 最後コメントを書くボックスを表示＋￥新規投稿するための表示 */}
             <form className={styles.post_commentBox}>
                {/* inputでUserはコメントを追記できる */}
                <input
                // Usestateを使ってUserがタイピングをするとsetTextを読んで、その中身を書き換える
                className={styles.post_input}
                type="text"
                placeholder="add a comment"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button
            // テキストが0、何も打ち込まれていない場合はDisabledをTrue＝何も打ち込めないようになっている
            disabled={!text.length}
            className={styles.post_button}
            type="submit"
            // submitボタンが押された時はpostCommentの関数が呼ばれるようになっている
            // 68-76行までが呼ばれる
            onClick={postComment}
            >
            Post
            </button>
        </form>
    </div>
    );
    }
    return null;
};

export default Post;

