import { extendTheme } from "@chakra-ui/react";

// Ported 1:1 from the original kpopschool/src/App.js brand constants —
// these color names appear throughout the original components, so keeping
// the same names (not generic "brand.500" etc.) makes porting layout code
// a direct copy rather than a re-derivation.
export const popyellow = "#FFCC00";
export const popblue = "#00B2FF";
export const popmint = "#00C3BA";
export const popmag = "#FF3CA2";

export const brandGray = "#E1E4E4";
export const brandLightGray = "#F1F1F1";
export const brandDarkTeal = "rgba(29, 55, 57, 1)";
export const brandMintText = "rgba(0, 195, 186, 1)";
export const brandFadedTeal = "rgba(111, 151, 149, 1)";

export const theme = extendTheme({
  colors: {
    popyellow: { 500: popyellow },
    popblue: { 500: popblue },
    popmint: { 500: popmint },
    popmag: { 500: popmag },
  },
  styles: {
    global: {
      "button:focus, input:focus": {
        outline: "none",
      },
      // v1.2.0 FR-007: certificate page's print button hides itself when printed.
      "@media print": {
        ".no-print": {
          display: "none",
        },
      },
    },
  },
});
