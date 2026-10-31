"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

type KosPhoto = {
  id: string;
  image_url: string;
};

type KosPhotoGalleryProps = {
  name: string;
  photos: KosPhoto[];
};

export function KosPhotoGallery({ name, photos }: KosPhotoGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <section className="kos-gallery" aria-label={`Foto ${name}`}>
        <Swiper
          className="kos-gallery-main"
          spaceBetween={12}
          navigation
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          modules={[FreeMode, Navigation, Thumbs]}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={photo.id}>
              <button
                className="kos-gallery-trigger"
                type="button"
                onClick={() => openLightbox(index)}
                aria-label={`Tampilkan foto ${index + 1} dari ${photos.length} dalam ukuran besar`}
              >
                <Image src={photo.image_url} alt={`Foto ${name}, ${index + 1}`} fill sizes="(max-width: 620px) 100vw, 1120px" unoptimized />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <Swiper
          className="kos-gallery-thumbs"
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode
          watchSlidesProgress
          modules={[FreeMode, Navigation, Thumbs]}
          breakpoints={{ 621: { slidesPerView: 6 } }}
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={photo.id}>
              <button className="kos-gallery-thumb" type="button" onClick={() => openLightbox(index)} aria-label={`Pilih foto ${index + 1}`}>
                <Image src={photo.image_url} alt="" fill sizes="140px" unoptimized />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {isLightboxOpen && (
        <div className="kos-lightbox" role="dialog" aria-modal="true" aria-label={`Foto ${name}`} onClick={() => setIsLightboxOpen(false)}>
          <button className="kos-lightbox-close" type="button" onClick={() => setIsLightboxOpen(false)} aria-label="Tutup galeri">Tutup</button>
          <Swiper
            className="kos-lightbox-main"
            initialSlide={activeIndex}
            navigation
            modules={[Navigation]}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            onClick={(swiper, event) => event.stopPropagation()}
          >
            {photos.map((photo, index) => (
              <SwiperSlide key={photo.id}>
                <Image src={photo.image_url} alt={`Foto ${name}, ${index + 1}`} fill sizes="100vw" unoptimized />
              </SwiperSlide>
            ))}
          </Swiper>
          <p className="kos-lightbox-count">{activeIndex + 1} / {photos.length}</p>
        </div>
      )}
    </>
  );
}
