import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: "Query";
  /** Get all the posts. */
  posts: Array<Post>;
  post?: Maybe<Post>;
  me?: Maybe<User>;
};

export type QueryPostArgs = {
  id: Scalars["Int"];
};

/** Posts created for lireddit */
export type Post = {
  __typename?: "Post";
  id: Scalars["Float"];
  createdAt: Scalars["String"];
  updatedAt: Scalars["String"];
  title: Scalars["String"];
  text: Scalars["String"];
  points: Scalars["Float"];
  creatorId: Scalars["Float"];
};

/** Users of lireddit */
export type User = {
  __typename?: "User";
  id: Scalars["Float"];
  createdAt: Scalars["String"];
  updatedAt: Scalars["String"];
  username: Scalars["String"];
  email: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  createPost: PostResponse;
  updatePost: Post;
  deletePost: Post;
  register: UserResponse;
  login: UserResponse;
  logout: Scalars["Boolean"];
  forgotPassword: Scalars["Boolean"];
  updatePassword: UserResponse;
};

export type MutationCreatePostArgs = {
  input: PostInput;
};

export type MutationUpdatePostArgs = {
  title?: Maybe<Scalars["String"]>;
  id: Scalars["Float"];
};

export type MutationDeletePostArgs = {
  id: Scalars["Float"];
};

export type MutationRegisterArgs = {
  options: UserInput;
};

export type MutationLoginArgs = {
  password: Scalars["String"];
  usernameOrEmail: Scalars["String"];
};

export type MutationForgotPasswordArgs = {
  email: Scalars["String"];
};

export type MutationUpdatePasswordArgs = {
  password: Scalars["String"];
  token: Scalars["String"];
};

export type PostResponse = {
  __typename?: "PostResponse";
  errors?: Maybe<Array<FieldError>>;
  post?: Maybe<Post>;
};

export type FieldError = {
  __typename?: "FieldError";
  field: Scalars["String"];
  message: Scalars["String"];
};

export type PostInput = {
  title: Scalars["String"];
  text: Scalars["String"];
};

export type UserResponse = {
  __typename?: "UserResponse";
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type UserInput = {
  username: Scalars["String"];
  password: Scalars["String"];
  email: Scalars["String"];
};

export type FieldErrorFragmentFragment = { __typename?: "FieldError" } & Pick<
  FieldError,
  "field" | "message"
>;

export type UserFragmentFragment = { __typename?: "User" } & Pick<
  User,
  "id" | "username" | "email"
>;

export type UserResponseFragmentFragment = { __typename?: "UserResponse" } & {
  errors?: Maybe<
    Array<{ __typename?: "FieldError" } & FieldErrorFragmentFragment>
  >;
  user?: Maybe<{ __typename?: "User" } & UserFragmentFragment>;
};

export type CreatePostMutationVariables = Exact<{
  input: PostInput;
}>;

export type CreatePostMutation = { __typename?: "Mutation" } & {
  createPost: { __typename?: "PostResponse" } & {
    errors?: Maybe<
      Array<{ __typename?: "FieldError" } & FieldErrorFragmentFragment>
    >;
    post?: Maybe<{ __typename?: "Post" } & Pick<Post, "id">>;
  };
};

export type LoginMutationVariables = Exact<{
  usernameOrEmail: Scalars["String"];
  password: Scalars["String"];
}>;

export type LoginMutation = { __typename?: "Mutation" } & {
  login: { __typename?: "UserResponse" } & UserResponseFragmentFragment;
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "logout"
>;

export type RegisterMutationVariables = Exact<{
  options: UserInput;
}>;

export type RegisterMutation = { __typename?: "Mutation" } & {
  register: { __typename?: "UserResponse" } & UserResponseFragmentFragment;
};

export type UpdatePasswordMutationVariables = Exact<{
  token: Scalars["String"];
  password: Scalars["String"];
}>;

export type UpdatePasswordMutation = { __typename?: "Mutation" } & {
  updatePassword: {
    __typename?: "UserResponse";
  } & UserResponseFragmentFragment;
};

export type PostsQueryVariables = Exact<{ [key: string]: never }>;

export type PostsQuery = { __typename?: "Query" } & {
  posts: Array<
    { __typename?: "Post" } & Pick<
      Post,
      "id" | "createdAt" | "updatedAt" | "title"
    >
  >;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = { __typename?: "Query" } & {
  me?: Maybe<{ __typename?: "User" } & UserFragmentFragment>;
};

export const FieldErrorFragmentFragmentDoc = gql`
  fragment FieldErrorFragment on FieldError {
    field
    message
  }
`;
export const UserFragmentFragmentDoc = gql`
  fragment UserFragment on User {
    id
    username
    email
  }
`;
export const UserResponseFragmentFragmentDoc = gql`
  fragment UserResponseFragment on UserResponse {
    errors {
      ...FieldErrorFragment
    }
    user {
      ...UserFragment
    }
  }
  ${FieldErrorFragmentFragmentDoc}
  ${UserFragmentFragmentDoc}
`;
export const CreatePostDocument = gql`
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
      errors {
        ...FieldErrorFragment
      }
      post {
        id
      }
    }
  }
  ${FieldErrorFragmentFragmentDoc}
`;

export function useCreatePostMutation() {
  return Urql.useMutation<CreatePostMutation, CreatePostMutationVariables>(
    CreatePostDocument
  );
}
export const LoginDocument = gql`
  mutation Login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password) {
      ...UserResponseFragment
    }
  }
  ${UserResponseFragmentFragmentDoc}
`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
}
export const LogoutDocument = gql`
  mutation Logout {
    logout
  }
`;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(
    LogoutDocument
  );
}
export const RegisterDocument = gql`
  mutation Register($options: UserInput!) {
    register(options: $options) {
      ...UserResponseFragment
    }
  }
  ${UserResponseFragmentFragmentDoc}
`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(
    RegisterDocument
  );
}
export const UpdatePasswordDocument = gql`
  mutation UpdatePassword($token: String!, $password: String!) {
    updatePassword(token: $token, password: $password) {
      ...UserResponseFragment
    }
  }
  ${UserResponseFragmentFragmentDoc}
`;

export function useUpdatePasswordMutation() {
  return Urql.useMutation<
    UpdatePasswordMutation,
    UpdatePasswordMutationVariables
  >(UpdatePasswordDocument);
}
export const PostsDocument = gql`
  query Posts {
    posts {
      id
      createdAt
      updatedAt
      title
    }
  }
`;

export function usePostsQuery(
  options: Omit<Urql.UseQueryArgs<PostsQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<PostsQuery>({ query: PostsDocument, ...options });
}
export const MeDocument = gql`
  query Me {
    me {
      ...UserFragment
    }
  }
  ${UserFragmentFragmentDoc}
`;

export function useMeQuery(
  options: Omit<Urql.UseQueryArgs<MeQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
}
