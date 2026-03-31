-- ==========================================
-- 0. KÍCH HOẠT POSTGIS (BẮT BUỘC)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- 1. NHÓM NGƯỜI DÙNG & SỞ THÍCH
-- ==========================================
CREATE TABLE IF NOT EXISTS nguoidung (
    nguoidung_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    matkhau VARCHAR(255) NOT NULL,
    ten VARCHAR(100),
    avatar TEXT,
    trangthai VARCHAR(50) DEFAULT 'active',
    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sothich (
    sothich_id SERIAL PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    mota TEXT
);

CREATE TABLE IF NOT EXISTS nguoidung_sothich (
    nguoidung_sothich_id SERIAL PRIMARY KEY,
    nguoidung_id INT REFERENCES nguoidung(nguoidung_id) ON DELETE CASCADE,
    sothich_id INT REFERENCES sothich(sothich_id) ON DELETE CASCADE
);

-- ==========================================
-- 2. NHÓM ĐỊA ĐIỂM (GOOGLE PLACES CACHE)
-- ==========================================
CREATE TABLE IF NOT EXISTS diadiem (
    diadiem_id SERIAL PRIMARY KEY,
    google_place_id VARCHAR(255) UNIQUE NOT NULL,
    ten VARCHAR(255) NOT NULL,
    diachi TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    geom GEOGRAPHY(POINT, 4326), 
    loai VARCHAR(100),
    danhgia DECIMAL(3,2),
    soluotdanhgia INTEGER,
    giatien INTEGER,
    ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chitiet_diadiem (
    chitiet_diadiem_id SERIAL PRIMARY KEY,
    diadiem_id INT REFERENCES diadiem(diadiem_id) ON DELETE CASCADE,
    mota_google TEXT,
    mota_tonghop TEXT, -- Nội dung do AI tổng hợp
    sodienthoai VARCHAR(20),
    website TEXT,
    giomocua JSONB,
    ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hinhanh_diadiem (
    hinhanh_diadiem_id SERIAL PRIMARY KEY,
    diadiem_id INT REFERENCES diadiem(diadiem_id) ON DELETE CASCADE,
    photo_reference TEXT,
    url TEXT
);

-- ==========================================
-- 3. NHÓM NỘI DUNG LOCAL (MẸO VẶT & GỢI Ý)
-- ==========================================
CREATE TABLE IF NOT EXISTS lichtrinh_local (
    lichtrinh_local_id SERIAL PRIMARY KEY,
    nguoidung_id INT REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL,
    tieude VARCHAR(255) NOT NULL,
    mota TEXT,
    sothich_id INT REFERENCES sothich(sothich_id),
    thoigian_dukien VARCHAR(100),
    luotthich INTEGER DEFAULT 0,
    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lichtrinh_local_diadiem (
    lichtrinh_local_diadiem_id SERIAL PRIMARY KEY,
    lichtrinh_local_id INT REFERENCES lichtrinh_local(lichtrinh_local_id) ON DELETE CASCADE,
    diadiem_id INT REFERENCES diadiem(diadiem_id) ON DELETE CASCADE,
    thutu INTEGER,
    thoigian_den TIME,
    thoiluong INTEGER, -- Phút
    ghichu TEXT
);

CREATE TABLE IF NOT EXISTS meovat_diadiem (
    meovat_diadiem_id SERIAL PRIMARY KEY,
    diadiem_id INT REFERENCES diadiem(diadiem_id) ON DELETE CASCADE,
    nguoidung_id INT REFERENCES nguoidung(nguoidung_id) ON DELETE CASCADE,
    noidung TEXT NOT NULL,
    thoidiem_dep TEXT,
    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. NHÓM LỊCH TRÌNH CÁ NHÂN (USER ITINERARY)
-- ==========================================
CREATE TABLE IF NOT EXISTS lichtrinh_nguoidung (
    lichtrinh_nguoidung_id SERIAL PRIMARY KEY,
    nguoidung_id INT REFERENCES nguoidung(nguoidung_id) ON DELETE CASCADE,
    tieude VARCHAR(255) NOT NULL,
    thoigian_batdau DATE,
    thoigian_ketthuc DATE,
    trangthai VARCHAR(50) DEFAULT 'planning',
    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lichtrinh_nguoidung_diadiem (
    lichtrinh_nguoidung_diadiem_id SERIAL PRIMARY KEY,
    lichtrinh_nguoidung_id INT REFERENCES lichtrinh_nguoidung(lichtrinh_nguoidung_id) ON DELETE CASCADE,
    diadiem_id INT REFERENCES diadiem(diadiem_id) ON DELETE CASCADE,
    thutu INTEGER,
    thoigian_den TIME,
    thoiluong INTEGER,
    ghichu TEXT
);

-- ==========================================
-- 5. NHÓM TUYẾN ĐƯỜNG & TƯƠNG TÁC
-- ==========================================
CREATE TABLE IF NOT EXISTS tuyen_duong (
    tuyen_duong_id SERIAL PRIMARY KEY,
    lichtrinh_nguoidung_id INT REFERENCES lichtrinh_nguoidung(lichtrinh_nguoidung_id) ON DELETE CASCADE,
    polyline TEXT,
    tong_khoangcach DECIMAL,
    tong_thoigian INTEGER,
    ngay_thu_may INTEGER DEFAULT 1,
    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS luu_diadiem (
    luu_diadiem_id SERIAL PRIMARY KEY,
    nguoidung_id INT REFERENCES nguoidung(nguoidung_id) ON DELETE CASCADE,
    diadiem_id INT REFERENCES diadiem(diadiem_id) ON DELETE CASCADE,
    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS danhgia_diadiem (
    danhgia_diadiem_id SERIAL PRIMARY KEY,
    nguoidung_id INT REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL,
    diadiem_id INT REFERENCES diadiem(diadiem_id) ON DELETE CASCADE,
    sosao INTEGER CHECK (sosao >= 1 AND sosao <= 5),
    noidung TEXT,
    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. TRIGGER TỰ ĐỘNG CẬP NHẬT TỌA ĐỘ
-- ==========================================
CREATE OR REPLACE FUNCTION update_geom_func() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
        NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_geom
BEFORE INSERT OR UPDATE ON diadiem
FOR EACH ROW EXECUTE FUNCTION update_geom_func();