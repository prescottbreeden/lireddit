import React, { FC } from "react";
import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { useMeQuery } from "../generated/graphql";
import NextLink from "next/link";

interface NavBarProps {}

export const NavBar: FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  // data is loading
  if (fetching) {
    body = <p>loading</p>;

    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">Register</Link>
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
        <Button variant="link">Logout</Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
