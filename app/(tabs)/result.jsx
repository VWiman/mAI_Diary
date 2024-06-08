import { useContext, useEffect } from "react";
import { SafeAreaView, ScrollView, View, useWindowDimensions } from "react-native";
import { Button, Divider, Surface, Text, useTheme } from "react-native-paper";
import { ApiContext } from "../../context/apiContext";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { Image } from "expo-image";
import { addDiaryEntry, getDiaryEntries } from "../../utilities/diaryManager";
import { DiaryContext } from "../../context/diaryContext";

export default function Result() {
	const { setEntries } = useContext(DiaryContext);
	const theme = useTheme();
	const { width } = useWindowDimensions();
	const { displayResult, setDisplayResult, imageApiResponse, setImageApiResponse } = useContext(ApiContext);
	const imageSize = width * 0.85;
	const dateTime = new Date().toDateString();
	const blurhash =
		"|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
	
	useEffect(() => {
		console.log("Image API Response set", imageApiResponse);
		return () => {
			console.log("Component unmounting or re-rendering, current image API Response", imageApiResponse);
			// Optionally clear the imageApiResponse here if it's the correct place to do so
		};
	}, [imageApiResponse]);

	async function handleSaveEntry() {
		const auth = getAuth();
		const user = auth.currentUser;
		if (user && displayResult && imageApiResponse) {
			const entry = {
				title: dateTime,
				text: displayResult,
			};
			try {
				await addDiaryEntry(user.uid, entry, imageApiResponse);
				console.log(entry)
				alert("Entry saved!");
				const updatedEntries = await getDiaryEntries(user.uid);
				setEntries(updatedEntries);
				router.navigate("/");
				setDisplayResult("");
			} catch (error) {
				console.error("Error saving entry:", error);
				alert("Failed to save entry.");
			}
		} else {
			alert("No user is logged in or data is missing.");
		}
	}

	return (
		<SafeAreaView
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
			}}>
			<ScrollView style={{ flex: 1, minWidth: "100%", padding: width / 25 }}>
				<Surface
					elevation={2}
					style={{
						backgroundColor: theme.colors.surfaceVariant,
						gap: 20,
						padding: 15,
						justifyContent: "center",
						alignItems: "center",
						marginBottom: 80,
						borderRadius: 5,
					}}>
					<Image
						source={imageApiResponse}
						placeholder={{ blurhash }}
						contentFit="contain"
						style={{ width: imageSize, height: imageSize, borderRadius: 5 }}
						transition={1000}
					/>
					<Divider bold style={{ width: "100%" }} />
					<Text style={{ paddingHorizontal: 5 }}>{displayResult}</Text>
				</Surface>
			</ScrollView>

			<View
				style={{
					position: "absolute",
					bottom: 10,
					width: "100%",
					backgroundColor: "rgba(255, 255, 255, 0)",
					justifyContent: "center",
					alignItems: "center",
					height: 50,
					flexDirection: "row",
					gap: 10,
				}}>
				<Button
					onPress={() => {
						handleSaveEntry();
					}}
					style={{ width: 125 }}
					mode="contained"
					disabled={!displayResult}>
					Save
				</Button>
				<Button
					onPress={() => {
						setDisplayResult(""), setImageApiResponse(null), router.navigate("/entry");
					}}
					style={{ width: 125 }}
					mode="contained"
					disabled={!displayResult}>
					Dismiss
				</Button>
			</View>
		</SafeAreaView>
	);
}
