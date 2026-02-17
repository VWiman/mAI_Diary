import { useContext, useEffect, useState } from "react";
import { Keyboard, SafeAreaView, View, useWindowDimensions } from "react-native";
import { Button, TextInput, useTheme, SegmentedButtons, Text } from "react-native-paper";
import DismissKeyboard from "../../components/dismissKeyboard";
import { ApiContext } from "../../context/apiContext";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";

export default function Entry() {
	const theme = useTheme();
	const { width, height } = useWindowDimensions();
	const [isFetching, setIsFetching] = useState(false);
	const { apiKey, weatherApiKey, apiResponse, setApiResponse, displayResult, setDisplayResult, setImageApiResponse } =
		useContext(ApiContext);
	const [mood, setMood] = useState("");
	const [text, setText] = useState("");
	const [lat, setLat] = useState(null);
	const [lon, setLon] = useState(null);
	const [hasLocation, setHasLocation] = useState(false);
	const [locationDetails, setLocationDetails] = useState({ region: "", country: "" });
	const [weather, setWeather] = useState("");
	const [imageGenerating, setImageGenerating] = useState(false);
	const [message, setMessage] = useState("");
	const [name, setName] = useState("");
	const dateTime = new Date().toDateString();
	const router = useRouter();
	const auth = getAuth();
	const user = auth.currentUser;

	useEffect(() => {
		(async () => {
			try {
				const loadedOptions = await getOptions();
				if (loadedOptions?.name) {
					setName(loadedOptions.name);
				}
			} catch (error) {
				console.error("Failed to load options:", error);
			}
		})();
	}, [user?.uid]);

	useEffect(() => {
		if (!user?.uid) {
			return;
		}

		(async () => {
			try {
				await storeOptions({ name });
			} catch (error) {
				console.error("Failed to store options:", error);
			}
		})();
	}, [name, user?.uid]);

	const storeOptions = async (userOptions) => {
		if (!user?.uid) {
			return;
		}

		const jsonOptions = JSON.stringify(userOptions);
		await AsyncStorage.setItem(user.uid, jsonOptions);
	};

	const getOptions = async () => {
		if (!user?.uid) {
			return null;
		}

		const jsonOptions = await AsyncStorage.getItem(user.uid);
		return jsonOptions != null ? JSON.parse(jsonOptions) : null;
	};

	useEffect(() => {
		let ignore = false;

		(async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					alert("Permission to access location was denied");
					return;
				}

				const location = await Location.getCurrentPositionAsync({});
				if (ignore) {
					return;
				}

				const latitude = location.coords.latitude;
				const longitude = location.coords.longitude;
				setLat(latitude);
				setLon(longitude);
				setHasLocation(true);
				await handleWeather(latitude, longitude);
			} catch (error) {
				console.error("Failed to fetch location:", error);
			}
		})();

		return () => {
			ignore = true;
		};
	}, []);

	useEffect(() => {
		setDisplayResult(apiResponse);
	}, [apiResponse, setDisplayResult]);

	useEffect(() => {
		if (displayResult && isFetching && !imageGenerating) {
			setImageGenerating(true);
			handleImage();
		}
	}, [displayResult, isFetching, imageGenerating]);

	async function handleWeather(latitude = lat, longitude = lon) {
		if (!weatherApiKey || latitude == null || longitude == null) {
			return;
		}

		try {
			const response = await fetch(
				`https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${latitude},${longitude}&days=1&aqi=no&alerts=no`
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
				setWeather(weatherRaw.toString());
				setLocationDetails({
					region: data.location?.region || data.location?.name || "Unknown region",
					country: data.location?.country || "Unknown country",
				});
			} else {
				console.error("Failed to fetch weather data:", data.error);
			}
		} catch (error) {
			console.error("Weather request failed:", error);
		}
	}

	async function handleSend() {
		if (!hasLocation) {
			alert("Still fetching your location, please wait.");
			return;
		}

		try {
			setIsFetching(true);

			const region = locationDetails.region || "Unknown region";
			const country = locationDetails.country || "Unknown country";
			const weatherSummary = weather || "Weather data unavailable.";

			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "gpt-4o",
					temperature: 0.2,
					max_tokens: 600,
					messages: [
						{
							role: "user",
							content: message,
						},
						{
							role: "system",
							content: `You are ghostwriting a diary. The user is named ${name} and will provide details about their day, and your task is to transform these details into a well written basic accurate diary entry.`,
						},
						{
							role: "system",
							content: `Context:
							Date of this entry: ${dateTime}.
							Location of this entry: ${region}.
							Country of this entry: ${country}.
							Weather for the day of this entry: ${weatherSummary}. (Only use weather for context, only mention specifics if the weather is extreme. Only include temprature if its extreme.)
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
				const parsedResponse = data.choices[0].message.content;
				setMessage("");
				setApiResponse(parsedResponse);
			} else {
				throw new Error(data.error.message || "Failed to fetch response from OpenAI");
			}
		} catch (error) {
			console.error("API request failed.", error);
			setIsFetching(false);
			setImageGenerating(false);
			setApiResponse("Failed to send message. Please try again.");
		}
	}

	async function handleImage() {
		if (!apiResponse) {
			console.error("No API response available for image generation.");
			setIsFetching(false);
			setImageGenerating(false);
			return;
		}

		const prompt = apiResponse.toString();
		const stringPrompt = prompt.slice(0, 240);
		const finalStringPrompt = stringPrompt
			? `I NEED to test how the tool works with dynamic prompts. MAKE SURE revised prompt does NOT generate TEXT or People, ONLY use prompts that AVOID that: In a style for G - General Audiences, coherent and well made detailed fine art oil painting, In the mood of ${mood} Location is ${locationDetails.country || "Unknown country"} ${stringPrompt} Weather context: ${weather}`
			: "";

		if (!finalStringPrompt) {
			console.error("No description available for image generation.");
			setIsFetching(false);
			setImageGenerating(false);
			return;
		}

		try {
			const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "dall-e-3",
					prompt: finalStringPrompt,
					n: 1,
					size: "1024x1024",
				}),
			});

			const imageData = await imageResponse.json();
			setImageApiResponse("");
			if (imageResponse.ok) {
				setIsFetching(false);
				setImageGenerating(false);
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

	function handleSubmit() {
		Keyboard.dismiss();
		handleSend();
		setText("");
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
						gap: 20,
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
						label="Name"
						maxLength={20}
						value={name}
						onChangeText={(nextName) => setName(nextName)}
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
						onChangeText={(nextText) => {
							setMessage(nextText);
							setText(nextText);
						}}
					/>
					<Text style={{ fontWeight: "700" }} variant="bodyLarge">
						Today I am feeling
					</Text>
					<SegmentedButtons
						theme={theme}
						value={mood}
						onValueChange={setMood}
						buttons={[
							{
								value: "bad",
								label: "Bad",
							},
							{
								value: "ok",
								label: "Ok",
							},
							{ value: "good", label: "Good" },
						]}
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
							disabled={isFetching || message === ""}
							loading={isFetching}>
							{isFetching ? "Loading" : "Submit"}
						</Button>
					)}
				</View>
			</DismissKeyboard>
		</SafeAreaView>
	);
}
