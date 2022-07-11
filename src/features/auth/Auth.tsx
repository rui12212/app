import React from "react";
// exportしていたDispatchの型をimport
import { AppDispatch } from "../../app/store";
// useSelecttorとUseDispatchの二つが必要のため、下記をimport
import { useSelector, useDispatch } from "react-redux";
// さっき作ったauth.module.cssもインポート、それをstyleに格納
import styles from "./Auth.module.css";
// reactのmodalもつかうため下記もインポート
import Modal from "react-modal";
// 入力フォームのValidationで、今回はformikとyupを使用するため、下記もインポート
import { Formik } from "formik";
import * as Yup from "yup";
// 続いてmaterial-uiから三つのコンポーネントをインポート
import { TextField, Button, CircularProgress } from "@material-ui/core";
// 最後に、authsliceで定義していたコンポーネントで使用する関数群をインポートする

// import { fetchAsyncGetPosts, fetchAsyncGetComments } from "../post/postSlice";
import {
    // selectから始まるものはUseselectに関係している
    selectIsLoadingAuth,
    selectOpenSignIn,
    selectOpenSignUp,
    // 下記のグループはreducerの部分に関係
    setOpenSignIn,
    resetOpenSignIn,
    setOpenSignUp,
    resetOpenSignUp,
    // fetchから始まるものは非同期関数に関係している
    fetchCredStart,
    fetchCredEnd,
    fetchAsyncLogin,
    fetchAsyncRegister,
    fetchAsyncGetMyProf,
    fetchAsyncGetProfs,
    fetchAsyncCreateProf,
} from "./authSlice";

// 下記でModal(loginUser/passワードを打つ小さい画面)のstyleを定義
// overlayyはModal以外の背景（灰色）を設定
const customStyles = {
    overlay: {
        backgroundColor: "#777777"
    },
    // モーダルの位置が、上から55％、左から５０％の位置に設定
    content: {
        top: "55%",
        left: "50%",
// moalの幅と高さを指定
// paddingh余白の大きさを指定
        width: 280,
        eight: 350,
        padding: "50px",

        transform: "translate(-50%, -50%)",
    },
};


// 下記を書き換え、REactのコンpー年との場合は、型を書く必要がある
const Auth: React.FC = () => {
    // 使われるLogのIDを指定する必要がある。index.tsxの中の大元の名前がRootになっているため、下記でRootで指定
    Modal.setAppElement("#root");
    // authsliceの中のモーダルの表示・非表示を制御する部分のStateを参照するため
    const openSignIn = useSelector(selectOpenSignIn);
    const openSignUp = useSelector(selectOpenSignUp);
    const isLoadingAuth = useSelector(selectIsLoadingAuth);
    // 最後にDispatchの実態を作っておく必要がある
    const dispatch: AppDispatch = useDispatch();

    return (
    <>
        <Modal
           isOpen={openSignUp}
        //    下記はModalの小窓以外の場所をクリックした時に自動でModalを閉じてくれる
        // dispatchでauthSliceからresetOpenSignupをfalseの状態で呼び出すことで、上記を可能にする
           onRequestClose={async () => {
               await dispatch(resetOpenSignUp());
           }}
        //    Modalのスタイルを定義するために、このファイル39行目のcustom.sttylを呼び出している
           style={customStyles}
        // 下記からModalの中身を作っていく 。Formikの部分をまずは追記
        >
            <Formik
            // Formikの機能で、下記はアクセスしたての時、Emailは空の状態になる。それをErrorと認識させるための処理。ReuiredのErrorにしている
                 initialErrors={{ email: "required"}}
                //  次に入力フォームで管理するValueを定義。今回はEmailとPasswordを空のValueで指定し初期化。この2つにValidationがかけられる
                 initialValues={{ email: "", password: ""}}
                //  Submitボタンがおされたときの処理を記載。Valuesの中には、Userが記載した情報が入る。email/passなど

                 onSubmit={async (values) => {
                    //  FetchCredをスタートさせる（モーダルはTrueで表示される）
                   await dispatch(fetchCredStart());
                //    authslice.tsのfetchAsyncRegisterにvaluesにユーザーのemail/passを渡すことで、新規登録
                // 上記の処理はresultRegの中に入れられる
                   const resultReg = await dispatch(fetchAsyncRegister(values));

// 　　　　　　　　　　　上記が成功したときだけ、下記の処理が行われる
                   if (fetchAsyncRegister.fulfilled.match(resultReg)) {
                    //    下記はauthsliceのfetchAsyncLogInの非同期関数につがなり、JWTのアクセストークンを取得
                       await dispatch(fetchAsyncLogin(values));
                    //    同じようにAuthsliceと繋がっている
                       await dispatch(fetchAsyncCreateProf({ nickName: "anonymous"}));

                       await dispatch(fetchAsyncGetProfs());
                    //    await dispatch(fetchAsyncGetPosts());
                    //    await dispatch(fetchAsyncGetComments());
                       await dispatch(fetchAsyncGetMyProf());
                    }
                    // Fetchendを呼び出しえ、処理の終わり＝Modalの非表示をする
                     await dispatch(fetchCredEnd());
                    //  モーダルを閉じている
                     await dispatch(resetOpenSignUp());
                  }}
                  validationSchema = {Yup.object().shape({
                    //   下記Email・PassWordで＝Validationしたいパラメーターを記載できる
                    // その中でも、.email .requiredと、ドットを繋ぐことで条件を追記できる。（）内はErrorになった時の表示
                    email: Yup.string()
                    // .emailでemailのフォーマットに準拠しているかを確認してくれる
                     .email("email format is wrong")
                    //  .requirredはEmailが空かどうかを確認してくれる
                     .required("email is must"),
                    //  パスワードの必要最小文字数を４としている
                    password: Yup.string().required("password is must").min(4),
                  })}
                //   この下からはFormikの内容を書いていく
                >
                    {({
                        handleSubmit,
                        handleChange,
                        handleBlur,
                        values,
                        errors,
                        touched,
                        isValid,
                    }) => <div></div>}
                    </Formik>
                </Modal>
            </>
        );
    };


    // 今から作るのは二つ。新規UserのREgister用のModalとログイン認証用のModal

export default Auth;