import { Box } from "@chakra-ui/core";

interface WrapperProps {
  variant: "small" | "regular";
}

export const Wrapper = ({ children, variant = "regular" }) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
};
