-- CreateTable
CREATE TABLE "chitiet_diadiem" (
    "chitiet_diadiem_id" SERIAL NOT NULL,
    "diadiem_id" INTEGER,
    "mota_google" TEXT,
    "mota_tonghop" TEXT,
    "sodienthoai" VARCHAR(20),
    "website" TEXT,
    "giomocua" JSONB,
    "ngaycapnhat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chitiet_diadiem_pkey" PRIMARY KEY ("chitiet_diadiem_id")
);

-- CreateTable
CREATE TABLE "danhgia_diadiem" (
    "danhgia_diadiem_id" SERIAL NOT NULL,
    "nguoidung_id" INTEGER,
    "diadiem_id" INTEGER,
    "sosao" INTEGER,
    "noidung" TEXT,
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "danhgia_diadiem_pkey" PRIMARY KEY ("danhgia_diadiem_id")
);

-- CreateTable
CREATE TABLE "diadiem" (
    "diadiem_id" SERIAL NOT NULL,
    "google_place_id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "diachi" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "geom" geography,
    "loai" VARCHAR(100),
    "danhgia" DECIMAL(3,2),
    "soluotdanhgia" INTEGER,
    "giatien" INTEGER,
    "ngaycapnhat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diadiem_pkey" PRIMARY KEY ("diadiem_id")
);

-- CreateTable
CREATE TABLE "hinhanh_diadiem" (
    "hinhanh_diadiem_id" SERIAL NOT NULL,
    "diadiem_id" INTEGER,
    "photo_reference" TEXT,
    "url" TEXT,

    CONSTRAINT "hinhanh_diadiem_pkey" PRIMARY KEY ("hinhanh_diadiem_id")
);

-- CreateTable
CREATE TABLE "lichtrinh_local" (
    "lichtrinh_local_id" SERIAL NOT NULL,
    "nguoidung_id" INTEGER,
    "tieude" VARCHAR(255) NOT NULL,
    "mota" TEXT,
    "sothich_id" INTEGER,
    "thoigian_dukien" VARCHAR(100),
    "luotthich" INTEGER DEFAULT 0,
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lichtrinh_local_pkey" PRIMARY KEY ("lichtrinh_local_id")
);

-- CreateTable
CREATE TABLE "lichtrinh_local_diadiem" (
    "lichtrinh_local_diadiem_id" SERIAL NOT NULL,
    "lichtrinh_local_id" INTEGER,
    "diadiem_id" INTEGER,
    "thutu" INTEGER,
    "thoigian_den" TIME(6),
    "thoiluong" INTEGER,
    "ghichu" TEXT,

    CONSTRAINT "lichtrinh_local_diadiem_pkey" PRIMARY KEY ("lichtrinh_local_diadiem_id")
);

-- CreateTable
CREATE TABLE "lichtrinh_nguoidung" (
    "lichtrinh_nguoidung_id" SERIAL NOT NULL,
    "nguoidung_id" INTEGER,
    "tieude" VARCHAR(255) NOT NULL,
    "thoigian_batdau" DATE,
    "thoigian_ketthuc" DATE,
    "trangthai" VARCHAR(50) DEFAULT 'planning',
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lichtrinh_nguoidung_pkey" PRIMARY KEY ("lichtrinh_nguoidung_id")
);

-- CreateTable
CREATE TABLE "lichtrinh_nguoidung_diadiem" (
    "lichtrinh_nguoidung_diadiem_id" SERIAL NOT NULL,
    "lichtrinh_nguoidung_id" INTEGER,
    "diadiem_id" INTEGER,
    "thutu" INTEGER,
    "thoigian_den" TIME(6),
    "thoiluong" INTEGER,
    "ghichu" TEXT,

    CONSTRAINT "lichtrinh_nguoidung_diadiem_pkey" PRIMARY KEY ("lichtrinh_nguoidung_diadiem_id")
);

-- CreateTable
CREATE TABLE "luu_diadiem" (
    "luu_diadiem_id" SERIAL NOT NULL,
    "nguoidung_id" INTEGER,
    "diadiem_id" INTEGER,
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "luu_diadiem_pkey" PRIMARY KEY ("luu_diadiem_id")
);

