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
	const { apiKey, weatherApiKey, apiResponse, setApiResponse, displayResult, setDisplayResult, setImageApiResponse } =
		useContext(ApiContext);
	const [mood, setMood] = useState("");
	const [text, setText] = useState("");
	const [lat, setLat] = useState(0);
	const [lon, setLon] = useState(0);
	const [weather, setWeather] = useState("");
	const [imageGenerating, setImageGenerating] = useState(false);
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
			console.log(location);
			setLat(location.coords.latitude);
			setLon(location.coords.longitude);
			let adress = await Location.reverseGeocodeAsync(location.coords);
			setAdress(adress);
			console.log(adress);
		})();
	}, []);

	useEffect(() => {
		if (adress) {
			handleWeather();
		}
	}, [adress]);

	useEffect(() => {
		setDisplayResult(apiResponse);
	}, [apiResponse]);

	useEffect(() => {
		if (displayResult && isFetching && !imageGenerating) {
			setImageGenerating(true);
			handleImage();
		}
	}, [displayResult, isFetching]);

	async function handleWeather() {
		try {
			const response = await fetch(
				`http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${lat},${lon}&days=1&aqi=no&alerts=no`
			);

			const data = await response.json();

			if (response.ok) {
				const parsedResponse = data.forecast.forecastday[0].day;
				const maxTemp = parsedResponse.maxtemp_c;
				const avgTemp = parsedResponse.avgtemp_c;
				const conditions = parsedResponse.condition.text;
				const totalPrecipitation = parsedResponse.totalprecip_mm;
				const maxWind = parsedResponse.maxwind_kph;
				const weatherRaw = `Weather today was overall ${conditions}. Max temp was ${maxTemp} degrees celcius. Average temp was ${avgTemp} degrees celcius. Total precipitation today was ${totalPrecipitation} mm. Max wind today was ${maxWind} kph.`;
				const weatherString = weatherRaw.toString();
				setWeather(weatherString);
			} else {
				console.error("Failed to fetch weather data:", data.error);
			}
		} catch (error) {
			console.error("API request failed.", error);
		}
	}

	async function handleSend() {
		if (!adress || adress.length === 0) {
			alert("Still fetching your location, please wait.");
			return;
		}

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
					temperature: 0.2,
					max_tokens: 500,
					messages: [
						{
							role: "user",
							content: message,
						},
						{
							role: "system",
							content:
								"You are ghostwriting a diary. The user will provide details about their day, and your task is to transform these details into a well written basic diary entry.",
						},

						{
							role: "system",
							content: `Context: 
							Date of this entry: ${dateTime}. 
							Location of this entry: ${adress[0].subregion}.
							Country of this entry: ${adress[0].country}.
							Weather for the day of this entry: ${weather}. (Only use weather for context, only mention specifics if the weather is extreme. Only include temprature if its extreme.)
							The users prevailing mood today was ${mood}. (Only let mood influence output a little bit as it is overall and not specific to any one event.)`,
						},
						{
							role: "system",
							content:
								"You only return the entry, do not format it in any way. Do not include any header or title. Just plain text entry. Even if the users provided amount of information is short, you still provide an entry. Max 4 paragraphs. IMPORTANT! Do NOT make up events.",
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
			console.error("API request failed.", error);
			setApiResponse("Failed to send message. Please try again.");
		} finally {
			console.log(apiResponse);
		}
	}

	async function handleImage() {
		if (!apiResponse) {
			console.error("No API response available for image generation.");
			return;
		}

		const prompt = apiResponse.toString();
		const stringPrompt = prompt.slice(0, 160);
		const finalStringPrompt = stringPrompt
			? "I NEED to test how the tool works with dynamic prompts. MAKE SURE revised prompt does NOT generate TEXT or NUMBERS: In a style for G – General Audiences, coherent and well made detailed fine art oil painting, In the mood of " +
			  mood +
			  " Location is " +
			  adress[0].country +
			  " " +
			  stringPrompt +
			  " Weather context: " +
			  weather
			: "";

		if (!finalStringPrompt) {
			console.error("No description available for image generation.");
			return;
		}

		console.log(finalStringPrompt);

		try {
			const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "dall-e-3",
					prompt: stringPrompt,
					n: 1,
					size: "1024x1024",
				}),
			});

			const imageData = await imageResponse.json();
			setImageApiResponse("");
			if (imageResponse.ok) {
				setIsFetching(false);
				setImageGenerating(false);
				console.log(imageData);
				setImageApiResponse(imageData.data[0].url);
			} else {
				setIsFetching(false);
				setImageGenerating(false);
				throw new Error(imageData.error.message || "Failed to fetch image from OpenAI");
			}
		} catch (error) {
			setIsFetching(false);
			setImageGenerating(false);
			console.error("Image API request failed:", error);
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
						onChangeText={(mood) => setMood(mood)}
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

					{displayResult && !isFetching ? (
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
