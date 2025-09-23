---
marp: true
paginate: true
math: mathjax
theme: su8ru
footer: 2025-09-23 | 函館本線沿線勉強会 @小樽 3 号車 - #HNSAdev

title: Grafana でメトリクスを可視化すると楽しい
description: 2025-09-23 | 函館本線沿線勉強会 @小樽 3 号車 - #HNSAdev
author: すばる / su8ru
image: https://s.su8.run/250923-hnsadev03/index.jpg
---

# Grafana でメトリクスを可視化すると楽しい

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

2025-09-23 | 函館本線沿線勉強会 @小樽 3 号車 - #HNSAdev

https://s.su8.run/250923-hnsadev03

---

<!--
header: Grafana でメトリクスを可視化すると楽しい | su8ru
-->

<style scoped>
  .profile-icon {
    width: 400px;
    position: absolute;
    right: 70px;
    top: 40px;
    mix-blend-mode: multiply;
  }
  .profile-icon2 {
    width: 200px;
    position: absolute;
    right: 20px;
    top: 330px;
    /* border: 10px solid white; */
    /* border-radius: 100%; */
  }
  .suki {
    display: inline;
    height: 64px;
    margin-left: 8px;
    margin-bottom: -32px;
  }
</style>

<img src="https://images.su8ru.dev/ichika.png" class="profile-icon"  />

<img src="https://images.su8ru.dev/outline_800.png" class="profile-icon2"  />

# 自己紹介

## すばる / su8ru

- 北海道大学工学部情エレ 3 年
- 最寄り駅：~~北 12 条駅~~ **札幌駅**
- HUIT 部長 / 3DP 研 / JagaJaga (Hupass)
- Twitter: [@su8ru\__n_](https://twitter.com/su8ru_n) , GitHub: [@su8ru](https://github.com/su8ru)
- 最近呼んでる本：成瀬允宣, ドメイン駆動設計入門, 翔泳社, 2020
- すきなもの：TypeScript / ヰ世界情緒 / 藤田ことね / 鏑木ろこ / ドライブ
- 仕事でウェブフロントエンドを、趣味でウェブバックエンドを書いています

---

# 近況

- 夏休みが終わりかけていることに絶望しています
- フロントエンドカンファレンス東京に行ってきました
- 東京に行ったついでに出社したら怖がられました

<img src="./images/kowagarase.png" class="kowagarase">

<style scoped>
  .kowagarase {
    position: absolute;
    width: 35%;
    right: 0;
    bottom: 32px;
    opacity: 0.7;
  }
</style>

---

<style scoped>
  section {
    background: #ebf8ff;
  }
</style>

![w:600](./images/hupass.png)

## 北大生による、北大生のための時間割アプリ

---

![bg 95%](./images/timetable.png)

---

![bg 95%](./images/search.png)

---

# バックエンドをフルリプレースしている

先輩が初めて作った Django アプリケーションを Go (Echo) で置き換える

---

# 新システムのアーキテクチャ設計や要件定義

- 現在のシステムはどう動いているのか
- ユーザーがどう使っているのか

を根拠として意思決定する必要がある

---

## 現状の Hupass ではほとんどなにもわからない

→ リプレースと並行して、既存環境のメトリクスを取ることに

---

## Grafana と Prometheus

とにかく早くメトリクスを取りたいので、個人で使っている構成を流用

![](./images/exporter.png)

---

## とりあえず入れてみた exporter

- node_exporter：CPU とかメモリとか
- cAdvisor：Docker / k8s 周り
- django-prometheus：View ごとの値とか

---

# Prometheus を覗いてみよう

---

## 人間にはちょっと難しい

# そこで Grafana が活躍

---

# まとめ：メトリクスの可視化、楽しい！

開発もやらないと……
