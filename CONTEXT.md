# TokoBapak MVP

Marketplace MVP dengan journey Browse → Search → Keranjang → Checkout → Bayar (via PayU) → Kirim → Notifikasi. Scope 9 service Go 1.27.0 dan frontend TanStack Start; 9 service lainnya di-hide selama 1 bulan validasi.

## Language

### Katalog dan Produk

**Product**:
Barang yang dijual dengan identitas, harga, deskripsi, dan stok.
_Avoid_: Item, CatalogEntry

**Catalog**:
Kumpulan Product yang terkurasi untuk browsing dan pencarian; bukan entitas terpisah di MVP.
_Avoid_: Catalogue, Katalog terpisah

**Inventory**:
Jumlah stok Product yang tersedia untuk reservasi saat checkout; di MVP berupa kolom `stock` di Product, bukan service mandiri.
_Avoid_: Stock Service, Gudang

**Search**:
Pencarian Product via Elasticsearch index `products` dengan filter kategori dan harga.
_Avoid_: DB LIKE, Meilisearch (untuk MVP)

### Keranjang dan Order

**Cart**:
Wadah sementara Product pilihan pembeli sebelum checkout, disimpan di Redis dengan TTL 7 hari dan merge `sum` saat login.
_Avoid_: Basket, Troli

**Order**:
Permintaan pembelian yang mengikat Cart, alamat, ongkir, dan Payment; berstatus `PENDING → RESERVED → PAID → SHIPPED → DELIVERED | CANCELLED`.
_Avoid_: Transaction (PayU), Purchase

**Payment**:
Catatan pembayaran TokoBapak untuk satu Order (`order_id, payu_reference, idempotency_key, status`); bukan sumber kebenaran saldo.
_Avoid_: Transaction (PayU), Transfer

### Pembayaran via PayU

**PayU Transaction**:
State machine dana di PayU `transaction-service` (`PENDING → VALIDATING → COMPLETED/FAILED`) yang menjadi sumber kebenaran dana; TokoBapak hanya adapter.
_Avoid_: Payment (TokoBapak), Order

**Transfer**:
Pergerakan dana internal PayU antar wallet (atomik 1-hop); berbeda dengan Payment TokoBapak.
_Avoid_: Payment, Disbursement

**Disbursement**:
Pencairan dana ke bank eksternal via BI-FAST; berbeda dengan Shipment TokoBapak.
_Avoid_: Shipment, Payout TokoBapak

### Pengiriman dan Notifikasi

**Shipment**:
Pengiriman fisik Order ke alamat pembeli; di MVP ongkir flat mock, bukan integrasi RajaOngkir.
_Avoid_: Disbursement, Delivery (PayU)

**Notification**:
Pemberitahuan proaktif status Order/Payment/Shipment ke pembeli; dipicu event Kafka `tokobapak.payment.completed.v1`.
_Avoid_: PayU AMQ Broker notification langsung ke pembeli

### Pengguna

**User**:
Akun yang dapat berbelanja; seller di MVP adalah User dengan `role=SELLER`, bukan service terpisah.
_Avoid_: Seller Service, Account (PayU)

**Seller**:
User yang memiliki Product; di MVP direpresentasikan sebagai `products.seller_id = users.id`.
_Avoid_: Merchant Service, Toko terpisah
