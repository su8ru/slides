---
marp: true
paginate: true
theme: su8ru

title: "ページ内で部分的に始める React 導入"
author: "すばる / su8ru"
talk:
  slug: "260606-frontend-phpcon-do"
  date: "2026-06-06"
  event: "Frontend PHP Conference Hokkaido 2026 - #frontend_phpcon_do"
---

# {{ title }}

<style scoped>
  .profile-icon {
    width: 90px;
    float: left;
    margin-right: 16px;
    mix-blend-mode: multiply;
  }

</style>

<img src="https://images.su8ru.dev/ichika.png" class="profile-icon" width="90px" height="90px" />

### すばる / su8ru

<br />

{{ talk.label }}

{{ urls.short }}

---

<!--
header: {{ title }} | su8ru
-->

<style scoped>
  .profile-icon {
    width: 400px;
    position: absolute;
    right: 70px;
    top: 120px;
    mix-blend-mode: multiply;
  }

  .profile-icon2 {
    width: 150px;
    position: absolute;
    right: 30px;
    top: 420px;
  }

</style>

<img src="https://images.su8ru.dev/ichika.png" class="profile-icon" />

<img src="https://images.su8ru.dev/outline_800.png" class="profile-icon2" />

# 自己紹介

## すばる / su8ru

- 北海道大学工学部情エレ 4 年
- サークル：HUIT ex-部長 / Hupass
- Twitter：[@su8ru\__n_](https://twitter.com/su8ru_n) , GitHub: [@su8ru](https://github.com/su8ru)
- すきなもの：ヰ世界情緒

---

# もくじ

1. 既存ページの一部だけ React で書きたい
2. `createRoot` だけならすぐできるが……
3. 我々が本当にほしいもの
4. mount 先を用意する
5. 初期状態を外部から渡したい
6. build 成果物を head にいれる

---

例：

# Smarty の既存フォーム

---

## 前提：ページ自体はちゃんと動いている

フォームの一部だけ複雑になってきた

- 複数チェックボックス
- 初期選択
- 条件付きの表示

-> これらを React で書きたい

---

そもそも：

# ページごと React にすれば簡単では？

---

## ページごと作り直すのは大変

- 既存テンプレートでやっていることを全部移して、
- 画面全体の挙動を再現する必要がある
- サービス面なら工数を避ける場合もあるが、管理面なら…？

-> React がほしい部分だけを置き換えたい

---

## フォームの一部だけ React で動かす

```html
<div id="checkbox-group"></div>

<script type="module" src="/assets/islands.js"></script>
```

```ts
createRoot(document.getElementById("checkbox-group")!).render(
  React.createElement(CheckboxGroup)
);
```

---

# 理屈としては、これだけ

---

# 我々が本当にほしいもの

- JSX がほしい
- TypeScript がほしい
- npm package を使いたい
- CSS もまとめて扱いたい

## -> ビルドが必要

---

## ここから急に考えることが増える

- `src/*.tsx` を書く
- バンドラで JS / CSS を生成する
- hash 付きファイル名の JS / CSS を PHP から読む
- デプロイフローに組み込む

*React を動かすだけの話だったはずなのに……*

---

# Astro なら面倒を見てくれる

- HTML を生成して mount 先を用意する
- どこを hydrate するか決める
- build した JS / CSS を差し込む

## -> これらを自分でやる必要がある

---

# 1. mount 先を用意する

Smarty 側では「ここで CheckboxGroup を mount する」ということだけを書く

```html
<div data-react-island="CheckboxGroup"></div>
```

## この div の中だけ React が触る

---

## 文字列から React コンポーネントを render する

```tsx
const islands = {
  CheckboxGroup,
} satisfies Record<string, ComponentType<unknown>>;

document.querySelectorAll("[data-react-island]").forEach((el) => {
  const name = el.getAttribute("data-react-island");
  const props = JSON.parse(el.getAttribute("data-props") ?? "{}");
  const Component = islands[name!];

  createRoot(el).render(<Component {...props} />);
});
```

---

# 2. 初期状態を外部から渡したい

- field name
- 初期選択
- 選択肢の label / value

## → props が必要

---

## Smarty から React に値を渡したい

Smarty 側で JSON を埋め込む

```html
<div
  data-react-island="CheckboxGroup"
  data-props='{$checkboxGroupPropsJson|escape:"html"}'
></div>
```

attributes に `<` や `"` が入るとつらい
-> `json_encode` 後に HTML escape すると安全

---

# 3. build 成果物を head にいれる

- build するとファイル名に hash が付く
- 中身が変わるとファイル名も変わる

## -> Smarty に直書きできない

---

## Smarty から build 結果を読みたい

manifest は「entry 名」と「build 後のファイル名」の対応表

```json
{
  "src/islands.tsx": {
    "file": "assets/islands-Bi7oDEnV.js",
    "css": ["assets/islands-lwNXSBIb.css"]
  }
}
```

-> Smarty は安定した entry 名だけ知っていればよい

---

## Smarty 側には helper を置く

テンプレートには entry 名だけを書く

```text
{react_assets entry="src/islands.tsx"}
```

↓

```html
<link rel="stylesheet" href="/assets/islands-lwNXSBIb.css">
<script type="module" src="/assets/islands-Bi7oDEnV.js"></script>
```

---

## manifest.json から展開する

1. `src/islands.tsx` を entry として受け取る
2. manifest から `file` と `css` を引く
3. `link` と `script` にして出力する

---

# まとめ

- 既存ページの一部だけ React にすることはできる
- 小さく始めるだけなら `createRoot` で十分
- ただし JSX / TypeScript / CSS / npm package を使うなら build が必要
- mount 先、props、assets の受け口を用意しつつ分離するのが大切

<style scoped>
  .profile-icon {
    width: 90px;
    mix-blend-mode: multiply;
  }
  .right {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
  }
</style>

<br />

<div class="right">

<img src="https://images.su8ru.dev/ichika.png" class="profile-icon" width="90px" height="90px" />

### すばる / su8ru

</div>
