---
marp: true
paginate: true
theme: su8ru
transition: fade 0.3s

title: "セルフホスト PostgreSQL に Hyperdrive する"
author: "すばる / su8ru"
talk:
  slug: "260603-workers"
  date: "2026-06-03"
  event: "Cloudflare Workers Tech Talks in Hokkaido #2 - #workers_tech"
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
    top: 40px;
    mix-blend-mode: multiply;
  }

  .profile-icon2 {
    width: 200px;
    position: absolute;
    right: 20px;
    top: 330px;
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
- 最近のニュース：就職先が決まりました :tada:

---

![h:150](images/hupass.png)

## 北大生による、北大生のための時間割アプリ


―― バックエンドを Django から Hono へ移行中

---

<div class="flex">

![h:500](images/search.png)
*新 シラバス検索画面（開発中）*

![h:500](images/timetable.png)
*時間割画面*

</div>

---

# ことのはじまり

- 既存のインフラ (VPS) を踏まえて、`@hono/node-server` 前提で開発していた
- せっかく Hono なので、バックエンドも Workers にデプロイしたい

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Hupass の次世代バックエンドを Hono の Node Adapter 使って書いてたけど、原理的には Workers デプロイできるよな……と思っていろいろやったらできて感動<br>Cloudflare Hyperdrive すげ〜〜〜〜（？）</p>&mdash; すばる ❄ (@su8ru_n) <a href="https://x.com/su8ru_n/status/2047796286871736344?ref_src=twsrc%5Etfw">April 24, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>

---

# 技術選定

Hupass ではユーザーの時間割をデータベースに保存しているので、RDB がほしい

## -> どこに置く？

- Cloudflare D1 (SQLite based)
- Supabase, Neon, etc. (PostgreSQL based)
  - Hyperdrive との組み合わせでよく見る
- セルフホスト PostgreSQL
  - 現状に最も近い
  

---

# 技術選定（つづき）

## シラバス検索という要件

1. 膨大なシラバスデータを一度に同期する場面がある
   データと DB を近くに置けるとうれしい（現状 50MB 程度なので考えすぎ？）
2. SQL レベルでのスコアリングによる複雑な検索を導入したい
   例えば `pg_search` は Neon でも使えるが、日本語全文検索とかを考えると……

-> セルフホスト PostgreSQL が最も無難で潰しが効く

---

![bg 78%](images/wire.png)

---

# セルフホスト Postgres を Workers から叩くには

1. **TLS による暗号化 (required)**
2. Cloudflare Hyperdrive によるキャッシュ (optional)
3. Cloudflare Tunnel による経路の安全化 (optional; まだできてない)

---

# 1. TLS による暗号化

- Postgres で TLS を有効 (`ssl=on`) にするには、サーバー証明書と秘密鍵が必要
- HTTPS であれば Caddy 等の便利サーバーソフトウェアがあるが……

## -> 古典的に certbot で証明書を発行する

<br />

*Tunnel 張るなら TLS なしでもいいかな……と思ったけど、Hyperdrive で必須だった*

---

`certbot/dns-cloudflare:latest` を `compose.yaml` に用意してあげたうえで発行

```sh
docker compose run --rm certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /run/secrets/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 60 \
  --cert-name hupass-postgres \
  --email admin@example.com \
  --agree-tos \
  --no-eff-email \
  -d db.example.com
```

---

```sh
docker compose run --rm --entrypoint sh certbot -c '
set -eu

CERT=/etc/letsencrypt/live/hupass-postgres

install -m 0644 \
  "$CERT/fullchain.pem" \
  /out/postgres-certs/server.crt

install -m 0600 \
  "$CERT/privkey.pem" \
  /out/postgres-certs/server.key

chown 999:999 \
  /out/postgres-certs/server.crt \
  /out/postgres-certs/server.key
'
```

---

満を持して

# 2. Cloudflare Hyperdrive

---

## Why Cloudflare Hyperdrive?

- Hyperdrive がなくても、Workers から Postgres に接続はできる
- いまのままだと、Workers が立ち上がるたびに接続が走ってしまう

-> Hyperdrive を通すと、接続を維持してくれる！

さらにクエリの結果をキャッシュしてくれたりもするらしい（うれしい）

---

![bg 82%](images/docs.png)

---

```sh
pnpm dlx wrangler hyperdrive create pirka-echalote-direct \
--connection-string="postgres://hupass:secret@198.51.100.1:65536/hupass"
```

![h:140](images/created.png)

```json
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "<hyperdrive-no-id>",
      "localConnectionString": "postgresql://hupass:secret@localhost:5432/hupass"
    },
  ],
```

---

![bg 62%](images/bindings.png)

---

![bg 78%](images/wire.png)

---

今後の展望

# 3. Cloudflare Tunnel 

---

## Why Cloudflare Tunnel?

- ここまでだと、Hyperdrive <-> Origin 間は public internet
  - さっき create hyperdrive するときに渡した IP も生 IP
- Cloudflare Access および Tunnel と組み合わせることができる

![](./images/tunnel.png)

---

# まとめ

- セルフホスト PostgreSQL にも Hyperdrive できる
  - ただし TLS 周りの設定が大変なので覚悟は必要
  - もしかして GCP とかだと備え付けだったりしますか…？
- Cloudflare Hyperdrive を使うと Origin DB との接続を維持できる
- そういえば：Hono で開発することで気軽にデプロイ先を変えられてすごい

## 宣伝

Hupass のスポンサーを募集中です！でも私は卒業してしまう……
