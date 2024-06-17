import * as FileSystem from "expo-file-system";

const diaryDirectory = FileSystem.documentDirectory + "diaries/";

const generateUniqueId = () => {
	const timestamp = new Date().getTime();
	const random = Math.floor(Math.random() * 10000);
	return `${timestamp}-${random}`;
};

const ensureDiaryDirectoryExists = async () => {
	const dir = await FileSystem.getInfoAsync(diaryDirectory);
	if (!dir.exists) {
		await FileSystem.makeDirectoryAsync(diaryDirectory, { intermediates: true });
	} else {
		return;
	}
};

export const createDiaryFile = async (userId) => {
	await ensureDiaryDirectoryExists();
	const filePath = diaryDirectory + `${userId}.json`;
	const file = await FileSystem.getInfoAsync(filePath);
	if (!file.exists) {
		await FileSystem.writeAsStringAsync(filePath, JSON.stringify({ userId: userId, entries: [] }));
	}
};

export const addDiaryEntry = async (userId, entry, imageUrl) => {
	const filePath = `${diaryDirectory}${userId}.json`;
	const result = await FileSystem.readAsStringAsync(filePath);
	const diary = JSON.parse(result);
	const entryId = generateUniqueId();
	const imageLocalPath = await saveImageForEntry(userId, imageUrl);
	const newEntry = { id: entryId, ...entry, imagePath: imageLocalPath };
	diary.entries.push(newEntry);

	await FileSystem.writeAsStringAsync(filePath, JSON.stringify(diary));
};

export const deleteDiaryEntry = async (userId, entryIndex) => {
	console.log("Starting delete of entry:", entryIndex, "for user", userId);
	const filePath = diaryDirectory + `${userId}.json`;
	const result = await FileSystem.readAsStringAsync(filePath);
	const diary = JSON.parse(result);
	if (entryIndex !== -1) {
		diary.entries.splice(entryIndex, 1);
		console.log("Entry deleted:", entryIndex);
		await FileSystem.writeAsStringAsync(filePath, JSON.stringify(diary));
	} else {
		console.error("Entry not found for deletion");
	}
};

export const getDiaryEntries = async (userId) => {
	const filePath = `${diaryDirectory}${userId}.json`;
	try {
		const file = await FileSystem.getInfoAsync(filePath);
		if (!file.exists) {
			console.log(`No diary file found for user ${userId}, initializing new diary.`);
			await createDiaryFile(userId);
			return [];
		} else {
			const result = await FileSystem.readAsStringAsync(filePath);
			const diary = JSON.parse(result);
			return diary.entries;
		}
	} catch (error) {
		console.error(`Error retrieving diary entries for user ${userId}:`, error);
		throw error; // Rethrow or handle the error as needed
	}
};

export const saveImageForEntry = async (userId, imageUrl) => {
	const imageName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
	const localUri = `${diaryDirectory}${userId}/${imageName}`;
	try {
		const userDir = `${diaryDirectory}${userId}/`;
		const dir = await FileSystem.getInfoAsync(userDir);
		if (!dir.exists) {
			await FileSystem.makeDirectoryAsync(userDir, { intermediates: true });
		}
		const download = await FileSystem.downloadAsync(imageUrl, localUri);
		if (download.status === 200) {
			return download.uri;
		} else {
			throw new Error("Failed to download image");
		}
	} catch (error) {
		console.error("Error saving image for entry:", error);
		throw error;
	}
};
