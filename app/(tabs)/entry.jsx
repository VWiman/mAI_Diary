import { useEffect, useState } from "react";
import { SafeAreaView, View, useWindowDimensions } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";
import DismissKeyboard from "../../components/dismissKeyboard";
import { useContext } from "react";
import { ApiContext } from "../../context/apiContext";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

export default function Entry() {
	const theme = useTheme();
	const { width, height } = useWindowDimensions();
	const [isFetching, setIsFetching] = useState(false);
	const { apiKey, apiResponse, setApiResponse, displayResult, setDisplayResult } = useContext(ApiContext);
	const [mood, setMood] = useState("");
	const [text, setText] = useState("");
	const [message, setMessage] = useState("");
	const dateTime = new Date().toDateString();
	const router = useRouter();

	const [adress, setAdress] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
				alert(errorMsg);
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			let adress = await Location.reverseGeocodeAsync(location.coords);
			setAdress(adress);
			console.log(adress);
		})();
	}, []);

	useEffect(() => {
		setDisplayResult(apiResponse);
	}, [apiResponse]);

	async function handleSend() {
		try {
			setIsFetching(true);
			console.log("Is sending...");
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "gpt-4o",
					temperature: 0.5,
					max_tokens: 400,
					messages: [
						{
							role: "user",
							content: message,
						},
						{
							role: "system",
							content: `You are ghostwriting a diary. The user will provide details about their day, and your task is to transform these details into a well written basic diary entry. For context the date and time of this entry ${dateTime} and location is ${adress[0].subregion} ${adress[0].country}. You only return the entry, do not format it in any way. Do not include any header. Just plain text entry. Even if the user provided information is short, you still provide an entry. The prevailing feeling today was ${mood}. Then max 4 paragraphs.`,
						},
					],
				}),
			});

			const data = await response.json();

			if (response.ok) {
				console.log("Got response");
				const parsedResponse = data.choices[0].message.content;
				console.log(parsedResponse);
				setMessage("");
				setApiResponse(parsedResponse);
			} else {
				throw new Error(data.error.message || "Failed to fetch response from OpenAI");
			}
		} catch (error) {
			console.error("API request failed.");
			setApiResponse("Failed to send message. Please try again.");
		} finally {
			setIsFetching(false);
			console.log(apiResponse);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		console.log(dateTime);
		handleSend();
	}

	function handleDisplayResult() {
		router.navigate("result");
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<DismissKeyboard>
				<View
					style={{
						flex: 1,
						width: "100%",
						paddingHorizontal: width / 10,
						paddingVertical: height / 30,
						gap: 10,
						alignItems: "center",
						backgroundColor: theme.colors.background,
					}}>
					<TextInput
						style={{
							minWidth: "100%",
							backgroundColor: theme.colors.background,
						}}
						autoCapitalize="sentence"
						mode="flat"
						label="Mood"
						placeholder="How did you feel today?"
						maxLength={20}
						value={mood}
						onChangeText={(mood) => setTitle(mood)}
					/>
					<TextInput
						style={{
							minWidth: "100%",
							backgroundColor: theme.colors.background,
						}}
						textAlignVertical="center"
						label={"New entry"}
						placeholder="What happened today?"
						autoCapitalize="sentences"
						mode="outlined"
						multiline
						numberOfLines={4}
						maxLength={400}
						keyboardType="twitter"
						value={text}
						onChangeText={(text) => {
							setMessage(text);
							setText(text);
						}}
					/>
					{displayResult ? (
						<Button style={{ width: 125 }} mode="contained" onPress={handleDisplayResult} disabled={!displayResult}>
							See result
						</Button>
					) : (
						<Button
							style={{ width: 125 }}
							mode="contained"
							onPress={handleSubmit}
							disabled={isFetching}
							loading={isFetching}>
							{isFetching ? "Loading" : "Submit"}
						</Button>
					)}
				</View>
			</DismissKeyboard>
		</SafeAreaView>
	);
}
