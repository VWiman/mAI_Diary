import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const diaryDirectory = FileSystem.documentDirectory + "diaries/";
const isWeb = Platform.OS === "web";
const canUseNativeFileSystem =
	typeof FileSystem?.documentDirectory === "string" &&
	FileSystem.documentDirectory.startsWith("file://") &&
	typeof FileSystem.getInfoAsync === "function" &&
	typeof FileSystem.writeAsStringAsync === "function";
const useAsyncStorageFallback = isWeb || !canUseNativeFileSystem;
const diaryStorageKey = (userId) => `diary:${userId}`;

const generateUniqueId = () => {
	const timestamp = new Date().getTime();
	const random = Math.floor(Math.random() * 10000);
	return `${timestamp}-${random}`;
};

const readWebDiary = async (userId) => {
	const storedDiary = await AsyncStorage.getItem(diaryStorageKey(userId));
	if (!storedDiary) {
		return { userId, entries: [] };
	}
	try {
		const parsedDiary = JSON.parse(storedDiary);
		if (!Array.isArray(parsedDiary.entries)) {
			return { userId, entries: [] };
		}
		return parsedDiary;
	} catch (error) {
		console.error("Failed to parse stored web diary:", error);
		return { userId, entries: [] };
	}
};

const writeWebDiary = async (userId, diary) => {
	await AsyncStorage.setItem(diaryStorageKey(userId), JSON.stringify(diary));
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
	if (useAsyncStorageFallback) {
		const existingDiary = await AsyncStorage.getItem(diaryStorageKey(userId));
		if (!existingDiary) {
			await writeWebDiary(userId, { userId, entries: [] });
		}
		return;
	}

	await ensureDiaryDirectoryExists();
	const filePath = diaryDirectory + `${userId}.json`;
	const file = await FileSystem.getInfoAsync(filePath);
	if (!file.exists) {
		await FileSystem.writeAsStringAsync(filePath, JSON.stringify({ userId: userId, entries: [] }));
	}
};

export const addDiaryEntry = async (userId, entry, imageUrl) => {
	if (useAsyncStorageFallback) {
		const diary = await readWebDiary(userId);
		const entryId = generateUniqueId();
		const newEntry = { id: entryId, ...entry, imagePath: imageUrl };
		diary.entries.push(newEntry);
		await writeWebDiary(userId, diary);
		return;
	}

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
	if (useAsyncStorageFallback) {
		const diary = await readWebDiary(userId);
		if (entryIndex !== -1) {
			diary.entries.splice(entryIndex, 1);
			await writeWebDiary(userId, diary);
		} else {
			console.error("Entry not found for deletion");
		}
		return;
	}

	const filePath = diaryDirectory + `${userId}.json`;
	const result = await FileSystem.readAsStringAsync(filePath);
	const diary = JSON.parse(result);
	if (entryIndex !== -1) {
		diary.entries.splice(entryIndex, 1);
		await FileSystem.writeAsStringAsync(filePath, JSON.stringify(diary));
	} else {
		console.error("Entry not found for deletion");
	}
};

export const getDiaryEntries = async (userId) => {
	if (useAsyncStorageFallback) {
		const diary = await readWebDiary(userId);
		return diary.entries;
	}

	const filePath = `${diaryDirectory}${userId}.json`;
	try {
		const file = await FileSystem.getInfoAsync(filePath);
		if (!file.exists) {
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
	if (useAsyncStorageFallback) {
		return imageUrl;
	}

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
