import React, { FC } from "react";
import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import NextLink from "next/link";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  const [{ fetching: logoutFetch }, logout] = useLogoutMutation();
  let body = null;

  // data is loading
  if (fetching) {
    body = <p>loading</p>;

    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );

    // user is logged in
  } else {
    body = (
      <Flex>
        <Box mr={4}>
          <p>{data.me.username}</p>
        </Box>
        <Button isLoading={logoutFetch} onClick={() => logout()} variant="link">
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
