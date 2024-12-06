import prisma from "../DB/db.config.js";

export const createProfile = async (req, res) => {
    const { userId } = req;
    const { firstName, lastName, dateOfBirth, gender, address, about, userType, longitude, latitude } = req.body;

    // Log the incoming data in a readable format
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    // Ensure all required fields are present
    if (!req.file || !firstName || !lastName || !dateOfBirth || !gender || !address || !about || !userType || !longitude || !latitude) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Format the date to ISO 8601
        const formattedDateOfBirth = new Date(dateOfBirth).toISOString();

        // Convert longitude and latitude to Float
        const longitudeFloat = parseFloat(longitude);
        const latitudeFloat = parseFloat(latitude);

        // Ensure the conversion is successful
        if (isNaN(longitudeFloat) || isNaN(latitudeFloat)) {
            return res.status(400).json({ message: "Invalid longitude or latitude value" });
        }

        // Find the user
        const checkUser = await prisma.user.findFirst({
            where: { id: userId },
        });

        if (!checkUser) {
            return res.status(400).json({ message: "User doesn't exist" });
        }

        // Create the profile
        const createProfile = await prisma.profile.create({
            data: {
                profileImage: req.file.path, // Make sure file path is correct
                firstName,
                lastName,
                dateOfBirth: formattedDateOfBirth,
                gender,
                address,
                about,
                userType,
                longitude: longitudeFloat,
                latitude: latitudeFloat,
                userId: userId,
            },
        });

        return res.status(200).json({ message: "Profile created successfully", createProfile });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Server Error", error: error.message });
    }
};
