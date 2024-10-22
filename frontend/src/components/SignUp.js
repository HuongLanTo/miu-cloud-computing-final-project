import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Avatar,
  Grid,
  Box,
  Snackbar,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate(); 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);

    // Create a preview of the uploaded image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uploadImage = async () => {
      const uploadResponse = await axios.post(
        `${REACT_APP_API_URL}/signup`,
        {
          filename: profileImage.name,
          contentType: profileImage.type,
          email,
          password,
          profileName: name,
        }
      );
      return uploadResponse.data.uploadURL; 
    };

    try {
      const uploadURL = await uploadImage();

      // Now, upload the actual image file
      await axios.put(uploadURL, profileImage, {
        headers: {
          "Content-Type": profileImage.type,
        },
      });

      console.log("Signup successful!");
      setSnackbarMessage("Signup successful! Please log in.");
      setSnackbarOpen(true);

      setEmail("");
      setPassword("");
      setName("");
      setProfileImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Signup failed:", error);
      setSnackbarMessage("Signup failed. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                Upload Profile Image
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Grid>
            {imagePreview && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="body1">Image Preview:</Typography>
                <Avatar
                  src={imagePreview}
                  alt="Profile Image Preview"
                  sx={{ width: 56, height: 56, mt: 1 }}
                />
              </Grid>
            )}
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{ mt: 1 }}
            onClick={() => navigate("/login")}
          >
            Already have an account? Log In
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default SignUp;
