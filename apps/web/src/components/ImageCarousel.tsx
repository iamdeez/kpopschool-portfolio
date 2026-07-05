import { useEffect, useState } from "react";
import { Flex, Image } from "@chakra-ui/react";

const supporterModules = import.meta.glob("../assets/Supporters/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const supporters = Object.values(supporterModules);

const IMAGE_WIDTH = 240;
const IMAGE_GAP = 8;
const VISIBLE_COUNT = 5;

/** Ported from the original kpopschool/src/Component/ImageCarousel.js. */
export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalWidth = IMAGE_WIDTH + IMAGE_GAP;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === supporters.length - VISIBLE_COUNT ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex justify="center" align="center" w="100%" overflow="hidden" position="relative" p={2}>
      <Flex transform={`translateX(-${currentIndex * totalWidth}px)`} transition="transform 0.5s ease-out">
        {supporters.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Supporter ${index}`}
            w="240px"
            h="auto"
            mr={index < supporters.length - 1 ? "8px" : "0"}
          />
        ))}
      </Flex>
    </Flex>
  );
}
