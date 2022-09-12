import React from "react";
// app.module.cssを読み込むように書き換え、その内容をstylesの中に格納する
import styles from "./App.module.css";
import Core from "./features/core/Core";

function App() {
  return (
    <div className={styles.app}>
      <Core />

   
    </div>
  );
}

export default App;
