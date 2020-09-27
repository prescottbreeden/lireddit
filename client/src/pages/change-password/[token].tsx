import React, { useState } from "react";
import { NextPage } from "next";
import { Wrapper } from "../../components/Wrapper";
import { Formik, Form } from "formik";
import { toErrorMap } from "../../utils/toErrorMap";
import { InputField } from "../../components/InputField";
import { Button, Box } from "@chakra-ui/core";
/* import { useRouter } from "next/router"; */
import { useUpdatePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  /* const router = useRouter(); */
  const [tokenError, setTokenError] = useState("");
  const [, updatePassword] = useUpdatePasswordMutation();

  return (
    <>
      <Wrapper>
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await updatePassword({
              token,
              password: values.newPassword,
            });
            if (response.error) {
              console.log(response.error);
              // this error handling pattern sux and I'm too lazy to implement
              // something different right now
              setTokenError(response.error.message);
            }
            if (response.data?.updatePassword.errors) {
              console.log(response.data.updatePassword.errors);
              setErrors(toErrorMap(response.data.updatePassword.errors));
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="newPassword"
                type="password"
                label="New Password"
              />
              <Box color="red">{tokenError}</Box>
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

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);
