import prisma from "../DB/db.config.js";
export const createProfile = async (req, res) => {
    const { userId } = req;
    const { firstName, lastName, dateOfBirth, gender, address, about, userType, longitude, latitude } = req.body;
  
    // Ensure all fields are present
    if (!req.file || !firstName || !lastName || !dateOfBirth || !gender || !address || !about || !userType || !longitude || !latitude) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      // Format the date to ISO 8601
      const formattedDateOfBirth = new Date(dateOfBirth).toISOString();
  
      // Find the user
      const checkUser = await prisma.user.findFirst({
        where: { id: userId },
      });
  
      if (!checkUser) {
        return res.status(400).json({ message: "User doesn't exist" });
      }
  
      // Create the profile with the uploaded image
      const createProfile = await prisma.profile.create({
        data: {
          profileImage: req.file.path,  // Store the file path
          firstName,
          lastName,
          dateOfBirth: formattedDateOfBirth,
          gender,
          address,
          about,
          userType,
          longitude,
          latitude,
          userId: userId,
        },
      });
  
      return res.status(200).json({ message: "Profile created successfully", createProfile });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Server Error", error: error.message });
    }
  };
  