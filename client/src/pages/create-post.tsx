import React from "react";
import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

interface CreatePostProps {}
const CreatePost: React.FC<CreatePostProps> = () => {
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await createPost({ input: values });
          return response.data?.createPost.errors
            ? setErrors(toErrorMap(response.data.createPost.errors))
            : router.push("/");
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Post Title" />
            <Box mt={4}>
              <InputField name="text" textarea label="Write your Post" />
            </Box>
            <Button
              isLoading={isSubmitting}
              mt={4}
              type="submit"
              variantColor="teal"
            >
              Submit Post
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
