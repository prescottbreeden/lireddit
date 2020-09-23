import React, { FC } from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

interface LoginProps {}

export const Login: FC<LoginProps> = ({}) => {
  const router = useRouter();
  const [, register] = useLoginMutation();

  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values });
          return response.data?.login.errors
            ? setErrors(toErrorMap(response.data.login.errors))
            : router.push("/");
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" />
            <Box mt={4}>
              <InputField name="password" type="password" />
            </Box>
            <Button
              isLoading={isSubmitting}
              mt={4}
              type="submit"
              variantColor="teal"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
