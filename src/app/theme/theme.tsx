import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { StepsTheme as Steps } from "chakra-ui-steps";

// Merge the default theme config with your custom values
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors: {
    // Define your custom colors here
    brand: {
      primary: "#121212",
      secondary: "#FFFFFF",
    },
    state: {
      info: "#4480E5",
      success: "#55AB68",
      warning: "#DCB954",
      error: "#DA615C",
    },
    greys: {
      100: "#FCFCFA",
      200: "#F7F5F0",
      300: "#EAE8E3",
      400: "#D6D4D0",
      500: "#BAB8B3",
      600: "#8A8884",
      700: "#73716D",
      800: "#33322F",
      900: "#1F1E1C",
    },
    text: {
      black: "#000000",
      white: "#FFFFFF",
      highEmphasis: "rgba(0, 0, 0, 0.87)",
      medEmphasis: "rgba(0, 0, 0, 0.6)",
      disabled: "rgba(0, 0, 0, 0.38)",
      link: "#1971F6",
    },
  },
  fonts: {
    // Define your custom fonts here
    body: "Poppins, sans-serif",
    heading: "Poppins, sans-serif",
  },
  fontSizes: {
    // Define your font sizes here
    p1: "32px",
    p2: "28px",
    p3: "24px",
    p4: "18px",
    p5: "14px",
    p6: "12px",

    h1: "48px",
    h2: "40px",
    h3: "32px",
    h4: "28px",
    h5: "24px",
    h6: "18px",
    h7: "14px",
  },
  radii: {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  fontWeights: {
    // Define your font weights here
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    // Define your line heights here
    normal: "normal",
    base: "1.5",
    tall: "1.75",
  },
  sizes: {
    // Define your sizes here
    container: "1200px",
  },
  space: {
    // Define your spacing scale here
    0: "0",
    1: "2px",
    2: "4px",
    3: "8px",
    4: "12px",
    5: "16px",
    6: "20px",
    7: "24px",
    8: "28px",
    9: "32px",
    10: "36px",
    11: "40px",
    12: "48px",
    13: "56px",
    14: "64px",
    15: "80px",
  },
  components: {
    // Customize individual components here
    Button: {
      // Set default props for all Button components
      baseStyle: {
        fontWeight: "normal",
        borderRadius: "base",
        fontSize: "p5",
      },
      // Add size variants
      sizes: {
        sm: {
          px: "16px",
          py: "8px",
        },
      },
      // Add color variants
      variants: {
        solid: {
          bg: "brand.primary",
          color: "brand.secondary",
          _hover: {
            bg: "brand.primary",
            _disabled: {
              bg: "brand.primary",
            },
          },
          _active: {
            bg: "brand.primary",
          },
        },
        outline: {
          bg: "transparent",
          color: "brand.primary",
          outline: "1px solid greys.300",
          _hover: {
            bg: "transparent",
            _disabled: {
              bg: "transparent",
            },
          },
          _active: {
            bg: "greys.300",
          },
        },
        mspCustom: {
          bg: "#FFFFFFE5",
          color: "brand.primary",
          _hover: {
            bg: "rgb(247,245,240)",
            _disabled: {
              bg: "rgb(247,245,240)",
            },
          },
          _active: {
            bg: "rgb(247,245,240)",
          },
        },
        mspSettingsMenuButton: {
          justifyContent: "flex-start",
          padding: "12px",
          width: "206px",
          height: "auto",
          margin: "0 !important",
          fontSize: "p6",
          bg: "greys.900",
          color: "greys.400",
          _hover: {
            color: "text.white",
            bg: "brand.primary",
            _disabled: {
              color: "text.white",
              bg: "brand.primary",
            },
          },
          _active: {
            color: "text.white",
            bg: "brand.primary",
          },
        },
      },
    },
    Steps,
  },
  config,
});

export default theme;
