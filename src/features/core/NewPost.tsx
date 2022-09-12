import React, { useState } from "react";
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import styles from "./Core.module.css";
import { File } from "../types";

import {
    selectOpenNewPost,
    resetOpenNewPost,
    fetchPostStart,
    fetchPostEnd,
    fetchAsyncNewPost,
} from "../post/postSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

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



const NewPost : React.FC = () => {

    const dispatch : AppDispatch = useDispatch();
    const openNewPost = useSelector(selectOpenNewPost);

    const [image, setImage] = useState<File | null>(null);
    const [title, setTitle] = useState("");


    // アイコンを押すだけでFileにアクセスできるようにする
    const handlerEditPicture = () => {
        const fileInput = document.getElementById("imageInput");
        fileInput?.click();
    };

    // swubmitボタンが押される時の関数
    const newPost = async(e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const packet = {title: title, img: image };
        await dispatch(fetchPostStart());
        await dispatch(fetchAsyncNewPost(packet));
        await dispatch(fetchPostEnd());
        setTitle("");
        setImage(null);
        dispatch(resetOpenNewPost());
    };


    return (
        <>
        <Modal
        isOpen={openNewPost}
        onRequestClose={async () => {
            await dispatch(resetOpenNewPost());
        }}
        style={customStyles}
        >
            <form className={styles.core_signUp}>
                <h1 className={styles.core_title}>SNS clone</h1>

                <br />
                <TextField
                placeholder="Please enter caption"
                type="text"
                onChange={(e) => setTitle(e.target.value)}
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
                // title.image両方設定しないとボタンが押せないようになっている
                disabled={!title || !image}
                variant="contained"
                color="primary"
                // 51行のNewPostの関数を起動させる。新規でPostを作る
                onClick={newPost}
                >
                    New Post
                </Button>
            </form>
        </Modal>
        </>
    );
};

export default NewPost;