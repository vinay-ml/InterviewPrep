import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ServiceError = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "8px",
        backgroundColor: theme.palette.background.paper,
        maxWidth: "500px",
        margin: "60px auto",
        textAlign: "left",
        fontFamily: "monospace",
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 500, color: "text.primary" }}
      >
        503: SERVICE_UNAVAILABLE
      </Typography>

      <Typography variant="body1" sx={{ mb: 1 }}>
        Code: <code>`FREE_TIER_STORAGE_LIMIT_EXCEEDED`</code>
      </Typography>

      <Typography variant="body1" sx={{ mb: 1 }}>
        ID:
        <code>db1:clusterA::txn87-1757954511925-e5340d4396b2</code>
      </Typography>
    </Box>
  );
};

export default ServiceError;
