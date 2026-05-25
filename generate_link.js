const code = `graph LR
    %% Konfigurasi Layout
    direction LR

    %% --- ENTITAS (User & External) ---
    subgraph Users [Pengguna]
        direction TB
        E1[Tamu]
        E2[Admin]
    end

    subgraph ThirdParty [Pihak Ketiga]
        direction TB
        E3[Payment Gateway<br>Xendit]
        E4[Layanan Email]
    end

    %% --- PROSES UTAMA (Main Processes) ---
    %% Bentuk Rounded Rect (Notasi Gane & Sarson Modern)
    P1([1.0 Pengelolaan<br>Akun])
    P2([2.0 Manajemen<br>Paket Wellness])
    P3([3.0 Reservasi])
    P4([4.0 Pembayaran])
    P5([5.0 Manajemen Jadwal<br>Kegiatan Tamu])
    P6([6.0 Pengelolaan<br>Ulasan])

    %% --- DATA STORES (Penyimpanan Data) ---
    %% Bentuk Cylinder sebagai representasi Database
    D1[(D1 Data Pengguna)]
    D2[(D2 Data Paket)]
    D3[(D3 Data Reservasi)]
    D4[(D4 Data Ulasan)]

    %% --- ALIRAN DATA (Data Flow) ---

    %% 1.0 Pengelolaan Akun
    E1 -- "1. Reg & Login" --> P1
    E2 -- "1. Login Admin" --> P1
    P1 -- "Validasi" --> E1
    P1 -- "Akses Admin" --> E2
    P1 <-->|"Cek/Simpan"| D1

    %% 2.0 Manajemen Paket Wellness
    P2 -- "Info Paket" --> E1
    E2 -- "2. Input Paket" --> P2
    P2 <-->|"CRUD Paket"| D2

    %% 3.0 Reservasi
    E1 -- "3. Input Booking" --> P3
    P3 <-->|"Cek Detail Paket"| D2
    D1 -.->|"Info Tamu"| P3
    P3 -- "Simpan Reservasi (Pending)" --> D3
    P3 -- "Data Tagihan" --> P4

    %% 4.0 Pembayaran
    P4 -- "Create Invoice" --> E3
    E3 -- "Link Invoice" --> P4
    P4 -- "Link Pembayaran" --> E1
    E1 -- "Konfirmasi Bayar" --> E3
    E3 -- "Webhook Lunas" --> P4
    P4 -- "Update Status Paid" --> D3
    P4 -- "Tiket & Bukti Bayar" --> E1
    D3 -- "Laporan Transaksi" --> E2

    %% 5.0 Manajemen Jadwal Kegiatan Tamu
    E2 -- "Update Jadwal" --> P5
    P5 <-->|"Update Tanggal/Kegiatan"| D3
    P5 -- "Trigger Email" --> E4
    E4 -- "Notifikasi Jadwal" --> E1

    %% 6.0 Pengelolaan Ulasan
    E1 -- "Input Ulasan" --> P6
    P6 -- "Simpan" --> D4
    E2 -- "Moderasi" --> P6
    D4 -- "Data Ulasan" --> P6
    P6 -- "Publish Ulasan" --> E1

    %% Styling untuk keterbacaan
    classDef process fill:#fff,stroke:#333,stroke-width:2px;
    classDef store fill:#f9f9f9,stroke:#666,stroke-width:1px,stroke-dasharray: 5 5;
    classDef entity fill:#e1f5fe,stroke:#01579b,stroke-width:2px;

    class P1,P2,P3,P4,P5,P6 process;
    class D1,D2,D3,D4 store;
    class E1,E2,E3,E4 entity;`;

const state = {
    code: code,
    mermaid: { theme: 'default' },
    autoSync: true,
    updateDiagram: true
};

const fs = require('fs');
fs.writeFileSync('link.txt', Buffer.from(JSON.stringify(state)).toString('base64'));
