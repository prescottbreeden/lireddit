import React, { FC } from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface RegisterProps {}

export const Register: FC<RegisterProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();

  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values });
          return response.data?.register.errors
            ? setErrors(toErrorMap(response.data.register.errors))
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
