import { Box, Typography, Button } from "@mui/material";

const ServiceError = () => {
  return (
    <Box
      sx={{
        p: 3,
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        backgroundColor: "#fff",
        maxWidth: "700px",
        margin: "60px auto",
        textAlign: "left",
        fontFamily: "monospace",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 500, color: "#333" }}
      >
        503: SERVICE_UNAVAILABLE
      </Typography>

      <Typography variant="body1" sx={{ mb: 1 }}>
        Code: <code>FREE_TIER_STORAGE_LIMIT_EXCEEDED</code>
      </Typography>

      <Typography variant="body1" sx={{ mb: 1 }}>
        ID:
        <code>db1:clusterA::txn87-1757954511925-e5340d4396b2</code>
      </Typography>
    </Box>
  );
};

export default ServiceError;
