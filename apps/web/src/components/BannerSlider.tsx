import Slider from "react-slick";
import { Image } from "@chakra-ui/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/** Ported from the original kpopschool/src/Page/CS/Home.js SimpleSlider. */
export function BannerSlider({ images }: { images: string[] }) {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <Slider {...settings}>
      {images.map((src) => (
        <Image key={src} src={src} alt="" borderRadius="20px" w="full" />
      ))}
    </Slider>
  );
}
