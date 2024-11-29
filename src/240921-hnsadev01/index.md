---
marp: true
paginate: true
theme: su8ru-white
footer: 2024-09-21 | 函館本線沿線勉強会 ~HNSAdev~ @札幌 1 号車 | #hnsadev
image: https://slides.su8.run/240921-hnsadev01/index.jpg
---

# xremap のすゝめ

**すばる / su8ru**

2024-09-21 | 函館本線沿線勉強会 ~HNSAdev~ @札幌 1 号車 | #hnsadev

[slides.su8.run/240921-hnsadev01](https://slides.su8.run/240921-hnsadev01)

---

<!--
header: xremap のすゝめ | su8ru
-->

# 自己紹介

![bg 100% right:30%](https://su8.run/avatar?s=1080)

## すばる / su8ru

- 北海道大学工学部
  情報エレクトロニクス学科 2 年
- 北大 IT 研究会 HUIT
- Twitter: [@su8ru\__n_](https://twitter.com/su8ru_n)
  `@su8ru_` が凍結……フォローお願いします……
- GitHub: [@su8ru](https://github.com/su8ru)
- すきなもの
  - 初音ミク / にじさんじ / V.W.P
  - 飛行機 🔴

---

# HHKB をご存知ですか？

---

![bg 100%](https://www.pfu.ricoh.com/direct/hhkb/images/detail_pd-kb800yns-2.jpg)

---

# これを普段から持ち歩くわけにはいかない

大学とか、今日（※ PIXIV DEV MEETUP の帰り）とか……

---

# 普段のキーボードはいわゆる ThinkPad の日本語配列

- CapsLock の位置に Ctrl を持ってきたい
- 主に矢印キー周りのショートカットが使えなくて苦しい

---

# Linux におけるキー割り当てといえば xmodmap

- コンフィグが書きづらい
- なんか安定しない（時々 Ctrl のリマップが死んでストレス）
- Fn + hjkl への矢印キー割り当てができなかった（調査不足？）

---

# xremap ってやつがすごそう

https://github.com/xremap/xremap

![h:100](https://github.com/xremap/xremap/blob/master/.github/xremap.png?raw=true)

- Star 1.4k
- Rust 製っぽい（そうなんだ）

---

# modmap と keymap の 2 モードがある

> modmap is for key-to-key remapping like xmodmap.
