import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import theme from "../theme";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

function MyApp({ Component, pageProps }: any) {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(MyApp);
