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

import { fetchAsyncGetPosts, fetchAsyncGetComments } from "../post/postSlice";
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
        height: 350,
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
                       await dispatch(fetchAsyncGetPosts());
                       await dispatch(fetchAsyncGetComments());
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
// 下記はformikですでに入っているフォーマット、下記を引数にすることで、機能を使用することができる
                        handleSubmit,
                        handleChange,
                        handleBlur,
                        // Valuesはユーザーが入力している値を取得できる
                        values,
                        // Errorメッセージをここからしゅとくすることができる
                        errors,
                        // 入力フォーカスに一度でもカーソルが当たった場合にTrueになる
                        touched,
                        // Validationが妥当だった場合、Trueをもつ
                        isValid,
                        }) => (
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.auth_signUp}>
                                    <h1 className={styles.auth_title}>SNS clone</h1>
                                    <br />
                                    {/* 非同期関数でデータを取得している時にくるくるまわるやつ */}
                                    <div className={styles.auth_progress}>
                                        {/* isloadingAuthがtrueの時のみサークルが表示されるようになっている */}
                                        {isLoadingAuth && <CircularProgress />}
                                    </div>
                                    <br />

{/* ログインのサインアップ画面のモーダルの表示方法と処理 */}
                                    <TextField
                                    // モーダルで自動で表示されるもじ
                                        placeholder="email"
                                        type="input"
                                        name="email"
                                        // formikですでに使用できる下記2つの機能を使用。OnChangeにすることで、Userが文字を変更するたびにhandleChange関数を自動で走らせてくれる
                                        onChange={handleChange}
                                        // onBlurは入力フォームのモーファルからカーソルを範囲外に移動させた時にvalidationを実行してくれる
                                        onBlur={handleBlur}
                                        value={values.email} 
                                    />
                                    {/* 下記はErrorメッセージの表示 */}
                                    {/* emailがエラーになり、一度でもフォーっカスが当たっている時に両方trueになる。その時にErrorメッセ〜zの表示 */}             
                                    {touched.email && errors.email ? (
                                        // Authmodule.cssでErrorメッセージのCSSを取得
                                        <div className={styles.auth_error}>{errors.email}</div>
                                        // エラー表示がない時はNullの表示
                                    ) : null}
                                    {/* 同じ要領でパスワードの設定もおこなう */}

                                    <TextField
                                    placeholder="password"
                                    type="password"
                                    name="password"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.password}
                                    />
                                    {touched.password && errors.password ? (
                                        <div className={styles.auth_error}>{errors.password}</div>
                                    ) : null}
                                    <br />
                                    <br />

                                    <Button
                                    variant="contained"
                                    color="primary"
                                    // isvalidが反転する＝Trueでない場合、DisableをTrueにして何もLOGINができないようになる
                                    disabled={!isValid}
                                    type="submit"
                                    >
                                    Login
                                    </Button>
                                    <br />
                                    <br />
                                    {/* 以下はログインとサインアップを切り替える文字表示（「アカウントがありませんか？」 */}
                                    <span
                                       className={styles.auth_text}
                                       onClick={async () => {
                                        //    OpenSignInを開いて、OpenSignUpをReset（取り消し）している
                                           await dispatch(setOpenSignIn());
                                           await dispatch(resetOpenSignUp());
                                       }}
                                    >
                                        You already have a account ?
                                    </span>                               
                                </div>
                            </form>
                         </div>
                        )}
                    </Formik>
                </Modal>

                <Modal
                isOpen={openSignIn}
                onRequestClose={async () => {
                    await dispatch(resetOpenSignIn());
                }}
                style={customStyles}
            >
                <Formik
                initialErrors={{ email: "requested "}}
                initialValues={{ email: "", password: ""}}
                onSubmit={async (values) => {
                    await dispatch(fetchCredStart());
                    const result = await dispatch(fetchAsyncLogin(values));
                    // ログインが成功した場合は、プロフィール情報を全てとってくる
                    if (fetchAsyncLogin.fulfilled.match(result)) {
                        await dispatch(fetchAsyncGetProfs());
                        await dispatch(fetchAsyncGetPosts());
                        await dispatch(fetchAsyncGetComments());
                        await dispatch(fetchAsyncGetMyProf());
                    }
                    // 下記でIsLoadingのステートをFalseにする
                    await dispatch(fetchCredEnd());
                    // 下記でSignInのモーダルを閉じるDispatchをよんでいる
                    await dispatch(resetOpenSignIn());
                }}
// 下記でEmailのValidationを実行。Registerの時のValidationと一緒。
                validationSchema = {Yup.object().shape({
                    email: Yup.string()
                    .email("email format is wrong")
                    .required("emai is must"),
                    password: Yup.string().required("password is must").min(4),
                })}
                >
                    {({
                        handleSubmit,
                        handleChange,
                        handleBlur,
                        values,
                        errors,
                        touched,
                        isValid,
                    }) => (
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.auth_signUp}>
                                <h1 className={styles.auth_title}>SNS clone</h1>
                                <br />
                                <div className={styles.auth_progress}>
                                    {isLoadingAuth && <CircularProgress/>}
                                </div>
                                <br />
                                <TextField
                                placeholder="email"
                                type="input"
                                name="email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                                />

                                {touched.email && errors.email ? (
                                    <div className={styles.auth_error}>{errors.email}</div>
                                ) : null}
                                <br />

                                <TextField
                                placeholder="password"
                                type="password"
                                name="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                                />
                                {touched.password && errors.password ? (
                                    <div className={styles.auth_error}>{errors.password}</div>
                                ) : null}
                                <br />
                                <br />

                                <Button
                                variant="contained"
                                color="primary"
                                disabled={!isValid}
                                type="submit"
                                >
                                    Login
                                </Button>
                                <br />
                                <br />
                                <span
                                className={styles.auth_text}
                                onClick={async () => {
                                    // サインインのモーダルを閉じて、レジスターようのモーダルを開く
                                    await dispatch(resetOpenSignIn());
                                    await dispatch(setOpenSignUp());
                                }}
                                >
                                    You don't have an account ?
                                </span>
                            </div>
                            </form>
                    </div>
                )}
                </Formik>
            </Modal>
            </>
        );
    };


    // 今から作るのは二つ。新規UserのREgister用のModalとログイン認証用のModal

export default Auth;