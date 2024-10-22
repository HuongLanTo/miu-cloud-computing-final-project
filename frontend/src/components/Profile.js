import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Avatar,
  Button,
  Box,
  Snackbar,
  Alert,
  Modal,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

function Profile() {
  const [profile, setProfile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false); 
  const [fetchError, setFetchError] = useState(false); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("token", `Bearer ${token}`);
        const response = await axios.get(
          `${REACT_APP_API_URL}/profile`, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Profile RESPONSE DATA:::"+response.data);
        setProfile(response.data);
        setFetchError(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setFetchError(true); 
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${REACT_APP_API_URL}/upload-image`,
        {
          fileName: imageFile.name,
          email: profile.email,
          contentType: imageFile.type
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { preSignedUrl } = response.data;

      // Upload the image to the pre-signed URL
      await axios.put(preSignedUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type,
        },
      });

      const updatedResponse = await axios.get(
        `${REACT_APP_API_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile(updatedResponse.data);
      setSnackbarMessage("Image uploaded successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      setSnackbarMessage("Error uploading image. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      setImageFile(null);
      setImagePreview(null); 
      setModalOpen(false); 
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    // Create a preview of the uploaded image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/login"); 
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {fetchError ? (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: "red" }}>
              Error fetching profile. Please log in again.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")} 
            >
              Go to Login
            </Button>
          </>
        ) : (
          profile && (
            <>
              <Avatar
                alt={profile.profileName}
                src={profile.imageUrl} 
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h6">Name: {profile.profileName}</Typography>
              <Typography variant="h6">Email: {profile.email}</Typography>

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => setModalOpen(true)} 
              >
                Update Profile Image
              </Button>

              <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Upload New Profile Image
                  </Typography>
                  <TextField
                    type="file"
                    onChange={handleFileChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    inputProps={{ accept: "image/*" }}
                  />
                  {imagePreview && (
                    <Avatar
                      src={imagePreview}
                      alt="Preview"
                      sx={{ width: 100, height: 100, mb: 2 }}
                    />
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleImageUpload}
                    disabled={uploading}
                    fullWidth
                  >
                    {uploading ? "Uploading..." : "Save"}
                  </Button>
                </Box>
              </Modal>

              <Button
                variant="outlined"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={handleLogout} 
              >
                Logout
              </Button>
            </>
          )
        )}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;
