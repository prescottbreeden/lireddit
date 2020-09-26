import React from "react";
import { NextPage } from "next";
import { Wrapper } from "../../components/Wrapper";
import { Formik, Form } from "formik";
import register from "../register";
import { toErrorMap } from "../../utils/toErrorMap";
import { InputField } from "../../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { useRouter } from "next/router";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();

  return (
    <>
      <p>Token is: {token}</p>
      <Wrapper>
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            /* const { usernameOrEmail, password } = values; */
            /* const response = await register({ usernameOrEmail, password }); */
            /* return response.data?.login.errors */
            /*   ? setErrors(toErrorMap(response.data.login.errors)) */
            /*   : router.push("/"); */
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="newPassword"
                type="password"
                label="New Password"
              />
              <Button
                isLoading={isSubmitting}
                mt={4}
                type="submit"
                variantColor="teal"
              >
                Save New Password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ChangePassword;
