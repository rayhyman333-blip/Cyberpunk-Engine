// Find your campaign generation route (likely app.post("/api/campaigns"))
app.post("/api/campaigns", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  // THE ENFORCEMENT: Check the DB status we just created
  if (!req.user.active || req.user.plan !== "agency") {
    return res.status(403).json({ 
      error: "Subscription Required", 
      message: "Please activate your engine to generate campaigns." 
    });
  }

  // ... proceed to Gemini AI logic
});