-- CreateTable
CREATE TABLE "meovat_diadiem" (
    "meovat_diadiem_id" SERIAL NOT NULL,
    "diadiem_id" INTEGER,
    "nguoidung_id" INTEGER,
    "noidung" TEXT NOT NULL,
    "thoidiem_dep" TEXT,
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meovat_diadiem_pkey" PRIMARY KEY ("meovat_diadiem_id")
);

-- CreateTable
CREATE TABLE "nguoidung" (
    "nguoidung_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "matkhau" VARCHAR(255) NOT NULL,
    "ten" VARCHAR(100),
    "avatar" TEXT,
    "trangthai" VARCHAR(50) DEFAULT 'active',
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ngaycapnhat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nguoidung_pkey" PRIMARY KEY ("nguoidung_id")
);

-- CreateTable
CREATE TABLE "nguoidung_sothich" (
    "nguoidung_sothich_id" SERIAL NOT NULL,
    "nguoidung_id" INTEGER,
    "sothich_id" INTEGER,

    CONSTRAINT "nguoidung_sothich_pkey" PRIMARY KEY ("nguoidung_sothich_id")
);

-- CreateTable
CREATE TABLE "sothich" (
    "sothich_id" SERIAL NOT NULL,
    "ten" VARCHAR(100) NOT NULL,
    "mota" TEXT,

    CONSTRAINT "sothich_pkey" PRIMARY KEY ("sothich_id")
);

-- CreateTable
CREATE TABLE "tuyen_duong" (
    "tuyen_duong_id" SERIAL NOT NULL,
    "lichtrinh_nguoidung_id" INTEGER,
    "polyline" TEXT,
    "tong_khoangcach" DECIMAL,
    "tong_thoigian" INTEGER,
    "ngay_thu_may" INTEGER DEFAULT 1,
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tuyen_duong_pkey" PRIMARY KEY ("tuyen_duong_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diadiem_google_place_id_key" ON "diadiem"("google_place_id");

-- CreateIndex
CREATE UNIQUE INDEX "nguoidung_email_key" ON "nguoidung"("email");

-- AddForeignKey
ALTER TABLE "chitiet_diadiem" ADD CONSTRAINT "chitiet_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "danhgia_diadiem" ADD CONSTRAINT "danhgia_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "danhgia_diadiem" ADD CONSTRAINT "danhgia_diadiem_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hinhanh_diadiem" ADD CONSTRAINT "hinhanh_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lichtrinh_local" ADD CONSTRAINT "lichtrinh_local_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lichtrinh_local" ADD CONSTRAINT "lichtrinh_local_sothich_id_fkey" FOREIGN KEY ("sothich_id") REFERENCES "sothich"("sothich_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lichtrinh_local_diadiem" ADD CONSTRAINT "lichtrinh_local_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lichtrinh_local_diadiem" ADD CONSTRAINT "lichtrinh_local_diadiem_lichtrinh_local_id_fkey" FOREIGN KEY ("lichtrinh_local_id") REFERENCES "lichtrinh_local"("lichtrinh_local_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lichtrinh_nguoidung" ADD CONSTRAINT "lichtrinh_nguoidung_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lichtrinh_nguoidung_diadiem" ADD CONSTRAINT "lichtrinh_nguoidung_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lichtrinh_nguoidung_diadiem" ADD CONSTRAINT "lichtrinh_nguoidung_diadiem_lichtrinh_nguoidung_id_fkey" FOREIGN KEY ("lichtrinh_nguoidung_id") REFERENCES "lichtrinh_nguoidung"("lichtrinh_nguoidung_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "luu_diadiem" ADD CONSTRAINT "luu_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "luu_diadiem" ADD CONSTRAINT "luu_diadiem_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meovat_diadiem" ADD CONSTRAINT "meovat_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meovat_diadiem" ADD CONSTRAINT "meovat_diadiem_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nguoidung_sothich" ADD CONSTRAINT "nguoidung_sothich_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nguoidung_sothich" ADD CONSTRAINT "nguoidung_sothich_sothich_id_fkey" FOREIGN KEY ("sothich_id") REFERENCES "sothich"("sothich_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tuyen_duong" ADD CONSTRAINT "tuyen_duong_lichtrinh_nguoidung_id_fkey" FOREIGN KEY ("lichtrinh_nguoidung_id") REFERENCES "lichtrinh_nguoidung"("lichtrinh_nguoidung_id") ON DELETE CASCADE ON UPDATE NO ACTION;
