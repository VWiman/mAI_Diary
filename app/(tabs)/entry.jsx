import { useEffect, useState } from "react";
import { SafeAreaView, View, useWindowDimensions } from "react-native";
import { Button, TextInput, useTheme, Text } from "react-native-paper";
import DismissKeyboard from "../../components/dismissKeyboard";
import { useContext } from "react";
import { ApiContext } from "../../context/apiContext";
import { Spinner } from "../../components/spinner";

export default function Entry() {
	const theme = useTheme();
	const { width, height } = useWindowDimensions();
	const [isFetching, setIsFetching] = useState(false);
	const { apiKey, apiResponse, setApiResponse } = useContext(ApiContext);
	const [title, setTitle] = useState("");
	const [text, setText] = useState("");
	const [message, setMessage] = useState("");
	const [displayResult, setDisplayResult] = useState("");

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
							content:
								"You are ghostwriting a diary. The user will provide details about their day, and your task is to transform these details into a literary, elegant diary entry.",
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
		handleSend();
	}

	return (
		<SafeAreaView>
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
						label="Title"
						value={title}
						onChangeText={(title) => setTitle(title)}
					/>
					<TextInput
						style={{ minWidth: "100%" }}
						autoCapitalize="sentences"
						mode="outlined"
						multiline
						numberOfLines={12}
						label="Entry"
						maxLength={420}
						value={text}
						onChangeText={(text) => {
							setMessage(text);
							setText(text);
						}}
					/>
					<Button style={{ width: 125 }} mode="contained" onPress={handleSubmit} disabled={isFetching}>
						{isFetching ? <Spinner theme={theme} /> : "Submit"}
					</Button>
					<Text>Response: {displayResult ? displayResult : "None"}</Text>
				</View>
			</DismissKeyboard>
		</SafeAreaView>
	);
}
