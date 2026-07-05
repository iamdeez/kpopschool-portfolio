import { useEffect } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../firebase/auth";

export function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    signOut().finally(() => navigate("/"));
  }, [navigate]);

  return (
    <Box p={8} textAlign="center">
      <Spinner />
    </Box>
  );
}
