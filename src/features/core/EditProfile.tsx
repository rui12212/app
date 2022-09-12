import React, { useState } from "react" ;
import Modal from "react-modal";
import styles from "./Core.module.css";

import { useSelector, useDispatch } from "react-redux";
import {AppDispatch } from "../../app/store";

// 新規のModalで画像を読み込む際に、画像ファイルのデータ型を指定しなければいけないため
import { File } from "../types";

// authSliceから今回使う機能をインポート
import {
    editNickname,
    selectProfile,
    selectOpenProfile,
    resetOpenProfile,
    fetchCredStart,
    fetchCredEnd,
    fetchAsyncUpdateProf,
} from "../auth/authSlice";

// アイコンのインポート
import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

// ModalのスタイルをCUstomestylesで定義
const customStyles = {
    content: {
        top: "55%",
        left: "50%",

        width: 280,
        height: 220,
        padding: "50px",

        transform: "translate(-50%, -50%)",
    },
};



const EditProfile: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const openProfile = useSelector(selectOpenProfile);
    const profile = useSelector(selectProfile);
    const [image, setImage] = useState<File | null>(null);

    // ModalでUpdateボタンが押された時の処理、これでかえることができる
    const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        // packetをセットし、下記の情報を引数にして、55行の非同期関数をじっこうできるようにする
        const packet = { id: profile.id, nickName: profile.nickName, img: image};

        await dispatch(fetchCredStart());
        await dispatch(fetchAsyncUpdateProf(packet));
        await dispatch(fetchCredEnd());
        // 上記Fetchが完了したときに、OpenProfileを閉じるようにする
        await dispatch(resetOpenProfile());
    };

    const handlerEditPicture = () => {
        const fileInput = document.getElementById("imageInput");
        fileInput?.click();
    };

    return (
    <>
    <Modal
    isOpen={openProfile}
    // Modal以外の場所をクリックすると閉じるようになっている
    onRequestClose={async () => {
        await dispatch(resetOpenProfile());
    }}
    style={customStyles}
    >
        <form className={styles.core_signUp}>
            <h1 className={styles.core_title}>SNS clone</h1>

            <br />
            <TextField
            placeholder="nickname"
            type="text"
            value={profile?. nickName}
            onChange={(e) => dispatch(editNickname(e.target.value))}
            />

            <input
            type="file"
            id="imageInput"
            hidden={true}
            onChange={(e) => setImage(e.target.files![0])}
            />
            <br />
            <IconButton onClick={handlerEditPicture}>
                <MdAddAPhoto />
            </IconButton>
            <br />
            <Button
            disabled={!profile?.nickName}
            variant="contained"
            color="primary"
            type="submit"
            onClick={updateProfile}
            >
                Update
            </Button>
        </form>
    </Modal>
    </>
    );
};

export default EditProfile;
