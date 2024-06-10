// IMPORTANT: ChatGPT used to create comments

import * as FileSystem from "expo-file-system";

// Define the directory where diary files are stored
const diaryDirectory = FileSystem.documentDirectory + "diaries/";

// Function to generate a unique identifier using a timestamp and a random number
const generateUniqueId = () => {
    const timestamp = new Date().getTime(); // Get current timestamp
    const random = Math.floor(Math.random() * 10000); // Generate a random number
    return `${timestamp}-${random}`; // Combine them to form a unique ID
};

// Ensure the diary directory exists, create if it does not
const ensureDiaryDirectoryExists = async () => {
	const dir = await FileSystem.getInfoAsync(diaryDirectory);
	if (!dir.exists) {
		await FileSystem.makeDirectoryAsync(diaryDirectory, { intermediates: true });
	} else {
		return
	}
};

// Create a new diary file for a specific user if it does not already exist
export const createDiaryFile = async (userId) => {
	await ensureDiaryDirectoryExists(); // Ensure directory exists
	const filePath = diaryDirectory + `${userId}.json`;
	const file = await FileSystem.getInfoAsync(filePath);
	if (!file.exists) {
		await FileSystem.writeAsStringAsync(filePath, JSON.stringify({ userId: userId, entries: [] }));
	}
};

// Add a new entry to a user's diary
export const addDiaryEntry = async (userId, entry, imageUrl) => {
	const filePath = `${diaryDirectory}${userId}.json`;
	const result = await FileSystem.readAsStringAsync(filePath);
	const diary = JSON.parse(result);
	// Generate a unique ID for the new entry
	const entryId = generateUniqueId(); // Use the custom ID generator
	// Save image and get local path
	const imageLocalPath = await saveImageForEntry(userId, imageUrl);
	// Add new entry with image path
	const newEntry = { id: entryId, ...entry, imagePath: imageLocalPath };
	diary.entries.push(newEntry);

	await FileSystem.writeAsStringAsync(filePath, JSON.stringify(diary));
};

// Delete a specific entry from a user's diary
export const deleteDiaryEntry = async (userId, entryIndex) => {
	 console.log("Starting delete of entry:", entryIndex, "for user", userId)
	const filePath = diaryDirectory + `${userId}.json`;
	const result = await FileSystem.readAsStringAsync(filePath);
	const diary = JSON.parse(result);
	if (diary.entries.length > entryIndex) {
		// Ensure the entry exists
		diary.entries.splice(entryIndex, 1); // Remove the entry
		console.log("entry deleted")
		await FileSystem.writeAsStringAsync(filePath, JSON.stringify(diary));
	}
};

// Clear all entries from a user's diary
export const clearAllDiaryEntries = async (userId) => {
	const filePath = diaryDirectory + `${userId}.json`;
	const diary = { userId: userId, entries: [] }; // Reset the diary entries
	await FileSystem.writeAsStringAsync(filePath, JSON.stringify(diary));
};

// Retrieve all entries from a user's diary
export const getDiaryEntries = async (userId) => {
	const filePath = diaryDirectory + `${userId}.json`;
	const result = await FileSystem.readAsStringAsync(filePath);
	const diary = JSON.parse(result);
	return diary.entries; // Return the list of entries
};

// Function to download and save an image from a URL
export const saveImageForEntry = async (userId, imageUrl) => {
	const imageName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
	const localUri = `${diaryDirectory}${userId}/${imageName}`;
	try {
		// Ensure user's directory exists
		const userDir = `${diaryDirectory}${userId}/`;
		const dir = await FileSystem.getInfoAsync(userDir);
		if (!dir.exists) {
			await FileSystem.makeDirectoryAsync(userDir, { intermediates: true });
		}
		// Download and save the image
		const download = await FileSystem.downloadAsync(imageUrl, localUri);
		if (download.status === 200) {
			return download.uri; // Return local URI of the image
		} else {
			throw new Error("Failed to download image");
		}
	} catch (error) {
		console.error("Error saving image for entry:", error);
		throw error;
	}
};
