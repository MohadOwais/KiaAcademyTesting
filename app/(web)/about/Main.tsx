"use client";
import React from "react";
import { Grid, Typography, Container, Box, Button } from "@mui/material";
import { useSelector } from "react-redux";

const AboutUs = () => {
  const isLogin = useSelector((state: any) => state?.isLogin)

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            color: "primary.main",
          }}
        >
          About KI Academy
        </Typography>
        <Typography
          variant="h6"
          component="p"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "1rem", md: "1.25rem" },
            maxWidth: "60%",
            mx: "auto",
          }}
        >
          Empowering learners through quality education and training
        </Typography>
      </Box>

      {/* Mission Section */}
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src="https://st3.depositphotos.com/14431644/34729/i/450/depositphotos_347298024-stock-photo-conceptual-hand-writing-showing-our.jpg"
            alt="Our Mission"
            sx={{
              width: "100%",
              borderRadius: "12px",
              boxShadow: 4,
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              color: "primary.dark",
            }}
          >
            Our Mission
          </Typography>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: { xs: "1rem", md: "1.125rem" },
              color: "text.secondary",
            }}
          >
            At KI Academy, our mission is to provide learners with high-quality,
            accessible educational resources that foster professional growth and
            career success. We strive to create an inclusive learning environment
            where students can achieve their fullest potential.
          </Typography>
        </Grid>
      </Grid>

      {/* Values Section */}
      <Grid container spacing={4} alignItems="center" sx={{ mt: 8 }}>
        <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              color: "primary.dark",
            }}
          >
            Our Values
          </Typography>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: { xs: "1rem", md: "1.125rem" },
              color: "text.secondary",
            }}
          >
            We believe in fostering a culture of continuous learning, innovation,
            and collaboration. Our team is dedicated to providing tools and
            resources that support students in achieving their career goals and
            staying competitive in today’s dynamic workforce.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
          <Box
            component="img"
            src="/images/GettyImages-170036830.jpg"
            alt="Our Values"
            sx={{
              width: "100%",
              borderRadius: "12px",
              boxShadow: 4,
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Call to Action */}
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: "1.75rem", md: "2.25rem" },
            color: "primary.main",
          }}
        >
          Join KI Academy Today!
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: "text.secondary",
            fontSize: { xs: "1rem", md: "1.125rem" },
          }}
        >
          Start your journey with us and unlock a world of learning opportunities.
        </Typography>
        {
          isLogin ? null :
            <Button
              href="/auth"
              variant="contained"
              color="secondary"
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: "8px",
                fontSize: { xs: "0.9rem", md: "1rem" },
                "&:hover": {
                  backgroundColor: "#0056b3",
                },
              }}
            >
              Enroll Now
            </Button>
        }
      </Box>
    </Container>
  );
};

export default AboutUs;
