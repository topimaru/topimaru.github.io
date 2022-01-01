import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { colorToHex, draw } from "./utils/braille";

const markdownString = `
# 免責歩合約款

* この弾幕の作り方は秒で直せるバグを利用したもので、**いつでも使えなくなる**可能性があります。
* 運営にバレたらアカウントがBANされるかも知れません。ご利用にご注意お願い致します。

# 「トークン」って何だ？

「トークン」(token)はあなたのアカウントの情報を変える権限を持っている文字列です。

**⚠️ ぜったい誰にも見せないようにご注意お願い致します。**

# 「トークン」を見つける方法は？

「トークン」はトピアアプリの一般的な使い方では見つかりません。**Android**ユーザーの場合、[**HttpCanary**](https://play.google.com/store/apps/details?id=com.guoshi.httpcanary)と言うアプリを使って取得できます。**iOS**の場合は、、、恐らく出来ないかも知れません。😉

## 1. HttpCanaryをインストール

HttpCanaryをダウンロードして、最初の案内通り設置を行ってください。

⚠️ 下の画面が現れる時は**SKIP（スキップ）ボタン**を押してください。
![Skip（スキップ）ボタンを押してください。](/images/1.png)

⚠️ 下の画面が現れる時は**右上のSKIP（スキップ）ボタン**を押してください。
![Skip（スキップ）ボタンを押してください。](/images/2.png)

## 2. トピアのアプリを監視

左からメニューを開けて**Target Apps**ボタンを押してください。そして**右上のプラスボタン**を押して**トピアを選択**してください。

![右上のプラスボタンを押してください。](/images/3.png)

![トピアを選択してください。](/images/4.png)

**バックボタン**を押してメインページに戻る後、**右下の紙飛行機のボタン**を押してください。

![右下の紙飛行機のボタンを押してください。](/images/5.png)

## 3. トピアを開く

そのまま**HttpCanaryアプリをバッググラウンド状態**にして、トピアを開いてください。ローディングが終わるまで少しお待ちください。

![トピアを開いてください。](/images/6.png)

## 4. 「トークン」をコピー

HttpCanaryアプリに戻って紙飛行機ボタンをもう一回押して監視を解除します。そして、一番下にある**https://api.topia.tv/self**を押してください。

![https://api.topia.tv/selfを押してください。](/images/7.png)

上の**Request**メニューをタップしたら下の画面が見れます。

![Requestメニューをタップしてください。](/images/8.png)

一番長い**authorization**って書いている項目を押して**Copy Value**ボタンを押したら完了です！トークンがクリップボードにコピーできました。あの文字列をペーストしてください。

![authorization項目をCopy Valueしてください。](/images/9.png)
`;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const [string, setString] = useState("");
  const [token, setToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState<boolean | null>(false);
  const [instructionVisible, setInstructionVisible] = useState(false);
  const [m, setM] = useState(3);
  const [s, setS] = useState(2);
  const [isSubmitting, setSubmitting] = useState(false);

  const timeout = useRef<number>();

  useEffect(() => {
    // TODO: change to a more secure method
    if (localStorage.getItem("nekot")) {
      setTokenStatus(true);
      setToken(localStorage.getItem("nekot")!);
    } else {
      setTokenStatus(false);
    }
  }, []);

  useEffect(() => {
    setTokenStatus(null);
    if (!token) {
      setTokenStatus(false);
      return;
    }

    timeout.current = setTimeout(() => {
      if (!token) {
        setTokenStatus(false);
        return;
      }

      fetch(
        "https://g76vv6ys0j.execute-api.us-east-1.amazonaws.com/dev/validate",
        {
          method: "POST",
          body: token,
        }
      )
        .then((response) => response.json())
        .then((response) => {
          if (response.success) {
            setTokenStatus(true);
            // TODO: change to a more secure method
            localStorage.setItem("nekot", token);
          } else {
            setTokenStatus(false);
          }
        });
    }, 300) as unknown as number;

    return () => {
      clearTimeout(timeout.current);
    };
  }, [token]);

  const render = async (x: number = 3) => {
    const ctx = canvasRef.current?.getContext("2d");
    const image = inputRef.current?.files?.[0];
    if (!image || !ctx || !preRef.current) {
      setM(Math.min(x, 3.5));
      return;
    }

    if (!x || !s) return;
    const result = await draw(ctx, image, Math.min(x, 3.5));

    preRef.current.innerHTML = result
      .map((row) =>
        row
          .map(
            ([b, c]) =>
              `<span style="color: ${colorToHex(
                c
              )}; text-shadow: 0 0 calc(2.5 * min(1vh, 1vw)) ${colorToHex(
                c
              )}, 0 0 calc(2.5 * min(1vh, 1vw)) ${colorToHex(c)};">${b}</span>`
          )
          .join("")
      )
      .join("\n");
    setM(Math.min(x, 3.5));

    setString(
      JSON.stringify({
        user_comment_template: {
          content:
            `<b><size=${Math.round(
              ((5 + Math.floor(8 / Math.min(3, x))) * (s + 2)) / 4
            )}>\n` +
            result
              .map((row) =>
                row
                  .map(([b, c]) => `<color=${colorToHex(c)}>${b}</color>`)
                  .join("")
              )
              .join("\n") +
            "\n</size></b>",
        },
      })
    );
  };

  const submit = () => {
    if (!string) return;

    setSubmitting(true);

    fetch("https://g76vv6ys0j.execute-api.us-east-1.amazonaws.com/dev/", {
      method: "POST",
      body: JSON.stringify({ token, string }),
    })
      .then(async (r) => [r.status, await r.json()])
      .then(([status, json]) => {
        if (status > 299) {
          alert("エラーが発生しました。解像度を下げてもう一回試みてください。");
        }
        setSubmitting(false);
      });
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "black",
        color: "white",
      }}
    >
      {instructionVisible && (
        <div
          style={{
            width: "calc(100% - 64px)",
            height: "calc(100% - 64px)",
            position: "absolute",
            display: "flex",
            backgroundColor: "black",
            justifyContent: "center",
            padding: "32px",
          }}
        >
          <div
            className="markdown"
            style={{
              overflowY: "auto",
              width: "calc(100% - 64px)",
              height: "calc(100% - 64px)",
              maxWidth: "50em",
              backgroundColor: "white",
              borderRadius: "32px",
              padding: "32px",
              color: "black",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 64,
                right: 64,
                fontSize: "2rem",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setInstructionVisible(false)}
            >
              ❌
            </div>
            <div>
              <ReactMarkdown children={markdownString} />
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minWidth: "calc(min(100vh, 100vw))",
            maxWidth: "50em",
            minHeight: "calc(min(100vh, 100vw))",
            width: "100%",
          }}
        >
          <div
            style={{
              height: "24px",
              lineHeight: "24px",
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 16px 0px",
              width: "calc(100% - 32px)",
              fontSize: "13px",
              fontWeight: "900",
            }}
          >
            <div
              style={{
                height: "24px",
                lineHeight: "24px",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 8px 0px",
                width: "fit-content",
                fontSize: "13px",
                fontWeight: "900",
                backgroundColor: "#ff6b9a",
                borderRadius: 8,
                cursor: "pointer",
              }}
              onClick={() => setInstructionVisible(true)}
            >
              ➡️ 「トークン」って何だ?
            </div>
          </div>
          <div
            style={{
              height: "32px",
              lineHeight: "32px",
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 16px 0px",
              width: "calc(100% - 32px)",
            }}
          >
            <label
              htmlFor="token"
              style={{ width: "72px", fontWeight: "bold" }}
            >
              トークン
            </label>
            <input
              id="token"
              value={token}
              placeholder="トークンを入力してください。"
              title="トークンを入力してください。"
              style={{
                width: "calc(100% - 72px - 32px)",
                backgroundColor: {
                  true: "white",
                  null: "#d9dbde",
                  false: "#cc1b32",
                }[`${tokenStatus}`],
                padding: "0px 4px",
                border: "none",
                borderRadius: 4,
                cursor: tokenStatus === null ? "wait" : "unset",
                color: tokenStatus === false ? "white" : "black",
              }}
              onChange={(e) => {
                const t = e.currentTarget.value.replace("Bearer ", "").trim();
                setToken(t);
              }}
            />
          </div>
          <div
            style={{
              height: "48px",
              display: "flex",
              gap: "16px",
              width: "calc(100% - 32px)",
              padding: "8px 16px 32px",
            }}
          >
            <input
              ref={inputRef}
              onChange={() => render()}
              type="file"
              accept="image/*"
              style={{
                width: "calc(100% - 72px - 64px - 32px)",
                lineHeight: "48px",
              }}
            />
            <div
              style={{
                width: "72px",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <label style={{ fontSize: "13px", lineHeight: "16px" }}>
                サイズ
              </label>
              <input
                type="number"
                onChange={(e) => {
                  setS(
                    Math.min(3, Math.max(0, parseInt(e.currentTarget.value)))
                  );

                  if (!parseInt(e.currentTarget.value)) return;
                  setString(
                    string.replace(
                      /size=\d+/,
                      `size=${Math.round(
                        ((5 + Math.floor(8 / Math.min(3, m))) *
                          (parseInt(e.currentTarget.value) + 2)) /
                          4
                      )}`
                    )
                  );
                }}
                value={s}
                min={1}
                max={3}
                style={{
                  fontSize: "1em",
                  width: "72px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                width: "72px",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <label style={{ fontSize: "13px", lineHeight: "16px" }}>
                解像度
              </label>
              <input
                type="number"
                onChange={(e) => {
                  const x = Math.min(parseInt(e.currentTarget.value), 3.5);
                  if (!x || isNaN(x) || x > 4 || x < 1) {
                    setM(0);
                  }
                  render(x);
                }}
                value={Math.round(m)}
                min={1}
                max={4}
                style={{
                  fontSize: "1em",
                  width: "72px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              style={{
                width: 64,
                cursor: isSubmitting ? "wait" : "unset",
              }}
              disabled={
                tokenStatus !== true ||
                !string ||
                m < 1 ||
                s < 1 ||
                isSubmitting
              }
              onClick={submit}
            >
              登録
            </button>
          </div>
          <div
            style={{
              width: "fit-content",
              minWidth: `calc(min(${16 * (s + 2)}vw, ${16 * (s + 2)}vh))`,
              height: "calc(min(62vw, 62vh))",
              display: "flex",
              alignItems: "center",
            }}
          >
            <pre
              ref={preRef}
              style={{
                fontWeight: 900,
                fontSize: `calc(${((5 / m) * (s + 2)) / 4} * min(1vh, 1vw))`,
                letterSpacing: `calc(${
                  ((-0.7 / m) * (s + 2)) / 4
                } * min(1vh, 1vw))`,
                lineHeight: `calc(${((6 / m) * (s + 2)) / 4} * min(1vh, 1vw))`,
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <canvas ref={canvasRef} width="1760" height="1760" />
      </div>
    </div>
  );
}

export default App;
